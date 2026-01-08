"""
PostgreSQL + PostGIS Database Schema for UK Yellow Lines Database
Based on the D-TRO (Digital Traffic Regulation Orders) data model
"""

from datetime import datetime, time
from typing import Optional, List
from enum import Enum
from geoalchemy2 import Geometry
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Date, Time, Boolean,
    ForeignKey, Enum as SQLEnum, Index, Float, JSON, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid

Base = declarative_base()


# ============================================================================
# ENUMS - Based on D-TRO Data Specification
# ============================================================================

class RestrictionType(str, Enum):
    """Types of parking/waiting restrictions"""
    NO_WAITING = "no_waiting"                    # Double yellow lines
    NO_WAITING_AT_ANY_TIME = "no_waiting_at_any_time"  # Double yellow
    LIMITED_WAITING = "limited_waiting"          # Single yellow with times
    NO_LOADING = "no_loading"                    # Loading restrictions
    LIMITED_LOADING = "limited_loading"
    RESIDENTS_PARKING = "residents_parking"
    PERMIT_PARKING = "permit_parking"
    PAY_AND_DISPLAY = "pay_and_display"
    DISABLED_PARKING = "disabled_parking"
    TAXI_RANK = "taxi_rank"
    BUS_STOP = "bus_stop"
    CLEARWAY = "clearway"
    RED_ROUTE = "red_route"                      # Red lines (no stopping)
    SCHOOL_KEEP_CLEAR = "school_keep_clear"
    OTHER = "other"


class LineMarkingType(str, Enum):
    """Physical line marking types"""
    SINGLE_YELLOW = "single_yellow"
    DOUBLE_YELLOW = "double_yellow"
    SINGLE_RED = "single_red"
    DOUBLE_RED = "red_route"
    WHITE_BAY = "white_bay"
    NO_MARKING = "no_marking"
    ZIGZAG = "zigzag"
    OTHER = "other"


class OrderStatus(str, Enum):
    """Status of a Traffic Regulation Order"""
    DRAFT = "draft"
    PROPOSED = "proposed"
    MADE = "made"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REVOKED = "revoked"
    SUPERSEDED = "superseded"


class DayOfWeek(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"
    PUBLIC_HOLIDAY = "public_holiday"


# ============================================================================
# CORE TABLES
# ============================================================================

class TrafficAuthority(Base):
    """
    Traffic Regulation Authorities - Local councils that create TROs
    ~300+ authorities in England, Scotland, Wales, NI
    """
    __tablename__ = "traffic_authorities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(10), unique=True, nullable=False, index=True)  # e.g., "E09000001"
    name = Column(String(255), nullable=False)
    short_name = Column(String(100))
    authority_type = Column(String(50))  # county, unitary, metropolitan, london_borough, etc.
    region = Column(String(100))  # England, Scotland, Wales, Northern Ireland
    country = Column(String(50))

    # Geographic boundary of the authority
    boundary = Column(Geometry('MULTIPOLYGON', srid=4326))

    # Contact info
    website = Column(String(500))
    contact_email = Column(String(255))

    # D-TRO integration status
    dtro_enabled = Column(Boolean, default=False)
    dtro_registered_date = Column(DateTime)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders = relationship("TrafficRegulationOrder", back_populates="authority")

    __table_args__ = (
        Index('idx_authority_region', 'region'),
        Index('idx_authority_boundary', 'boundary', postgresql_using='gist'),
    )


class TrafficRegulationOrder(Base):
    """
    Traffic Regulation Orders (TROs) - The legal documents
    Each TRO can contain multiple provisions/restrictions
    """
    __tablename__ = "traffic_regulation_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dtro_id = Column(String(100), unique=True, index=True)  # D-TRO system ID

    # Authority reference
    authority_id = Column(UUID(as_uuid=True), ForeignKey('traffic_authorities.id'), nullable=False)

    # Order identification
    order_reference = Column(String(255), nullable=False)  # Local authority reference
    order_title = Column(String(500))
    description = Column(Text)

    # Order type
    order_type = Column(String(50))  # permanent, experimental, temporary
    is_temporary = Column(Boolean, default=False)

    # Status
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.ACTIVE)

    # Dates
    made_date = Column(Date)  # When the order was legally made
    coming_into_force_date = Column(Date)  # When restrictions start
    expiry_date = Column(Date)  # For temporary orders
    revocation_date = Column(Date)

    # Legal references
    legal_reference = Column(Text)  # Reference to legislation

    # Source tracking
    source = Column(String(50), default='dtro')  # dtro, web_scrape, manual
    source_url = Column(String(1000))
    raw_data = Column(JSON)  # Store original D-TRO JSON

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_synced_at = Column(DateTime)

    # Relationships
    authority = relationship("TrafficAuthority", back_populates="orders")
    provisions = relationship("Provision", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_tro_authority', 'authority_id'),
        Index('idx_tro_status', 'status'),
        Index('idx_tro_dates', 'coming_into_force_date', 'expiry_date'),
    )


class Provision(Base):
    """
    Individual provisions within a TRO
    Each provision defines a specific restriction (e.g., one yellow line segment)
    """
    __tablename__ = "provisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('traffic_regulation_orders.id'), nullable=False)

    # Provision identification
    provision_index = Column(Integer)  # Order within the TRO
    description = Column(Text)

    # Restriction details
    restriction_type = Column(SQLEnum(RestrictionType), nullable=False, index=True)
    line_marking = Column(SQLEnum(LineMarkingType))

    # Enforcement
    is_enforced = Column(Boolean, default=True)
    enforcement_notes = Column(Text)

    # Additional attributes
    max_stay_minutes = Column(Integer)  # For limited waiting
    no_return_minutes = Column(Integer)  # No return within X minutes

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    order = relationship("TrafficRegulationOrder", back_populates="provisions")
    geometries = relationship("ProvisionGeometry", back_populates="provision", cascade="all, delete-orphan")
    time_periods = relationship("TimePeriod", back_populates="provision", cascade="all, delete-orphan")
    exemptions = relationship("Exemption", back_populates="provision", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_provision_restriction', 'restriction_type'),
        Index('idx_provision_order', 'order_id'),
    )


class ProvisionGeometry(Base):
    """
    Spatial geometry for provisions
    Can be LineString (yellow line), Polygon (area), or Point (sign location)
    """
    __tablename__ = "provision_geometries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provision_id = Column(UUID(as_uuid=True), ForeignKey('provisions.id'), nullable=False)

    # The actual geometry - LineString for road markings, Polygon for areas
    geometry = Column(Geometry('GEOMETRY', srid=4326), nullable=False)
    geometry_type = Column(String(50))  # linestring, polygon, point

    # Location context
    road_name = Column(String(255), index=True)
    road_classification = Column(String(20))  # A, B, C, unclassified
    usrn = Column(String(20), index=True)  # Unique Street Reference Number

    # Address/location info
    locality = Column(String(255))
    town = Column(String(255), index=True)
    postcode_sector = Column(String(10), index=True)  # e.g., "SW1A 1"

    # Measurement
    length_meters = Column(Float)

    # Side of road
    side_of_road = Column(String(20))  # nearside, offside, both, centre

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    provision = relationship("Provision", back_populates="geometries")

    __table_args__ = (
        Index('idx_geometry_spatial', 'geometry', postgresql_using='gist'),
        Index('idx_geometry_road', 'road_name'),
        Index('idx_geometry_usrn', 'usrn'),
        Index('idx_geometry_town', 'town'),
    )


class TimePeriod(Base):
    """
    When restrictions apply
    Supports complex schedules like "Mon-Sat 8am-6pm except bank holidays"
    """
    __tablename__ = "time_periods"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provision_id = Column(UUID(as_uuid=True), ForeignKey('provisions.id'), nullable=False)

    # Time range
    start_time = Column(Time)
    end_time = Column(Time)

    # Days applicable
    days_of_week = Column(ARRAY(String))  # ['monday', 'tuesday', ...]

    # Date range (for seasonal restrictions)
    valid_from_date = Column(Date)
    valid_to_date = Column(Date)

    # Special conditions
    applies_on_public_holidays = Column(Boolean, default=True)
    applies_on_school_holidays = Column(Boolean, default=True)

    # Human-readable description
    description = Column(String(500))  # e.g., "Mon-Sat 8am-6pm"

    # Is this 24/7? (simplifies queries)
    is_24_hours = Column(Boolean, default=False)
    is_all_year = Column(Boolean, default=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    provision = relationship("Provision", back_populates="time_periods")

    __table_args__ = (
        Index('idx_timeperiod_provision', 'provision_id'),
    )


class Exemption(Base):
    """
    Exemptions to restrictions
    e.g., "Except permit holders", "Loading only 20 mins"
    """
    __tablename__ = "exemptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provision_id = Column(UUID(as_uuid=True), ForeignKey('provisions.id'), nullable=False)

    # Exemption type
    exemption_type = Column(String(100), nullable=False)
    # Common types: permit_holder, disabled_badge, loading, taxis, buses,
    # emergency_vehicles, residents, delivery

    description = Column(Text)

    # Time limits for exemption
    max_duration_minutes = Column(Integer)  # e.g., loading max 20 mins

    # Permit/zone info
    permit_zone = Column(String(50))

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    provision = relationship("Provision", back_populates="exemptions")


# ============================================================================
# SUPPORTING/LOOKUP TABLES
# ============================================================================

class Road(Base):
    """
    Roads master table - links to Ordnance Survey/OS MasterMap
    """
    __tablename__ = "roads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usrn = Column(String(20), unique=True, nullable=False, index=True)  # Unique Street Reference Number

    road_name = Column(String(255), nullable=False, index=True)
    road_name_alternatives = Column(ARRAY(String))  # Alternative names

    road_classification = Column(String(20))  # A, B, C, unclassified
    road_number = Column(String(20))  # e.g., "A40", "B315"

    # Authority responsible
    highway_authority_id = Column(UUID(as_uuid=True), ForeignKey('traffic_authorities.id'))

    # Full road geometry
    geometry = Column(Geometry('MULTILINESTRING', srid=4326))

    # Address info
    locality = Column(String(255))
    town = Column(String(255), index=True)
    county = Column(String(255))

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_road_geometry', 'geometry', postgresql_using='gist'),
        Index('idx_road_name_search', 'road_name'),
    )


class DataSyncLog(Base):
    """
    Track data synchronization from various sources
    """
    __tablename__ = "data_sync_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    source = Column(String(50), nullable=False)  # dtro, web_scrape, manual
    authority_id = Column(UUID(as_uuid=True), ForeignKey('traffic_authorities.id'))

    # Sync details
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime)
    status = Column(String(20))  # running, success, failed, partial

    # Statistics
    records_fetched = Column(Integer, default=0)
    records_created = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_deleted = Column(Integer, default=0)
    errors_count = Column(Integer, default=0)

    # Error details
    error_message = Column(Text)
    error_details = Column(JSON)

    # Pagination/cursor for incremental syncs
    last_cursor = Column(String(500))

    __table_args__ = (
        Index('idx_sync_source_date', 'source', 'started_at'),
    )


# ============================================================================
# MATERIALIZED VIEWS (to be created via migration)
# ============================================================================

# These would be created as actual materialized views in PostgreSQL:

# 1. yellow_lines_summary - Aggregated view of all yellow line restrictions
#    Columns: geometry, restriction_type, line_marking, road_name, town,
#             authority_name, time_description, is_active

# 2. restrictions_by_postcode - Indexed by postcode sector for fast lookups

# 3. restrictions_heatmap - Pre-computed tiles for map visualization


# ============================================================================
# HELPER FUNCTIONS FOR QUERIES
# ============================================================================

def create_spatial_indexes(engine):
    """Create additional spatial indexes for performance"""
    with engine.connect() as conn:
        # Ensure PostGIS is enabled
        conn.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

        # Create spatial indexes if not exist
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_geometry_geog
            ON provision_geometries
            USING GIST (geography(geometry));
        """)
        conn.commit()
