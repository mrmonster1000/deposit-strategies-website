"""
FastAPI REST API for UK Yellow Lines Database
Provides endpoints to query parking restriction data
"""

from datetime import date, datetime
from typing import Optional, List
from uuid import UUID

from fastapi import FastAPI, HTTPException, Query, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, select, and_, or_, func
from sqlalchemy.orm import sessionmaker, Session
from geoalchemy2.functions import ST_DWithin, ST_AsGeoJSON, ST_MakePoint, ST_SetSRID

from ..models.schema import (
    TrafficAuthority, TrafficRegulationOrder, Provision,
    ProvisionGeometry, TimePeriod, Exemption, RestrictionType
)

import json

# ============================================================================
# Pydantic Models for API
# ============================================================================

class Coordinates(BaseModel):
    """Geographic coordinates"""
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)


class BoundingBox(BaseModel):
    """Geographic bounding box"""
    min_lon: float = Field(..., ge=-180, le=180)
    min_lat: float = Field(..., ge=-90, le=90)
    max_lon: float = Field(..., ge=-180, le=180)
    max_lat: float = Field(..., ge=-90, le=90)


class TimePeriodResponse(BaseModel):
    """Time period when restriction applies"""
    start_time: Optional[str]
    end_time: Optional[str]
    days_of_week: Optional[List[str]]
    description: Optional[str]
    is_24_hours: bool


class ExemptionResponse(BaseModel):
    """Exemption to a restriction"""
    exemption_type: str
    description: Optional[str]
    max_duration_minutes: Optional[int]


class RestrictionResponse(BaseModel):
    """A parking/waiting restriction"""
    id: str
    restriction_type: str
    line_marking: Optional[str]
    description: Optional[str]
    road_name: Optional[str]
    town: Optional[str]
    authority_name: str
    authority_code: str
    geometry: dict  # GeoJSON
    time_periods: List[TimePeriodResponse]
    exemptions: List[ExemptionResponse]
    order_reference: Optional[str]
    is_active: bool


class AuthorityResponse(BaseModel):
    """Traffic authority summary"""
    code: str
    name: str
    region: Optional[str]
    country: Optional[str]
    dtro_enabled: bool
    restriction_count: Optional[int]


class SearchResponse(BaseModel):
    """Search results"""
    total: int
    page: int
    page_size: int
    results: List[RestrictionResponse]


class StatsResponse(BaseModel):
    """Database statistics"""
    total_authorities: int
    dtro_enabled_authorities: int
    total_orders: int
    total_restrictions: int
    last_sync: Optional[datetime]
    restriction_breakdown: dict


# ============================================================================
# API Application
# ============================================================================

def create_app(database_url: str) -> FastAPI:
    """Create the FastAPI application"""

    app = FastAPI(
        title="UK Yellow Lines Database API",
        description="Query UK parking and waiting restrictions from Digital Traffic Regulation Orders",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Database setup
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    # ========================================================================
    # Endpoints
    # ========================================================================

    @app.get("/", tags=["Health"])
    async def root():
        """API health check"""
        return {"status": "ok", "service": "UK Yellow Lines Database"}

    @app.get("/stats", response_model=StatsResponse, tags=["Stats"])
    async def get_stats(db: Session = Depends(get_db)):
        """Get database statistics"""
        # Count authorities
        total_authorities = db.query(func.count(TrafficAuthority.id)).scalar()
        dtro_enabled = db.query(func.count(TrafficAuthority.id)).filter(
            TrafficAuthority.dtro_enabled == True
        ).scalar()

        # Count orders and restrictions
        total_orders = db.query(func.count(TrafficRegulationOrder.id)).scalar()
        total_restrictions = db.query(func.count(Provision.id)).scalar()

        # Restriction breakdown
        breakdown = {}
        for rt in RestrictionType:
            count = db.query(func.count(Provision.id)).filter(
                Provision.restriction_type == rt
            ).scalar()
            if count > 0:
                breakdown[rt.value] = count

        # Last sync
        from ..models.schema import DataSyncLog
        last_sync_record = db.query(DataSyncLog).filter(
            DataSyncLog.status == 'success'
        ).order_by(DataSyncLog.completed_at.desc()).first()

        return StatsResponse(
            total_authorities=total_authorities,
            dtro_enabled_authorities=dtro_enabled,
            total_orders=total_orders,
            total_restrictions=total_restrictions,
            last_sync=last_sync_record.completed_at if last_sync_record else None,
            restriction_breakdown=breakdown
        )

    @app.get("/authorities", response_model=List[AuthorityResponse], tags=["Authorities"])
    async def list_authorities(
        region: Optional[str] = None,
        dtro_enabled_only: bool = False,
        db: Session = Depends(get_db)
    ):
        """List all traffic authorities"""
        query = db.query(TrafficAuthority)

        if region:
            query = query.filter(TrafficAuthority.region == region)

        if dtro_enabled_only:
            query = query.filter(TrafficAuthority.dtro_enabled == True)

        authorities = query.order_by(TrafficAuthority.name).all()

        result = []
        for auth in authorities:
            # Count restrictions for this authority
            count = db.query(func.count(Provision.id)).join(
                TrafficRegulationOrder
            ).filter(
                TrafficRegulationOrder.authority_id == auth.id
            ).scalar()

            result.append(AuthorityResponse(
                code=auth.code,
                name=auth.name,
                region=auth.region,
                country=auth.country,
                dtro_enabled=auth.dtro_enabled,
                restriction_count=count
            ))

        return result

    @app.get("/authorities/{code}", response_model=AuthorityResponse, tags=["Authorities"])
    async def get_authority(code: str, db: Session = Depends(get_db)):
        """Get a specific traffic authority"""
        authority = db.query(TrafficAuthority).filter(
            TrafficAuthority.code == code
        ).first()

        if not authority:
            raise HTTPException(status_code=404, detail="Authority not found")

        count = db.query(func.count(Provision.id)).join(
            TrafficRegulationOrder
        ).filter(
            TrafficRegulationOrder.authority_id == authority.id
        ).scalar()

        return AuthorityResponse(
            code=authority.code,
            name=authority.name,
            region=authority.region,
            country=authority.country,
            dtro_enabled=authority.dtro_enabled,
            restriction_count=count
        )

    @app.get("/restrictions/nearby", response_model=SearchResponse, tags=["Restrictions"])
    async def find_nearby_restrictions(
        longitude: float = Query(..., ge=-180, le=180),
        latitude: float = Query(..., ge=-90, le=90),
        radius_meters: int = Query(default=100, ge=1, le=5000),
        restriction_types: Optional[List[str]] = Query(default=None),
        page: int = Query(default=1, ge=1),
        page_size: int = Query(default=20, ge=1, le=100),
        db: Session = Depends(get_db)
    ):
        """
        Find parking restrictions near a point

        Returns restrictions within the specified radius of the given coordinates.
        """
        point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)

        # Base query
        query = db.query(
            ProvisionGeometry,
            Provision,
            TrafficRegulationOrder,
            TrafficAuthority
        ).join(
            Provision, ProvisionGeometry.provision_id == Provision.id
        ).join(
            TrafficRegulationOrder, Provision.order_id == TrafficRegulationOrder.id
        ).join(
            TrafficAuthority, TrafficRegulationOrder.authority_id == TrafficAuthority.id
        ).filter(
            ST_DWithin(
                func.geography(ProvisionGeometry.geometry),
                func.geography(point),
                radius_meters
            ),
            TrafficRegulationOrder.status == 'active'
        )

        # Filter by restriction types
        if restriction_types:
            query = query.filter(
                Provision.restriction_type.in_(restriction_types)
            )

        # Count total
        total = query.count()

        # Paginate
        offset = (page - 1) * page_size
        results = query.offset(offset).limit(page_size).all()

        # Build response
        restrictions = []
        for geom, provision, order, authority in results:
            # Get time periods
            time_periods = db.query(TimePeriod).filter(
                TimePeriod.provision_id == provision.id
            ).all()

            # Get exemptions
            exemptions = db.query(Exemption).filter(
                Exemption.provision_id == provision.id
            ).all()

            # Convert geometry to GeoJSON
            geojson_str = db.execute(
                select(ST_AsGeoJSON(geom.geometry))
            ).scalar()
            geojson = json.loads(geojson_str) if geojson_str else {}

            restrictions.append(RestrictionResponse(
                id=str(provision.id),
                restriction_type=provision.restriction_type.value,
                line_marking=provision.line_marking.value if provision.line_marking else None,
                description=provision.description,
                road_name=geom.road_name,
                town=geom.town,
                authority_name=authority.name,
                authority_code=authority.code,
                geometry=geojson,
                time_periods=[
                    TimePeriodResponse(
                        start_time=str(tp.start_time) if tp.start_time else None,
                        end_time=str(tp.end_time) if tp.end_time else None,
                        days_of_week=tp.days_of_week,
                        description=tp.description,
                        is_24_hours=tp.is_24_hours
                    ) for tp in time_periods
                ],
                exemptions=[
                    ExemptionResponse(
                        exemption_type=ex.exemption_type,
                        description=ex.description,
                        max_duration_minutes=ex.max_duration_minutes
                    ) for ex in exemptions
                ],
                order_reference=order.order_reference,
                is_active=order.status.value == 'active'
            ))

        return SearchResponse(
            total=total,
            page=page,
            page_size=page_size,
            results=restrictions
        )

    @app.get("/restrictions/search", response_model=SearchResponse, tags=["Restrictions"])
    async def search_restrictions(
        road_name: Optional[str] = None,
        town: Optional[str] = None,
        authority_code: Optional[str] = None,
        restriction_types: Optional[List[str]] = Query(default=None),
        page: int = Query(default=1, ge=1),
        page_size: int = Query(default=20, ge=1, le=100),
        db: Session = Depends(get_db)
    ):
        """
        Search for parking restrictions

        Filter by road name, town, authority, or restriction type.
        """
        # Base query
        query = db.query(
            ProvisionGeometry,
            Provision,
            TrafficRegulationOrder,
            TrafficAuthority
        ).join(
            Provision, ProvisionGeometry.provision_id == Provision.id
        ).join(
            TrafficRegulationOrder, Provision.order_id == TrafficRegulationOrder.id
        ).join(
            TrafficAuthority, TrafficRegulationOrder.authority_id == TrafficAuthority.id
        ).filter(
            TrafficRegulationOrder.status == 'active'
        )

        # Apply filters
        if road_name:
            query = query.filter(
                ProvisionGeometry.road_name.ilike(f"%{road_name}%")
            )

        if town:
            query = query.filter(
                ProvisionGeometry.town.ilike(f"%{town}%")
            )

        if authority_code:
            query = query.filter(
                TrafficAuthority.code == authority_code
            )

        if restriction_types:
            query = query.filter(
                Provision.restriction_type.in_(restriction_types)
            )

        # Count total
        total = query.count()

        # Paginate
        offset = (page - 1) * page_size
        results = query.offset(offset).limit(page_size).all()

        # Build response (same as nearby endpoint)
        restrictions = []
        for geom, provision, order, authority in results:
            time_periods = db.query(TimePeriod).filter(
                TimePeriod.provision_id == provision.id
            ).all()

            exemptions = db.query(Exemption).filter(
                Exemption.provision_id == provision.id
            ).all()

            geojson_str = db.execute(
                select(ST_AsGeoJSON(geom.geometry))
            ).scalar()
            geojson = json.loads(geojson_str) if geojson_str else {}

            restrictions.append(RestrictionResponse(
                id=str(provision.id),
                restriction_type=provision.restriction_type.value,
                line_marking=provision.line_marking.value if provision.line_marking else None,
                description=provision.description,
                road_name=geom.road_name,
                town=geom.town,
                authority_name=authority.name,
                authority_code=authority.code,
                geometry=geojson,
                time_periods=[
                    TimePeriodResponse(
                        start_time=str(tp.start_time) if tp.start_time else None,
                        end_time=str(tp.end_time) if tp.end_time else None,
                        days_of_week=tp.days_of_week,
                        description=tp.description,
                        is_24_hours=tp.is_24_hours
                    ) for tp in time_periods
                ],
                exemptions=[
                    ExemptionResponse(
                        exemption_type=ex.exemption_type,
                        description=ex.description,
                        max_duration_minutes=ex.max_duration_minutes
                    ) for ex in exemptions
                ],
                order_reference=order.order_reference,
                is_active=order.status.value == 'active'
            ))

        return SearchResponse(
            total=total,
            page=page,
            page_size=page_size,
            results=restrictions
        )

    @app.get("/restrictions/bbox", tags=["Restrictions"])
    async def get_restrictions_in_bbox(
        min_lon: float = Query(..., ge=-180, le=180),
        min_lat: float = Query(..., ge=-90, le=90),
        max_lon: float = Query(..., ge=-180, le=180),
        max_lat: float = Query(..., ge=-90, le=90),
        restriction_types: Optional[List[str]] = Query(default=None),
        db: Session = Depends(get_db)
    ):
        """
        Get restrictions within a bounding box

        Returns GeoJSON FeatureCollection for map visualization.
        Limited to 1000 results - use smaller bbox for dense areas.
        """
        from geoalchemy2.functions import ST_MakeEnvelope, ST_Intersects

        bbox = ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326)

        query = db.query(
            ProvisionGeometry,
            Provision,
            TrafficAuthority.name.label('authority_name')
        ).join(
            Provision, ProvisionGeometry.provision_id == Provision.id
        ).join(
            TrafficRegulationOrder, Provision.order_id == TrafficRegulationOrder.id
        ).join(
            TrafficAuthority, TrafficRegulationOrder.authority_id == TrafficAuthority.id
        ).filter(
            ST_Intersects(ProvisionGeometry.geometry, bbox),
            TrafficRegulationOrder.status == 'active'
        )

        if restriction_types:
            query = query.filter(
                Provision.restriction_type.in_(restriction_types)
            )

        results = query.limit(1000).all()

        # Build GeoJSON FeatureCollection
        features = []
        for geom, provision, authority_name in results:
            geojson_str = db.execute(
                select(ST_AsGeoJSON(geom.geometry))
            ).scalar()

            if geojson_str:
                geometry = json.loads(geojson_str)
                features.append({
                    "type": "Feature",
                    "geometry": geometry,
                    "properties": {
                        "id": str(provision.id),
                        "restriction_type": provision.restriction_type.value,
                        "line_marking": provision.line_marking.value if provision.line_marking else None,
                        "road_name": geom.road_name,
                        "town": geom.town,
                        "authority": authority_name
                    }
                })

        return {
            "type": "FeatureCollection",
            "features": features,
            "total": len(features),
            "truncated": len(features) >= 1000
        }

    @app.get("/restrictions/{restriction_id}", response_model=RestrictionResponse, tags=["Restrictions"])
    async def get_restriction(restriction_id: str, db: Session = Depends(get_db)):
        """Get details of a specific restriction"""
        try:
            provision_uuid = UUID(restriction_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid restriction ID")

        result = db.query(
            ProvisionGeometry,
            Provision,
            TrafficRegulationOrder,
            TrafficAuthority
        ).join(
            Provision, ProvisionGeometry.provision_id == Provision.id
        ).join(
            TrafficRegulationOrder, Provision.order_id == TrafficRegulationOrder.id
        ).join(
            TrafficAuthority, TrafficRegulationOrder.authority_id == TrafficAuthority.id
        ).filter(
            Provision.id == provision_uuid
        ).first()

        if not result:
            raise HTTPException(status_code=404, detail="Restriction not found")

        geom, provision, order, authority = result

        time_periods = db.query(TimePeriod).filter(
            TimePeriod.provision_id == provision.id
        ).all()

        exemptions = db.query(Exemption).filter(
            Exemption.provision_id == provision.id
        ).all()

        geojson_str = db.execute(
            select(ST_AsGeoJSON(geom.geometry))
        ).scalar()
        geojson = json.loads(geojson_str) if geojson_str else {}

        return RestrictionResponse(
            id=str(provision.id),
            restriction_type=provision.restriction_type.value,
            line_marking=provision.line_marking.value if provision.line_marking else None,
            description=provision.description,
            road_name=geom.road_name,
            town=geom.town,
            authority_name=authority.name,
            authority_code=authority.code,
            geometry=geojson,
            time_periods=[
                TimePeriodResponse(
                    start_time=str(tp.start_time) if tp.start_time else None,
                    end_time=str(tp.end_time) if tp.end_time else None,
                    days_of_week=tp.days_of_week,
                    description=tp.description,
                    is_24_hours=tp.is_24_hours
                ) for tp in time_periods
            ],
            exemptions=[
                ExemptionResponse(
                    exemption_type=ex.exemption_type,
                    description=ex.description,
                    max_duration_minutes=ex.max_duration_minutes
                ) for ex in exemptions
            ],
            order_reference=order.order_reference,
            is_active=order.status.value == 'active'
        )

    return app
