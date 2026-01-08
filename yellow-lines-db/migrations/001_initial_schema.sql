-- UK Yellow Lines Database - Initial Schema Migration
-- Prerequisites: PostgreSQL 14+ with PostGIS extension

-- ============================================================================
-- Enable PostGIS Extension
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM Types
-- ============================================================================

CREATE TYPE restriction_type AS ENUM (
    'no_waiting',
    'no_waiting_at_any_time',
    'limited_waiting',
    'no_loading',
    'limited_loading',
    'residents_parking',
    'permit_parking',
    'pay_and_display',
    'disabled_parking',
    'taxi_rank',
    'bus_stop',
    'clearway',
    'red_route',
    'school_keep_clear',
    'other'
);

CREATE TYPE line_marking_type AS ENUM (
    'single_yellow',
    'double_yellow',
    'single_red',
    'double_red',
    'white_bay',
    'no_marking',
    'zigzag',
    'other'
);

CREATE TYPE order_status AS ENUM (
    'draft',
    'proposed',
    'made',
    'active',
    'suspended',
    'revoked',
    'superseded'
);

-- ============================================================================
-- Traffic Authorities Table
-- ============================================================================

CREATE TABLE traffic_authorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    authority_type VARCHAR(50),
    region VARCHAR(100),
    country VARCHAR(50),
    boundary GEOMETRY(MULTIPOLYGON, 4326),
    website VARCHAR(500),
    contact_email VARCHAR(255),
    dtro_enabled BOOLEAN DEFAULT FALSE,
    dtro_registered_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_authority_code ON traffic_authorities(code);
CREATE INDEX idx_authority_region ON traffic_authorities(region);
CREATE INDEX idx_authority_boundary ON traffic_authorities USING GIST(boundary);

-- ============================================================================
-- Traffic Regulation Orders Table
-- ============================================================================

CREATE TABLE traffic_regulation_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dtro_id VARCHAR(100) UNIQUE,
    authority_id UUID NOT NULL REFERENCES traffic_authorities(id),
    order_reference VARCHAR(255) NOT NULL,
    order_title VARCHAR(500),
    description TEXT,
    order_type VARCHAR(50),
    is_temporary BOOLEAN DEFAULT FALSE,
    status order_status DEFAULT 'active',
    made_date DATE,
    coming_into_force_date DATE,
    expiry_date DATE,
    revocation_date DATE,
    legal_reference TEXT,
    source VARCHAR(50) DEFAULT 'dtro',
    source_url VARCHAR(1000),
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP
);

CREATE INDEX idx_tro_dtro_id ON traffic_regulation_orders(dtro_id);
CREATE INDEX idx_tro_authority ON traffic_regulation_orders(authority_id);
CREATE INDEX idx_tro_status ON traffic_regulation_orders(status);
CREATE INDEX idx_tro_dates ON traffic_regulation_orders(coming_into_force_date, expiry_date);

-- ============================================================================
-- Provisions Table
-- ============================================================================

CREATE TABLE provisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES traffic_regulation_orders(id) ON DELETE CASCADE,
    provision_index INTEGER,
    description TEXT,
    restriction_type restriction_type NOT NULL,
    line_marking line_marking_type,
    is_enforced BOOLEAN DEFAULT TRUE,
    enforcement_notes TEXT,
    max_stay_minutes INTEGER,
    no_return_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provision_order ON provisions(order_id);
CREATE INDEX idx_provision_restriction ON provisions(restriction_type);

-- ============================================================================
-- Provision Geometries Table
-- ============================================================================

CREATE TABLE provision_geometries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provision_id UUID NOT NULL REFERENCES provisions(id) ON DELETE CASCADE,
    geometry GEOMETRY(GEOMETRY, 4326) NOT NULL,
    geometry_type VARCHAR(50),
    road_name VARCHAR(255),
    road_classification VARCHAR(20),
    usrn VARCHAR(20),
    locality VARCHAR(255),
    town VARCHAR(255),
    postcode_sector VARCHAR(10),
    length_meters FLOAT,
    side_of_road VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_geometry_provision ON provision_geometries(provision_id);
CREATE INDEX idx_geometry_spatial ON provision_geometries USING GIST(geometry);
CREATE INDEX idx_geometry_road ON provision_geometries(road_name);
CREATE INDEX idx_geometry_usrn ON provision_geometries(usrn);
CREATE INDEX idx_geometry_town ON provision_geometries(town);

-- Geography index for distance queries (more accurate but slower)
CREATE INDEX idx_geometry_geog ON provision_geometries USING GIST(geography(geometry));

-- ============================================================================
-- Time Periods Table
-- ============================================================================

CREATE TABLE time_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provision_id UUID NOT NULL REFERENCES provisions(id) ON DELETE CASCADE,
    start_time TIME,
    end_time TIME,
    days_of_week TEXT[],
    valid_from_date DATE,
    valid_to_date DATE,
    applies_on_public_holidays BOOLEAN DEFAULT TRUE,
    applies_on_school_holidays BOOLEAN DEFAULT TRUE,
    description VARCHAR(500),
    is_24_hours BOOLEAN DEFAULT FALSE,
    is_all_year BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timeperiod_provision ON time_periods(provision_id);

-- ============================================================================
-- Exemptions Table
-- ============================================================================

CREATE TABLE exemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provision_id UUID NOT NULL REFERENCES provisions(id) ON DELETE CASCADE,
    exemption_type VARCHAR(100) NOT NULL,
    description TEXT,
    max_duration_minutes INTEGER,
    permit_zone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exemption_provision ON exemptions(provision_id);

-- ============================================================================
-- Roads Master Table
-- ============================================================================

CREATE TABLE roads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usrn VARCHAR(20) UNIQUE NOT NULL,
    road_name VARCHAR(255) NOT NULL,
    road_name_alternatives TEXT[],
    road_classification VARCHAR(20),
    road_number VARCHAR(20),
    highway_authority_id UUID REFERENCES traffic_authorities(id),
    geometry GEOMETRY(MULTILINESTRING, 4326),
    locality VARCHAR(255),
    town VARCHAR(255),
    county VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_road_usrn ON roads(usrn);
CREATE INDEX idx_road_name ON roads(road_name);
CREATE INDEX idx_road_geometry ON roads USING GIST(geometry);
CREATE INDEX idx_road_town ON roads(town);

-- ============================================================================
-- Data Sync Log Table
-- ============================================================================

CREATE TABLE data_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL,
    authority_id UUID REFERENCES traffic_authorities(id),
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    status VARCHAR(20),
    records_fetched INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_message TEXT,
    error_details JSONB,
    last_cursor VARCHAR(500)
);

CREATE INDEX idx_sync_source_date ON data_sync_logs(source, started_at);
CREATE INDEX idx_sync_authority ON data_sync_logs(authority_id);

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_traffic_authorities_updated_at
    BEFORE UPDATE ON traffic_authorities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tros_updated_at
    BEFORE UPDATE ON traffic_regulation_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provisions_updated_at
    BEFORE UPDATE ON provisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geometries_updated_at
    BEFORE UPDATE ON provision_geometries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Useful Views
-- ============================================================================

-- View: All yellow lines with full details
CREATE VIEW yellow_lines_summary AS
SELECT
    pg.id AS geometry_id,
    pg.geometry,
    pg.road_name,
    pg.town,
    pg.usrn,
    p.restriction_type,
    p.line_marking,
    p.description AS provision_description,
    p.max_stay_minutes,
    ta.name AS authority_name,
    ta.code AS authority_code,
    tro.order_reference,
    tro.status AS order_status,
    tro.coming_into_force_date,
    tro.expiry_date,
    CASE
        WHEN p.restriction_type = 'no_waiting_at_any_time' THEN TRUE
        WHEN p.restriction_type = 'no_waiting' AND EXISTS (
            SELECT 1 FROM time_periods tp
            WHERE tp.provision_id = p.id AND tp.is_24_hours = TRUE
        ) THEN TRUE
        ELSE FALSE
    END AS is_double_yellow,
    (
        SELECT string_agg(tp.description, '; ')
        FROM time_periods tp
        WHERE tp.provision_id = p.id
    ) AS time_restrictions
FROM provision_geometries pg
JOIN provisions p ON pg.provision_id = p.id
JOIN traffic_regulation_orders tro ON p.order_id = tro.id
JOIN traffic_authorities ta ON tro.authority_id = ta.id
WHERE tro.status = 'active'
  AND (tro.expiry_date IS NULL OR tro.expiry_date > CURRENT_DATE)
  AND p.restriction_type IN ('no_waiting', 'no_waiting_at_any_time', 'limited_waiting');

-- View: Restrictions by postcode sector
CREATE VIEW restrictions_by_area AS
SELECT
    pg.town,
    pg.postcode_sector,
    p.restriction_type,
    COUNT(*) AS restriction_count,
    SUM(pg.length_meters) AS total_length_meters
FROM provision_geometries pg
JOIN provisions p ON pg.provision_id = p.id
JOIN traffic_regulation_orders tro ON p.order_id = tro.id
WHERE tro.status = 'active'
GROUP BY pg.town, pg.postcode_sector, p.restriction_type;

-- ============================================================================
-- Sample Query Functions
-- ============================================================================

-- Function: Find restrictions at a point
CREATE OR REPLACE FUNCTION find_restrictions_at_point(
    lon FLOAT,
    lat FLOAT,
    radius_meters INTEGER DEFAULT 50
)
RETURNS TABLE (
    road_name VARCHAR,
    restriction_type restriction_type,
    line_marking line_marking_type,
    description TEXT,
    time_restrictions TEXT,
    distance_meters FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pg.road_name,
        p.restriction_type,
        p.line_marking,
        p.description,
        (SELECT string_agg(tp.description, '; ') FROM time_periods tp WHERE tp.provision_id = p.id),
        ST_Distance(
            pg.geometry::geography,
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
        ) AS distance_meters
    FROM provision_geometries pg
    JOIN provisions p ON pg.provision_id = p.id
    JOIN traffic_regulation_orders tro ON p.order_id = tro.id
    WHERE ST_DWithin(
        pg.geometry::geography,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
        radius_meters
    )
    AND tro.status = 'active'
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant Permissions (adjust as needed)
-- ============================================================================

-- Create read-only role
-- CREATE ROLE yellow_lines_reader;
-- GRANT USAGE ON SCHEMA public TO yellow_lines_reader;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO yellow_lines_reader;
-- GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO yellow_lines_reader;

-- Create read-write role
-- CREATE ROLE yellow_lines_writer;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO yellow_lines_writer;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO yellow_lines_writer;
