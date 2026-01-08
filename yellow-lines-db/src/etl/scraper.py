"""
Web Scraper for Authorities Not on D-TRO
Fallback data collection from council websites and other sources
"""

import asyncio
import logging
import re
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


@dataclass
class ScrapedRestriction:
    """A parking restriction scraped from a website"""
    road_name: str
    restriction_type: str
    description: Optional[str] = None
    time_description: Optional[str] = None
    locality: Optional[str] = None
    town: Optional[str] = None
    authority_code: Optional[str] = None
    source_url: Optional[str] = None
    raw_html: Optional[str] = None


class BaseAuthorityScraper(ABC):
    """
    Base class for authority-specific web scrapers

    Each local authority may have different website structures,
    so we create specific scrapers for each.
    """

    def __init__(self, authority_code: str, base_url: str):
        self.authority_code = authority_code
        self.base_url = base_url
        self.client = httpx.AsyncClient(
            timeout=30,
            headers={
                "User-Agent": "UK-YellowLines-Research/1.0 (+https://github.com/example)"
            },
            follow_redirects=True
        )

    async def close(self):
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    @abstractmethod
    async def scrape_restrictions(self) -> List[ScrapedRestriction]:
        """
        Scrape parking restrictions from the authority website

        Returns a list of ScrapedRestriction objects
        """
        pass

    async def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a web page"""
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return None

    def normalize_restriction_type(self, text: str) -> str:
        """Convert restriction text to standard type"""
        text = text.lower().strip()

        if "double yellow" in text or "no waiting at any time" in text:
            return "no_waiting_at_any_time"
        elif "single yellow" in text or "no waiting" in text:
            return "no_waiting"
        elif "no loading" in text:
            return "no_loading"
        elif "resident" in text:
            return "residents_parking"
        elif "permit" in text:
            return "permit_parking"
        elif "disabled" in text:
            return "disabled_parking"
        elif "pay" in text or "meter" in text:
            return "pay_and_display"
        elif "red route" in text:
            return "red_route"
        elif "taxi" in text:
            return "taxi_rank"
        elif "bus" in text:
            return "bus_stop"
        elif "clearway" in text:
            return "clearway"
        elif "school" in text:
            return "school_keep_clear"
        else:
            return "other"


# =========================================================================
# Example Authority Scrapers
# These would need to be customized for each authority's website structure
# =========================================================================

class TransportForLondonScraper(BaseAuthorityScraper):
    """
    Scraper for Transport for London (TfL) red routes

    TfL manages major roads in London including A-roads with red routes
    """

    def __init__(self):
        super().__init__(
            authority_code="TFL",
            base_url="https://tfl.gov.uk"
        )

    async def scrape_restrictions(self) -> List[ScrapedRestriction]:
        """Scrape TfL red route data"""
        restrictions = []

        # TfL has an open data API - prefer that over scraping
        # https://api.tfl.gov.uk/
        # This is a placeholder for the scraping approach

        tro_page = await self.fetch_page(
            f"{self.base_url}/modes/driving/red-routes/"
        )

        if not tro_page:
            return restrictions

        # Extract red route information
        # This would need to be customized based on actual page structure

        return restrictions


class GenericCouncilScraper(BaseAuthorityScraper):
    """
    Generic scraper that attempts to find TRO information on council websites

    Many councils have similar structures for their TRO pages
    """

    COMMON_TRO_PATHS = [
        "/parking/traffic-regulation-orders",
        "/roads-and-travel/parking/tro",
        "/transport/parking/parking-restrictions",
        "/streets-and-roads/traffic-regulation-orders",
        "/tros",
        "/traffic-management/tros",
    ]

    async def scrape_restrictions(self) -> List[ScrapedRestriction]:
        """Attempt to find and scrape TRO information"""
        restrictions = []

        # Try common TRO page paths
        for path in self.COMMON_TRO_PATHS:
            url = urljoin(self.base_url, path)
            page = await self.fetch_page(url)

            if page:
                logger.info(f"Found TRO page at {url}")
                restrictions.extend(
                    await self._extract_restrictions(page, url)
                )
                break

        return restrictions

    async def _extract_restrictions(
        self,
        page: BeautifulSoup,
        source_url: str
    ) -> List[ScrapedRestriction]:
        """Extract restriction information from a TRO page"""
        restrictions = []

        # Look for common patterns in TRO pages
        # This is a simplified example - real implementation would be more robust

        # Look for tables with restriction data
        tables = page.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows[1:]:  # Skip header
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    road_name = cells[0].get_text(strip=True)
                    restriction_text = cells[1].get_text(strip=True)

                    if road_name and restriction_text:
                        restrictions.append(ScrapedRestriction(
                            road_name=road_name,
                            restriction_type=self.normalize_restriction_type(restriction_text),
                            description=restriction_text,
                            authority_code=self.authority_code,
                            source_url=source_url
                        ))

        # Look for PDF links (many councils publish TROs as PDFs)
        pdf_links = page.find_all('a', href=re.compile(r'\.pdf$', re.I))
        for link in pdf_links:
            href = link.get('href')
            text = link.get_text(strip=True)
            logger.info(f"Found TRO PDF: {text} - {href}")
            # PDF extraction would require additional processing

        return restrictions


class DataGovUKScraper:
    """
    Scraper for data.gov.uk parking datasets

    Many councils publish parking data here
    """

    BASE_URL = "https://data.gov.uk"
    SEARCH_URL = "https://data.gov.uk/api/3/action/package_search"

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30)

    async def close(self):
        await self.client.aclose()

    async def search_parking_datasets(self) -> List[Dict[str, Any]]:
        """Search for parking-related datasets on data.gov.uk"""
        datasets = []

        search_terms = [
            "parking restrictions",
            "traffic regulation order",
            "yellow lines",
            "waiting restrictions",
            "controlled parking zone"
        ]

        for term in search_terms:
            try:
                response = await self.client.get(
                    self.SEARCH_URL,
                    params={
                        "q": term,
                        "rows": 100
                    }
                )
                response.raise_for_status()
                data = response.json()

                for result in data.get("result", {}).get("results", []):
                    datasets.append({
                        "id": result.get("id"),
                        "name": result.get("name"),
                        "title": result.get("title"),
                        "organization": result.get("organization", {}).get("title"),
                        "resources": [
                            {
                                "url": r.get("url"),
                                "format": r.get("format"),
                                "name": r.get("name")
                            }
                            for r in result.get("resources", [])
                        ]
                    })

            except Exception as e:
                logger.error(f"Error searching data.gov.uk for '{term}': {e}")

        # Deduplicate by ID
        seen = set()
        unique_datasets = []
        for ds in datasets:
            if ds["id"] not in seen:
                seen.add(ds["id"])
                unique_datasets.append(ds)

        return unique_datasets


# =========================================================================
# Scraper Registry
# =========================================================================

AUTHORITY_SCRAPERS = {
    "TFL": TransportForLondonScraper,
    # Add more authority-specific scrapers here as needed
    # "E09000001": CityOfLondonScraper,
    # "E09000002": BarnetScraper,
    # etc.
}


async def scrape_authority(authority_code: str) -> List[ScrapedRestriction]:
    """
    Scrape parking restriction data for an authority

    Uses authority-specific scraper if available, otherwise generic scraper
    """
    scraper_class = AUTHORITY_SCRAPERS.get(authority_code)

    if scraper_class:
        async with scraper_class() as scraper:
            return await scraper.scrape_restrictions()
    else:
        logger.warning(f"No specific scraper for {authority_code}, skipping")
        return []


async def discover_parking_datasets():
    """
    Discover available parking datasets from data.gov.uk

    Returns list of datasets that might contain parking restriction data
    """
    scraper = DataGovUKScraper()
    try:
        datasets = await scraper.search_parking_datasets()
        return datasets
    finally:
        await scraper.close()
