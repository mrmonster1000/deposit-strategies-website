# UK Yellow Lines Database

A comprehensive database of parking and waiting restrictions (yellow lines, red routes, etc.) across the United Kingdom, sourced from the official Digital Traffic Regulation Orders (D-TRO) API.

## Overview

This project provides:
- **PostgreSQL + PostGIS database** for storing UK parking restrictions with full spatial support
- **ETL pipeline** to ingest data from the D-TRO API
- **REST API** to query restrictions by location, road, or authority
- **Scheduler** for automated data synchronization

## Data Source

The primary data source is the **D-TRO (Digital Traffic Regulation Orders)** service provided by the UK Department for Transport:

- **Official Documentation**: https://www.gov.uk/guidance/digital-traffic-regulation-orders-d-tro-service
- **API Documentation**: https://d-tro.dft.gov.uk/
- **GitHub Repository**: https://github.com/department-for-transport-public/D-TRO

### Coverage

- **England**: Mandatory coverage under the Automated Vehicles Act 2024
- **Scotland, Wales, Northern Ireland**: Varying coverage (different legislative frameworks)
- **Current status**: Public Beta (authorities progressively onboarding)

## Quick Start

### Prerequisites

- Python 3.10+
- PostgreSQL 14+ with PostGIS extension
- D-TRO API key (register at the GOV.UK link above)

### Installation

```bash
cd yellow-lines-db

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
# Edit .env with your database and API credentials
```

### Database Setup

```bash
# Create PostgreSQL database with PostGIS
psql -U postgres -c "CREATE DATABASE yellow_lines_db;"
psql -U postgres -d yellow_lines_db -c "CREATE EXTENSION postgis;"

# Initialize schema
python main.py init-db
```

### Sync Data

```bash
# Run initial full sync (all authorities)
python main.py sync --full

# Or sync a specific authority
python main.py sync --authority E09000001

# Check status
python main.py status
```

### Start API Server

```bash
python main.py serve

# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

## Project Structure

```
yellow-lines-db/
├── main.py                    # CLI entry point
├── requirements.txt           # Python dependencies
├── .env.example              # Environment config template
├── config/
│   └── settings.py           # Application settings
├── migrations/
│   └── 001_initial_schema.sql  # Database schema
├── src/
│   ├── api/
│   │   ├── dtro_client.py    # D-TRO API client
│   │   └── endpoints.py      # REST API endpoints
│   ├── etl/
│   │   ├── ingestion.py      # Data ingestion pipeline
│   │   ├── scraper.py        # Web scraper for non-D-TRO sources
│   │   └── scheduler.py      # Automated sync scheduler
│   └── models/
│       └── schema.py         # SQLAlchemy models
└── tests/
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `traffic_authorities` | UK local authorities and their D-TRO status |
| `traffic_regulation_orders` | Legal TRO documents |
| `provisions` | Individual restrictions within TROs |
| `provision_geometries` | Spatial data (LineStrings, Polygons) for each restriction |
| `time_periods` | When restrictions apply |
| `exemptions` | Exceptions to restrictions |

### Restriction Types

- `no_waiting` - Single yellow lines (time-limited)
- `no_waiting_at_any_time` - Double yellow lines
- `no_loading` - Loading restrictions
- `residents_parking` - Resident permit zones
- `permit_parking` - Other permit schemes
- `pay_and_display` - Pay parking
- `red_route` - Red routes (no stopping)
- And more...

## API Endpoints

### Find Nearby Restrictions

```http
GET /restrictions/nearby?longitude=-0.1276&latitude=51.5074&radius_meters=100
```

### Search by Road/Town

```http
GET /restrictions/search?road_name=Oxford%20Street&town=London
```

### Get Restrictions in Bounding Box (GeoJSON)

```http
GET /restrictions/bbox?min_lon=-0.15&min_lat=51.5&max_lon=-0.1&max_lat=51.52
```

### List Authorities

```http
GET /authorities?dtro_enabled_only=true
```

## CLI Commands

```bash
# Initialize database
python main.py init-db

# Sync data
python main.py sync              # Incremental sync
python main.py sync --full       # Full sync
python main.py sync -a E09000001 # Specific authority

# Run scheduler (continuous)
python main.py scheduler

# Start API server
python main.py serve
python main.py serve --reload    # Development mode

# Check status
python main.py status

# Discover datasets on data.gov.uk
python main.py discover-datasets
```

## Configuration

Environment variables (set in `.env`):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yellow_lines_db
DB_USER=postgres
DB_PASSWORD=your_password

# D-TRO API
DTRO_API_KEY=your_api_key
DTRO_ENVIRONMENT=production  # or 'integration' for testing

# ETL
ETL_BATCH_SIZE=100
ETL_FULL_SYNC_DAYS=7

# API
API_HOST=0.0.0.0
API_PORT=8000
```

## License

This project uses data from the D-TRO service which is provided under the Open Government Licence v3.0.

## Links

- [D-TRO Service (GOV.UK)](https://www.gov.uk/guidance/digital-traffic-regulation-orders-d-tro-service)
- [D-TRO GitHub](https://github.com/department-for-transport-public/D-TRO)
- [Transport Technology Forum](https://ttf.uk.net/digital-traffic-regulation-orders-d-tro/)
