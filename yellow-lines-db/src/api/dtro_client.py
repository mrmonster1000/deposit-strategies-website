"""
D-TRO API Client
Interfaces with the Department for Transport's Digital Traffic Regulation Orders API
https://d-tro.dft.gov.uk/
"""

import os
import time
import logging
from typing import Optional, Dict, List, Any, Generator
from dataclasses import dataclass
from datetime import datetime, date
from enum import Enum
import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

logger = logging.getLogger(__name__)


class DTROEnvironment(str, Enum):
    """D-TRO API environments"""
    INTEGRATION = "integration"
    PRODUCTION = "production"


@dataclass
class DTROConfig:
    """Configuration for D-TRO API client"""
    api_key: str
    environment: DTROEnvironment = DTROEnvironment.PRODUCTION
    timeout: int = 30
    max_retries: int = 3

    @property
    def base_url(self) -> str:
        """Get base URL for the configured environment"""
        if self.environment == DTROEnvironment.INTEGRATION:
            return "https://integration.d-tro.dft.gov.uk/api/v3"
        return "https://d-tro.dft.gov.uk/api/v3"


class DTROError(Exception):
    """Base exception for D-TRO API errors"""
    pass


class DTROAuthError(DTROError):
    """Authentication/authorization error"""
    pass


class DTRORateLimitError(DTROError):
    """Rate limit exceeded"""
    pass


class DTRONotFoundError(DTROError):
    """Resource not found"""
    pass


class DTROClient:
    """
    Client for the D-TRO (Digital Traffic Regulation Orders) API

    The D-TRO service provides access to digital versions of Traffic Regulation
    Orders from UK traffic authorities. This includes parking restrictions,
    waiting restrictions (yellow lines), speed limits, and other traffic measures.

    Registration: https://www.gov.uk/guidance/digital-traffic-regulation-orders-d-tro-service

    Usage:
        config = DTROConfig(api_key="your-api-key")
        client = DTROClient(config)

        # Get all TROs for an authority
        async for tro in client.get_tros_by_authority("E09000001"):
            print(tro)

        # Search for yellow line restrictions in an area
        restrictions = await client.search_restrictions(
            bbox=[-0.15, 51.5, -0.1, 51.52],
            regulation_types=["no_waiting"]
        )
    """

    def __init__(self, config: DTROConfig):
        self.config = config
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        await self._ensure_client()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def _ensure_client(self):
        """Ensure HTTP client is initialized"""
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.config.base_url,
                headers={
                    "Authorization": f"Bearer {self.config.api_key}",
                    "Accept": "application/json",
                    "User-Agent": "UK-YellowLines-DB/1.0"
                },
                timeout=self.config.timeout
            )

    async def close(self):
        """Close the HTTP client"""
        if self._client:
            await self._client.aclose()
            self._client = None

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError))
    )
    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make an API request with retry logic"""
        await self._ensure_client()

        try:
            response = await self._client.request(
                method=method,
                url=endpoint,
                params=params,
                json=json_data
            )

            if response.status_code == 401:
                raise DTROAuthError("Invalid or expired API key")
            elif response.status_code == 403:
                raise DTROAuthError("Access denied - check API permissions")
            elif response.status_code == 404:
                raise DTRONotFoundError(f"Resource not found: {endpoint}")
            elif response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 60))
                logger.warning(f"Rate limited. Waiting {retry_after}s")
                time.sleep(retry_after)
                raise DTRORateLimitError("Rate limit exceeded")
            elif response.status_code >= 500:
                raise DTROError(f"Server error: {response.status_code}")

            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            raise DTROError(f"HTTP error: {e}")

    # =========================================================================
    # Traffic Authorities Endpoints
    # =========================================================================

    async def get_traffic_authorities(self) -> List[Dict[str, Any]]:
        """
        Get list of all registered Traffic Regulation Authorities

        Returns list of authorities with their codes, names, and D-TRO status
        """
        response = await self._request("GET", "/traffic-authorities")
        return response.get("data", [])

    async def get_traffic_authority(self, authority_code: str) -> Dict[str, Any]:
        """
        Get details for a specific traffic authority

        Args:
            authority_code: The authority code (e.g., "E09000001" for City of London)
        """
        return await self._request("GET", f"/traffic-authorities/{authority_code}")

    # =========================================================================
    # D-TRO (Traffic Regulation Orders) Endpoints
    # =========================================================================

    async def get_dtro(self, dtro_id: str) -> Dict[str, Any]:
        """
        Get a specific D-TRO by its ID

        Args:
            dtro_id: The D-TRO identifier
        """
        return await self._request("GET", f"/dtros/{dtro_id}")

    async def get_dtros_by_authority(
        self,
        authority_code: str,
        page: int = 1,
        page_size: int = 100,
        modified_since: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get all D-TROs for a specific authority

        Args:
            authority_code: The traffic authority code
            page: Page number for pagination
            page_size: Number of results per page
            modified_since: Only return TROs modified after this date
        """
        params = {
            "trafficAuthorityCode": authority_code,
            "page": page,
            "pageSize": page_size
        }

        if modified_since:
            params["modifiedSince"] = modified_since.isoformat()

        return await self._request("GET", "/dtros", params=params)

    async def iterate_dtros_by_authority(
        self,
        authority_code: str,
        page_size: int = 100,
        modified_since: Optional[datetime] = None
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Iterate through all D-TROs for an authority with automatic pagination

        Yields each D-TRO record
        """
        page = 1
        while True:
            response = await self.get_dtros_by_authority(
                authority_code=authority_code,
                page=page,
                page_size=page_size,
                modified_since=modified_since
            )

            data = response.get("data", [])
            if not data:
                break

            for dtro in data:
                yield dtro

            # Check if more pages
            total_pages = response.get("pagination", {}).get("totalPages", 1)
            if page >= total_pages:
                break

            page += 1

    # =========================================================================
    # Search Endpoints
    # =========================================================================

    async def search_dtros(
        self,
        bbox: Optional[List[float]] = None,  # [min_lon, min_lat, max_lon, max_lat]
        point: Optional[tuple] = None,  # (lon, lat)
        radius_meters: int = 100,
        regulation_types: Optional[List[str]] = None,
        authority_codes: Optional[List[str]] = None,
        active_on_date: Optional[date] = None,
        page: int = 1,
        page_size: int = 100
    ) -> Dict[str, Any]:
        """
        Search for D-TROs by location and/or criteria

        Args:
            bbox: Bounding box [min_lon, min_lat, max_lon, max_lat]
            point: Center point (longitude, latitude) for radius search
            radius_meters: Search radius when using point
            regulation_types: Filter by regulation types (e.g., ["no_waiting"])
            authority_codes: Filter by specific authorities
            active_on_date: Only return restrictions active on this date
            page: Page number
            page_size: Results per page
        """
        params = {
            "page": page,
            "pageSize": page_size
        }

        if bbox:
            params["bbox"] = ",".join(map(str, bbox))

        if point:
            params["point"] = f"{point[0]},{point[1]}"
            params["radius"] = radius_meters

        if regulation_types:
            params["regulationType"] = ",".join(regulation_types)

        if authority_codes:
            params["trafficAuthorityCodes"] = ",".join(authority_codes)

        if active_on_date:
            params["activeOn"] = active_on_date.isoformat()

        return await self._request("GET", "/dtros/search", params=params)

    async def search_by_road(
        self,
        road_name: str,
        authority_code: Optional[str] = None,
        usrn: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Search for restrictions on a specific road

        Args:
            road_name: Name of the road
            authority_code: Optional authority to limit search
            usrn: Unique Street Reference Number (more precise)
        """
        params = {"roadName": road_name}

        if authority_code:
            params["trafficAuthorityCode"] = authority_code

        if usrn:
            params["usrn"] = usrn

        return await self._request("GET", "/dtros/search", params=params)

    # =========================================================================
    # Regulation Types Reference
    # =========================================================================

    async def get_regulation_types(self) -> List[Dict[str, Any]]:
        """
        Get the list of supported regulation types

        Returns reference data for all regulation types including:
        - no_waiting (yellow lines)
        - no_loading
        - permit_parking
        - etc.
        """
        return await self._request("GET", "/reference/regulation-types")

    # =========================================================================
    # Changes/Updates Endpoints
    # =========================================================================

    async def get_changes(
        self,
        since: datetime,
        authority_code: Optional[str] = None,
        page: int = 1,
        page_size: int = 100
    ) -> Dict[str, Any]:
        """
        Get D-TROs that have been created/updated/deleted since a given time

        Useful for incremental sync operations

        Args:
            since: Get changes since this datetime
            authority_code: Optional filter by authority
            page: Page number
            page_size: Results per page
        """
        params = {
            "since": since.isoformat(),
            "page": page,
            "pageSize": page_size
        }

        if authority_code:
            params["trafficAuthorityCode"] = authority_code

        return await self._request("GET", "/dtros/changes", params=params)


# =========================================================================
# D-TRO Data Parsers
# =========================================================================

class DTROParser:
    """
    Parser for D-TRO API responses

    Transforms D-TRO JSON into our internal data model
    """

    # Mapping from D-TRO regulation types to our internal types
    REGULATION_TYPE_MAP = {
        "noWaiting": "no_waiting",
        "noWaitingAtAnyTime": "no_waiting_at_any_time",
        "limitedWaiting": "limited_waiting",
        "noLoading": "no_loading",
        "loadingOnly": "limited_loading",
        "permitHolderParking": "permit_parking",
        "residentsParking": "residents_parking",
        "payAndDisplay": "pay_and_display",
        "disabledParking": "disabled_parking",
        "taxiRank": "taxi_rank",
        "busStop": "bus_stop",
        "clearway": "clearway",
        "redRoute": "red_route",
        "schoolKeepClear": "school_keep_clear",
    }

    LINE_MARKING_MAP = {
        "singleYellowLine": "single_yellow",
        "doubleYellowLine": "double_yellow",
        "singleRedLine": "single_red",
        "doubleRedLine": "double_red",
        "whiteBay": "white_bay",
        "zigZag": "zigzag",
        "none": "no_marking",
    }

    @classmethod
    def parse_dtro(cls, dtro_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse a D-TRO response into our internal format

        Args:
            dtro_data: Raw D-TRO API response

        Returns:
            Parsed data ready for database insertion
        """
        source = dtro_data.get("source", {})
        provisions = dtro_data.get("provisions", [])

        return {
            "dtro_id": dtro_data.get("id"),
            "authority_code": source.get("trafficAuthorityCode"),
            "order_reference": source.get("orderReference"),
            "order_title": source.get("orderTitle"),
            "description": source.get("description"),
            "order_type": source.get("orderType", "permanent"),
            "is_temporary": source.get("orderType") == "temporary",
            "status": cls._map_status(source.get("status")),
            "made_date": cls._parse_date(source.get("madeDate")),
            "coming_into_force_date": cls._parse_date(source.get("comingIntoForceDate")),
            "expiry_date": cls._parse_date(source.get("expiryDate")),
            "provisions": [cls._parse_provision(p) for p in provisions],
            "raw_data": dtro_data
        }

    @classmethod
    def _parse_provision(cls, provision: Dict[str, Any]) -> Dict[str, Any]:
        """Parse a single provision"""
        regulation = provision.get("regulation", {})
        geometry_data = provision.get("geometry", {})

        return {
            "provision_index": provision.get("provisionIndex"),
            "description": provision.get("description"),
            "restriction_type": cls.REGULATION_TYPE_MAP.get(
                regulation.get("regulationType"),
                "other"
            ),
            "line_marking": cls.LINE_MARKING_MAP.get(
                regulation.get("lineMarking"),
                "other"
            ),
            "max_stay_minutes": regulation.get("maxStayMinutes"),
            "no_return_minutes": regulation.get("noReturnMinutes"),
            "geometry": cls._parse_geometry(geometry_data),
            "time_periods": [
                cls._parse_time_period(tp)
                for tp in provision.get("timePeriods", [])
            ],
            "exemptions": [
                cls._parse_exemption(ex)
                for ex in provision.get("exemptions", [])
            ]
        }

    @classmethod
    def _parse_geometry(cls, geometry_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse geometry data (GeoJSON or WKT)"""
        geojson = geometry_data.get("geojson")
        wkt = geometry_data.get("wkt")

        return {
            "geojson": geojson,
            "wkt": wkt,
            "road_name": geometry_data.get("roadName"),
            "usrn": geometry_data.get("usrn"),
            "locality": geometry_data.get("locality"),
            "town": geometry_data.get("town"),
            "side_of_road": geometry_data.get("sideOfRoad")
        }

    @classmethod
    def _parse_time_period(cls, time_period: Dict[str, Any]) -> Dict[str, Any]:
        """Parse time period data"""
        return {
            "start_time": time_period.get("startTime"),
            "end_time": time_period.get("endTime"),
            "days_of_week": time_period.get("daysOfWeek", []),
            "description": time_period.get("description"),
            "is_24_hours": time_period.get("is24Hours", False),
            "applies_on_public_holidays": time_period.get("appliesToPublicHolidays", True)
        }

    @classmethod
    def _parse_exemption(cls, exemption: Dict[str, Any]) -> Dict[str, Any]:
        """Parse exemption data"""
        return {
            "exemption_type": exemption.get("exemptionType"),
            "description": exemption.get("description"),
            "max_duration_minutes": exemption.get("maxDurationMinutes"),
            "permit_zone": exemption.get("permitZone")
        }

    @classmethod
    def _map_status(cls, status: Optional[str]) -> str:
        """Map D-TRO status to our internal status"""
        status_map = {
            "draft": "draft",
            "proposed": "proposed",
            "made": "made",
            "active": "active",
            "suspended": "suspended",
            "revoked": "revoked",
            "superseded": "superseded"
        }
        return status_map.get(status, "active")

    @classmethod
    def _parse_date(cls, date_str: Optional[str]) -> Optional[date]:
        """Parse ISO date string"""
        if not date_str:
            return None
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00")).date()
        except (ValueError, AttributeError):
            return None


# =========================================================================
# Convenience function for quick setup
# =========================================================================

def create_dtro_client(
    api_key: Optional[str] = None,
    environment: str = "production"
) -> DTROClient:
    """
    Create a D-TRO client with configuration from environment variables

    Environment variables:
        DTRO_API_KEY: Your D-TRO API key
        DTRO_ENVIRONMENT: "production" or "integration"
    """
    api_key = api_key or os.environ.get("DTRO_API_KEY")
    if not api_key:
        raise ValueError(
            "D-TRO API key required. Set DTRO_API_KEY environment variable "
            "or pass api_key parameter. Register at: "
            "https://www.gov.uk/guidance/digital-traffic-regulation-orders-d-tro-service"
        )

    env = DTROEnvironment(
        os.environ.get("DTRO_ENVIRONMENT", environment)
    )

    config = DTROConfig(api_key=api_key, environment=env)
    return DTROClient(config)
