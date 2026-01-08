"""
ETL Pipeline for UK Yellow Lines Database
Ingests data from D-TRO API and alternative sources
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum
import json

from sqlalchemy import create_engine, select, and_
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import insert
from geoalchemy2.shape import from_shape
from shapely.geometry import shape
from shapely import wkt

from ..api.dtro_client import DTROClient, DTROParser, create_dtro_client
from ..models.schema import (
    Base, TrafficAuthority, TrafficRegulationOrder, Provision,
    ProvisionGeometry, TimePeriod, Exemption, DataSyncLog,
    RestrictionType, LineMarkingType, OrderStatus
)

logger = logging.getLogger(__name__)


class SyncStatus(str, Enum):
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"


@dataclass
class SyncStats:
    """Statistics for a sync operation"""
    records_fetched: int = 0
    records_created: int = 0
    records_updated: int = 0
    records_deleted: int = 0
    errors_count: int = 0
    errors: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class ETLConfig:
    """Configuration for the ETL pipeline"""
    database_url: str
    dtro_api_key: str
    dtro_environment: str = "production"
    batch_size: int = 100
    max_concurrent_authorities: int = 5
    retry_failed_after_hours: int = 24
    full_sync_interval_days: int = 7


class YellowLinesETL:
    """
    Main ETL Pipeline for UK Yellow Lines Data

    Handles:
    1. Full sync from D-TRO API
    2. Incremental sync (changes since last sync)
    3. Authority-specific sync
    4. Error handling and retry logic
    """

    def __init__(self, config: ETLConfig):
        self.config = config
        self.engine = create_engine(config.database_url)
        self.Session = sessionmaker(bind=self.engine)
        self.dtro_client = create_dtro_client(
            api_key=config.dtro_api_key,
            environment=config.dtro_environment
        )

    def init_database(self):
        """Initialize database schema"""
        Base.metadata.create_all(self.engine)
        logger.info("Database schema initialized")

    # =========================================================================
    # Main Sync Operations
    # =========================================================================

    async def full_sync(self) -> SyncStats:
        """
        Perform a full sync of all authorities

        This fetches all D-TROs from all registered authorities.
        Use sparingly - prefer incremental_sync for regular updates.
        """
        logger.info("Starting full sync of all authorities")
        stats = SyncStats()

        async with self.dtro_client as client:
            # First, sync the list of authorities
            await self._sync_authorities(client)

            # Get all authorities that are D-TRO enabled
            with self.Session() as session:
                authorities = session.query(TrafficAuthority).filter(
                    TrafficAuthority.dtro_enabled == True
                ).all()

            logger.info(f"Found {len(authorities)} D-TRO enabled authorities")

            # Sync each authority
            for authority in authorities:
                try:
                    authority_stats = await self._sync_authority(
                        client, authority.code
                    )
                    stats.records_fetched += authority_stats.records_fetched
                    stats.records_created += authority_stats.records_created
                    stats.records_updated += authority_stats.records_updated
                    stats.errors_count += authority_stats.errors_count
                    stats.errors.extend(authority_stats.errors)
                except Exception as e:
                    logger.error(f"Failed to sync authority {authority.code}: {e}")
                    stats.errors_count += 1
                    stats.errors.append({
                        "authority": authority.code,
                        "error": str(e)
                    })

        return stats

    async def incremental_sync(
        self,
        since: Optional[datetime] = None
    ) -> SyncStats:
        """
        Sync only changes since the last sync

        Args:
            since: Datetime to sync from. If None, uses last successful sync time.
        """
        stats = SyncStats()

        # Determine sync start time
        if since is None:
            with self.Session() as session:
                last_sync = session.query(DataSyncLog).filter(
                    DataSyncLog.source == 'dtro',
                    DataSyncLog.status == 'success'
                ).order_by(DataSyncLog.completed_at.desc()).first()

                if last_sync:
                    since = last_sync.completed_at
                else:
                    # No previous sync, do full sync
                    logger.info("No previous sync found, performing full sync")
                    return await self.full_sync()

        logger.info(f"Starting incremental sync since {since}")

        async with self.dtro_client as client:
            page = 1
            while True:
                changes = await client.get_changes(
                    since=since,
                    page=page,
                    page_size=self.config.batch_size
                )

                data = changes.get("data", [])
                if not data:
                    break

                for change in data:
                    try:
                        await self._process_change(change)
                        stats.records_fetched += 1
                        if change.get("changeType") == "created":
                            stats.records_created += 1
                        elif change.get("changeType") == "updated":
                            stats.records_updated += 1
                        elif change.get("changeType") == "deleted":
                            stats.records_deleted += 1
                    except Exception as e:
                        logger.error(f"Error processing change: {e}")
                        stats.errors_count += 1
                        stats.errors.append({
                            "dtro_id": change.get("id"),
                            "error": str(e)
                        })

                total_pages = changes.get("pagination", {}).get("totalPages", 1)
                if page >= total_pages:
                    break
                page += 1

        return stats

    async def sync_authority(self, authority_code: str) -> SyncStats:
        """
        Sync a specific authority

        Args:
            authority_code: The traffic authority code (e.g., "E09000001")
        """
        async with self.dtro_client as client:
            return await self._sync_authority(client, authority_code)

    # =========================================================================
    # Internal Sync Methods
    # =========================================================================

    async def _sync_authorities(self, client: DTROClient):
        """Sync the list of traffic authorities"""
        logger.info("Syncing traffic authorities list")

        authorities = await client.get_traffic_authorities()

        with self.Session() as session:
            for auth_data in authorities:
                stmt = insert(TrafficAuthority).values(
                    code=auth_data.get("code"),
                    name=auth_data.get("name"),
                    short_name=auth_data.get("shortName"),
                    authority_type=auth_data.get("authorityType"),
                    region=auth_data.get("region"),
                    country=auth_data.get("country"),
                    dtro_enabled=auth_data.get("dtroEnabled", False),
                    dtro_registered_date=auth_data.get("registeredDate"),
                    website=auth_data.get("website"),
                    updated_at=datetime.utcnow()
                ).on_conflict_do_update(
                    index_elements=['code'],
                    set_={
                        'name': auth_data.get("name"),
                        'dtro_enabled': auth_data.get("dtroEnabled", False),
                        'updated_at': datetime.utcnow()
                    }
                )
                session.execute(stmt)

            session.commit()
            logger.info(f"Synced {len(authorities)} authorities")

    async def _sync_authority(
        self,
        client: DTROClient,
        authority_code: str,
        modified_since: Optional[datetime] = None
    ) -> SyncStats:
        """Sync all D-TROs for a specific authority"""
        stats = SyncStats()
        logger.info(f"Syncing authority: {authority_code}")

        # Create sync log entry
        sync_log = self._create_sync_log(authority_code)

        try:
            async for dtro_data in client.iterate_dtros_by_authority(
                authority_code=authority_code,
                page_size=self.config.batch_size,
                modified_since=modified_since
            ):
                try:
                    stats.records_fetched += 1
                    parsed = DTROParser.parse_dtro(dtro_data)

                    created = self._upsert_tro(parsed, authority_code)
                    if created:
                        stats.records_created += 1
                    else:
                        stats.records_updated += 1

                except Exception as e:
                    logger.error(f"Error processing D-TRO {dtro_data.get('id')}: {e}")
                    stats.errors_count += 1
                    stats.errors.append({
                        "dtro_id": dtro_data.get("id"),
                        "error": str(e)
                    })

            # Update sync log
            self._update_sync_log(sync_log, SyncStatus.SUCCESS, stats)

        except Exception as e:
            logger.error(f"Authority sync failed: {e}")
            self._update_sync_log(sync_log, SyncStatus.FAILED, stats, str(e))
            raise

        return stats

    async def _process_change(self, change: Dict[str, Any]):
        """Process a single change from the changes endpoint"""
        change_type = change.get("changeType")
        dtro_id = change.get("id")

        if change_type == "deleted":
            self._delete_tro(dtro_id)
        else:
            # For created/updated, fetch full D-TRO and upsert
            async with self.dtro_client as client:
                dtro_data = await client.get_dtro(dtro_id)
                parsed = DTROParser.parse_dtro(dtro_data)
                authority_code = parsed.get("authority_code")
                self._upsert_tro(parsed, authority_code)

    # =========================================================================
    # Database Operations
    # =========================================================================

    def _upsert_tro(self, parsed_data: Dict[str, Any], authority_code: str) -> bool:
        """
        Insert or update a Traffic Regulation Order

        Returns True if created, False if updated
        """
        with self.Session() as session:
            # Get authority
            authority = session.query(TrafficAuthority).filter(
                TrafficAuthority.code == authority_code
            ).first()

            if not authority:
                raise ValueError(f"Unknown authority: {authority_code}")

            # Check if TRO exists
            existing = session.query(TrafficRegulationOrder).filter(
                TrafficRegulationOrder.dtro_id == parsed_data["dtro_id"]
            ).first()

            is_new = existing is None

            if is_new:
                tro = TrafficRegulationOrder(
                    authority_id=authority.id,
                    dtro_id=parsed_data["dtro_id"],
                    order_reference=parsed_data["order_reference"],
                    order_title=parsed_data.get("order_title"),
                    description=parsed_data.get("description"),
                    order_type=parsed_data.get("order_type"),
                    is_temporary=parsed_data.get("is_temporary", False),
                    status=OrderStatus(parsed_data.get("status", "active")),
                    made_date=parsed_data.get("made_date"),
                    coming_into_force_date=parsed_data.get("coming_into_force_date"),
                    expiry_date=parsed_data.get("expiry_date"),
                    source="dtro",
                    raw_data=parsed_data.get("raw_data"),
                    last_synced_at=datetime.utcnow()
                )
                session.add(tro)
                session.flush()  # Get the ID
            else:
                tro = existing
                tro.order_reference = parsed_data["order_reference"]
                tro.order_title = parsed_data.get("order_title")
                tro.description = parsed_data.get("description")
                tro.status = OrderStatus(parsed_data.get("status", "active"))
                tro.made_date = parsed_data.get("made_date")
                tro.expiry_date = parsed_data.get("expiry_date")
                tro.raw_data = parsed_data.get("raw_data")
                tro.last_synced_at = datetime.utcnow()
                tro.updated_at = datetime.utcnow()

                # Delete existing provisions to replace
                session.query(Provision).filter(
                    Provision.order_id == tro.id
                ).delete()

            # Add provisions
            for prov_data in parsed_data.get("provisions", []):
                provision = self._create_provision(session, tro.id, prov_data)
                session.add(provision)

            session.commit()
            return is_new

    def _create_provision(
        self,
        session: Session,
        order_id,
        prov_data: Dict[str, Any]
    ) -> Provision:
        """Create a provision with its related objects"""

        # Map restriction type
        try:
            restriction_type = RestrictionType(prov_data.get("restriction_type", "other"))
        except ValueError:
            restriction_type = RestrictionType.OTHER

        # Map line marking
        try:
            line_marking = LineMarkingType(prov_data.get("line_marking", "other"))
        except ValueError:
            line_marking = LineMarkingType.OTHER

        provision = Provision(
            order_id=order_id,
            provision_index=prov_data.get("provision_index"),
            description=prov_data.get("description"),
            restriction_type=restriction_type,
            line_marking=line_marking,
            max_stay_minutes=prov_data.get("max_stay_minutes"),
            no_return_minutes=prov_data.get("no_return_minutes")
        )
        session.add(provision)
        session.flush()

        # Add geometry
        geom_data = prov_data.get("geometry", {})
        if geom_data:
            geometry = self._create_geometry(provision.id, geom_data)
            if geometry:
                session.add(geometry)

        # Add time periods
        for tp_data in prov_data.get("time_periods", []):
            time_period = self._create_time_period(provision.id, tp_data)
            session.add(time_period)

        # Add exemptions
        for ex_data in prov_data.get("exemptions", []):
            exemption = self._create_exemption(provision.id, ex_data)
            session.add(exemption)

        return provision

    def _create_geometry(
        self,
        provision_id,
        geom_data: Dict[str, Any]
    ) -> Optional[ProvisionGeometry]:
        """Create a geometry record from GeoJSON or WKT"""
        geometry = None
        geometry_type = None

        # Try GeoJSON first
        geojson = geom_data.get("geojson")
        if geojson:
            try:
                shapely_geom = shape(geojson)
                geometry = from_shape(shapely_geom, srid=4326)
                geometry_type = shapely_geom.geom_type.lower()
            except Exception as e:
                logger.warning(f"Failed to parse GeoJSON: {e}")

        # Fall back to WKT
        if geometry is None:
            wkt_str = geom_data.get("wkt")
            if wkt_str:
                try:
                    shapely_geom = wkt.loads(wkt_str)
                    geometry = from_shape(shapely_geom, srid=4326)
                    geometry_type = shapely_geom.geom_type.lower()
                except Exception as e:
                    logger.warning(f"Failed to parse WKT: {e}")

        if geometry is None:
            return None

        return ProvisionGeometry(
            provision_id=provision_id,
            geometry=geometry,
            geometry_type=geometry_type,
            road_name=geom_data.get("road_name"),
            usrn=geom_data.get("usrn"),
            locality=geom_data.get("locality"),
            town=geom_data.get("town"),
            side_of_road=geom_data.get("side_of_road")
        )

    def _create_time_period(
        self,
        provision_id,
        tp_data: Dict[str, Any]
    ) -> TimePeriod:
        """Create a time period record"""
        return TimePeriod(
            provision_id=provision_id,
            start_time=tp_data.get("start_time"),
            end_time=tp_data.get("end_time"),
            days_of_week=tp_data.get("days_of_week", []),
            description=tp_data.get("description"),
            is_24_hours=tp_data.get("is_24_hours", False),
            applies_on_public_holidays=tp_data.get("applies_on_public_holidays", True)
        )

    def _create_exemption(
        self,
        provision_id,
        ex_data: Dict[str, Any]
    ) -> Exemption:
        """Create an exemption record"""
        return Exemption(
            provision_id=provision_id,
            exemption_type=ex_data.get("exemption_type"),
            description=ex_data.get("description"),
            max_duration_minutes=ex_data.get("max_duration_minutes"),
            permit_zone=ex_data.get("permit_zone")
        )

    def _delete_tro(self, dtro_id: str):
        """Delete a TRO and all related records"""
        with self.Session() as session:
            tro = session.query(TrafficRegulationOrder).filter(
                TrafficRegulationOrder.dtro_id == dtro_id
            ).first()

            if tro:
                session.delete(tro)  # Cascade will handle related records
                session.commit()
                logger.info(f"Deleted TRO: {dtro_id}")

    # =========================================================================
    # Sync Logging
    # =========================================================================

    def _create_sync_log(self, authority_code: Optional[str] = None) -> DataSyncLog:
        """Create a sync log entry"""
        with self.Session() as session:
            authority_id = None
            if authority_code:
                authority = session.query(TrafficAuthority).filter(
                    TrafficAuthority.code == authority_code
                ).first()
                if authority:
                    authority_id = authority.id

            log = DataSyncLog(
                source="dtro",
                authority_id=authority_id,
                started_at=datetime.utcnow(),
                status=SyncStatus.RUNNING.value
            )
            session.add(log)
            session.commit()
            session.refresh(log)
            return log

    def _update_sync_log(
        self,
        log: DataSyncLog,
        status: SyncStatus,
        stats: SyncStats,
        error_message: Optional[str] = None
    ):
        """Update a sync log entry"""
        with self.Session() as session:
            log = session.merge(log)
            log.completed_at = datetime.utcnow()
            log.status = status.value
            log.records_fetched = stats.records_fetched
            log.records_created = stats.records_created
            log.records_updated = stats.records_updated
            log.records_deleted = stats.records_deleted
            log.errors_count = stats.errors_count
            log.error_message = error_message
            log.error_details = {"errors": stats.errors} if stats.errors else None
            session.commit()


# =========================================================================
# CLI Interface
# =========================================================================

async def run_full_sync(config: ETLConfig):
    """Run a full synchronization"""
    etl = YellowLinesETL(config)
    etl.init_database()
    stats = await etl.full_sync()
    print(f"Full sync complete: {stats}")
    return stats


async def run_incremental_sync(config: ETLConfig):
    """Run an incremental synchronization"""
    etl = YellowLinesETL(config)
    stats = await etl.incremental_sync()
    print(f"Incremental sync complete: {stats}")
    return stats


async def run_authority_sync(config: ETLConfig, authority_code: str):
    """Run sync for a specific authority"""
    etl = YellowLinesETL(config)
    stats = await etl.sync_authority(authority_code)
    print(f"Authority sync complete: {stats}")
    return stats
