"""
Scheduler for periodic data synchronization
Uses APScheduler for background job scheduling
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from .ingestion import YellowLinesETL, ETLConfig
from ..models.schema import DataSyncLog

logger = logging.getLogger(__name__)


class SyncScheduler:
    """
    Scheduler for automated data synchronization

    Runs:
    - Incremental sync every 6 hours (configurable)
    - Full sync weekly (configurable)
    - Retry failed syncs after 24 hours
    """

    def __init__(self, config: ETLConfig):
        self.config = config
        self.etl = YellowLinesETL(config)
        self.scheduler = AsyncIOScheduler()
        self._running = False

    def start(self):
        """Start the scheduler"""
        if self._running:
            logger.warning("Scheduler already running")
            return

        # Schedule incremental sync
        self.scheduler.add_job(
            self._run_incremental_sync,
            trigger=IntervalTrigger(hours=6),
            id='incremental_sync',
            name='Incremental D-TRO Sync',
            replace_existing=True
        )

        # Schedule full sync weekly (Sunday at 2 AM)
        self.scheduler.add_job(
            self._run_full_sync,
            trigger=CronTrigger(day_of_week='sun', hour=2, minute=0),
            id='full_sync',
            name='Weekly Full D-TRO Sync',
            replace_existing=True
        )

        # Schedule retry check every hour
        self.scheduler.add_job(
            self._retry_failed_syncs,
            trigger=IntervalTrigger(hours=1),
            id='retry_failed',
            name='Retry Failed Syncs',
            replace_existing=True
        )

        self.scheduler.start()
        self._running = True
        logger.info("Sync scheduler started")

    def stop(self):
        """Stop the scheduler"""
        if not self._running:
            return

        self.scheduler.shutdown(wait=True)
        self._running = False
        logger.info("Sync scheduler stopped")

    async def _run_incremental_sync(self):
        """Run incremental sync job"""
        logger.info("Starting scheduled incremental sync")
        try:
            stats = await self.etl.incremental_sync()
            logger.info(f"Incremental sync completed: {stats.records_created} created, "
                       f"{stats.records_updated} updated, {stats.errors_count} errors")
        except Exception as e:
            logger.error(f"Incremental sync failed: {e}")

    async def _run_full_sync(self):
        """Run full sync job"""
        logger.info("Starting scheduled full sync")
        try:
            stats = await self.etl.full_sync()
            logger.info(f"Full sync completed: {stats.records_created} created, "
                       f"{stats.records_updated} updated, {stats.errors_count} errors")
        except Exception as e:
            logger.error(f"Full sync failed: {e}")

    async def _retry_failed_syncs(self):
        """Retry syncs that failed more than 24 hours ago"""
        logger.debug("Checking for failed syncs to retry")

        with self.etl.Session() as session:
            cutoff = datetime.utcnow() - timedelta(hours=24)

            failed_syncs = session.query(DataSyncLog).filter(
                DataSyncLog.status == 'failed',
                DataSyncLog.started_at < cutoff
            ).all()

            for sync in failed_syncs:
                if sync.authority_id:
                    # Get authority code
                    from ..models.schema import TrafficAuthority
                    authority = session.query(TrafficAuthority).get(sync.authority_id)
                    if authority:
                        logger.info(f"Retrying failed sync for {authority.code}")
                        try:
                            await self.etl.sync_authority(authority.code)
                        except Exception as e:
                            logger.error(f"Retry failed for {authority.code}: {e}")

    def trigger_sync(self, sync_type: str = 'incremental'):
        """Manually trigger a sync"""
        if sync_type == 'full':
            self.scheduler.add_job(
                self._run_full_sync,
                id='manual_full_sync',
                replace_existing=True
            )
        else:
            self.scheduler.add_job(
                self._run_incremental_sync,
                id='manual_incremental_sync',
                replace_existing=True
            )

    def get_job_info(self):
        """Get information about scheduled jobs"""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run': job.next_run_time.isoformat() if job.next_run_time else None,
                'trigger': str(job.trigger)
            })
        return jobs


# =========================================================================
# CLI Entry Points
# =========================================================================

async def run_scheduler(config: ETLConfig):
    """Run the scheduler (blocking)"""
    scheduler = SyncScheduler(config)
    scheduler.start()

    try:
        # Keep running
        while True:
            await asyncio.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        scheduler.stop()


async def run_once(config: ETLConfig, sync_type: str = 'incremental'):
    """Run a single sync and exit"""
    etl = YellowLinesETL(config)

    if sync_type == 'full':
        stats = await etl.full_sync()
    else:
        stats = await etl.incremental_sync()

    print(f"Sync complete: {stats}")
    return stats
