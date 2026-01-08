#!/usr/bin/env python3
"""
UK Yellow Lines Database - Main Entry Point

A comprehensive database of parking and waiting restrictions across the UK,
sourced from Digital Traffic Regulation Orders (D-TRO) and other official sources.

Usage:
    # Initialize database
    python main.py init-db

    # Run full sync from D-TRO API
    python main.py sync --full

    # Run incremental sync
    python main.py sync

    # Start scheduler (for continuous updates)
    python main.py scheduler

    # Start API server
    python main.py serve

    # Run single authority sync
    python main.py sync --authority E09000001
"""

import asyncio
import logging
import sys
from pathlib import Path

import click
from rich.console import Console
from rich.logging import RichHandler
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from config.settings import get_settings
from src.etl.ingestion import YellowLinesETL, ETLConfig
from src.etl.scheduler import SyncScheduler, run_once, run_scheduler
from src.api.endpoints import create_app

console = Console()
settings = get_settings()


def setup_logging(level: str = "INFO"):
    """Configure logging with rich output"""
    logging.basicConfig(
        level=level,
        format="%(message)s",
        handlers=[RichHandler(console=console, rich_tracebacks=True)]
    )


def get_etl_config() -> ETLConfig:
    """Create ETL config from settings"""
    return ETLConfig(
        database_url=settings.database.url,
        dtro_api_key=settings.dtro.api_key,
        dtro_environment=settings.dtro.environment,
        batch_size=settings.etl.batch_size,
        max_concurrent_authorities=settings.etl.max_concurrent_authorities,
        full_sync_interval_days=settings.etl.full_sync_interval_days
    )


@click.group()
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def cli(verbose: bool):
    """UK Yellow Lines Database CLI"""
    setup_logging("DEBUG" if verbose else settings.log_level)


@cli.command()
def init_db():
    """Initialize the database schema"""
    console.print("[bold blue]Initializing database...[/bold blue]")

    config = get_etl_config()
    etl = YellowLinesETL(config)
    etl.init_database()

    console.print("[bold green]Database initialized successfully![/bold green]")
    console.print(f"Connection: {settings.database.host}:{settings.database.port}/{settings.database.name}")


@cli.command()
@click.option('--full', is_flag=True, help='Run full sync (all authorities)')
@click.option('--authority', '-a', help='Sync specific authority by code')
def sync(full: bool, authority: str):
    """Synchronize data from D-TRO API"""
    config = get_etl_config()

    if not settings.dtro.api_key:
        console.print("[bold red]Error: DTRO_API_KEY not set[/bold red]")
        console.print("Register at: https://www.gov.uk/guidance/digital-traffic-regulation-orders-d-tro-service")
        sys.exit(1)

    async def run_sync():
        etl = YellowLinesETL(config)

        if authority:
            console.print(f"[blue]Syncing authority: {authority}[/blue]")
            stats = await etl.sync_authority(authority)
        elif full:
            console.print("[blue]Running full sync of all authorities...[/blue]")
            stats = await etl.full_sync()
        else:
            console.print("[blue]Running incremental sync...[/blue]")
            stats = await etl.incremental_sync()

        console.print(f"\n[bold green]Sync complete![/bold green]")
        console.print(f"  Records fetched: {stats.records_fetched}")
        console.print(f"  Records created: {stats.records_created}")
        console.print(f"  Records updated: {stats.records_updated}")
        console.print(f"  Errors: {stats.errors_count}")

        if stats.errors:
            console.print("\n[yellow]Errors:[/yellow]")
            for error in stats.errors[:10]:
                console.print(f"  - {error}")

    asyncio.run(run_sync())


@cli.command()
def scheduler():
    """Start the sync scheduler (runs continuously)"""
    config = get_etl_config()

    if not settings.dtro.api_key:
        console.print("[bold red]Error: DTRO_API_KEY not set[/bold red]")
        sys.exit(1)

    console.print("[bold blue]Starting sync scheduler...[/bold blue]")
    console.print("  Incremental sync: every 6 hours")
    console.print("  Full sync: Sundays at 2 AM")
    console.print("\nPress Ctrl+C to stop")

    asyncio.run(run_scheduler(config))


@cli.command()
@click.option('--host', default=None, help='Host to bind to')
@click.option('--port', default=None, type=int, help='Port to bind to')
@click.option('--reload', is_flag=True, help='Enable auto-reload for development')
def serve(host: str, port: int, reload: bool):
    """Start the API server"""
    import uvicorn

    host = host or settings.api.host
    port = port or settings.api.port

    console.print(f"[bold blue]Starting API server...[/bold blue]")
    console.print(f"  URL: http://{host}:{port}")
    console.print(f"  Docs: http://{host}:{port}/docs")

    app = create_app(settings.database.url)

    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=reload,
        log_level=settings.log_level.lower()
    )


@cli.command()
def status():
    """Show database status and statistics"""
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(settings.database.url)

    try:
        with engine.connect() as conn:
            # Check PostGIS
            result = conn.execute(text("SELECT PostGIS_Version();"))
            postgis_version = result.scalar()

            console.print("[bold blue]Database Status[/bold blue]")
            console.print(f"  Host: {settings.database.host}:{settings.database.port}")
            console.print(f"  Database: {settings.database.name}")
            console.print(f"  PostGIS: {postgis_version}")

            # Count records
            tables = [
                ('traffic_authorities', 'Authorities'),
                ('traffic_regulation_orders', 'TROs'),
                ('provisions', 'Provisions'),
                ('provision_geometries', 'Geometries'),
            ]

            console.print("\n[bold blue]Record Counts[/bold blue]")
            for table, label in tables:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    console.print(f"  {label}: {count:,}")
                except Exception:
                    console.print(f"  {label}: [dim]table not found[/dim]")

            # Last sync
            try:
                result = conn.execute(text("""
                    SELECT completed_at, status, records_created, records_updated
                    FROM data_sync_logs
                    WHERE status = 'success'
                    ORDER BY completed_at DESC
                    LIMIT 1
                """))
                row = result.fetchone()
                if row:
                    console.print(f"\n[bold blue]Last Successful Sync[/bold blue]")
                    console.print(f"  Time: {row[0]}")
                    console.print(f"  Created: {row[2]}, Updated: {row[3]}")
            except Exception:
                pass

    except Exception as e:
        console.print(f"[bold red]Connection failed: {e}[/bold red]")
        sys.exit(1)


@cli.command()
def discover_datasets():
    """Discover parking datasets on data.gov.uk"""
    from src.etl.scraper import discover_parking_datasets

    async def run():
        console.print("[blue]Searching data.gov.uk for parking datasets...[/blue]\n")
        datasets = await discover_parking_datasets()

        console.print(f"[bold]Found {len(datasets)} datasets:[/bold]\n")
        for ds in datasets[:20]:
            console.print(f"[bold]{ds['title']}[/bold]")
            console.print(f"  Organization: {ds['organization']}")
            console.print(f"  Resources: {len(ds['resources'])} files")
            for r in ds['resources'][:3]:
                console.print(f"    - {r['format']}: {r['name']}")
            console.print()

    asyncio.run(run())


if __name__ == '__main__':
    cli()
