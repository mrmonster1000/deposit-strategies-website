"""
Configuration settings for UK Yellow Lines Database
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class DatabaseSettings(BaseSettings):
    """PostgreSQL + PostGIS database settings"""

    host: str = Field(default="localhost", alias="DB_HOST")
    port: int = Field(default=5432, alias="DB_PORT")
    name: str = Field(default="yellow_lines_db", alias="DB_NAME")
    user: str = Field(default="postgres", alias="DB_USER")
    password: str = Field(default="", alias="DB_PASSWORD")

    @property
    def url(self) -> str:
        """SQLAlchemy connection URL"""
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def async_url(self) -> str:
        """Async SQLAlchemy connection URL"""
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    class Config:
        env_prefix = "DB_"


class DTROSettings(BaseSettings):
    """D-TRO API settings"""

    api_key: str = Field(default="", alias="DTRO_API_KEY")
    environment: str = Field(default="production", alias="DTRO_ENVIRONMENT")
    timeout: int = Field(default=30, alias="DTRO_TIMEOUT")
    max_retries: int = Field(default=3, alias="DTRO_MAX_RETRIES")

    class Config:
        env_prefix = "DTRO_"


class ETLSettings(BaseSettings):
    """ETL pipeline settings"""

    batch_size: int = Field(default=100, alias="ETL_BATCH_SIZE")
    max_concurrent_authorities: int = Field(default=5, alias="ETL_MAX_CONCURRENT")
    full_sync_interval_days: int = Field(default=7, alias="ETL_FULL_SYNC_DAYS")
    incremental_sync_interval_hours: int = Field(default=6, alias="ETL_INCREMENTAL_HOURS")

    class Config:
        env_prefix = "ETL_"


class APISettings(BaseSettings):
    """API server settings"""

    host: str = Field(default="0.0.0.0", alias="API_HOST")
    port: int = Field(default=8000, alias="API_PORT")
    debug: bool = Field(default=False, alias="API_DEBUG")
    cors_origins: str = Field(default="*", alias="API_CORS_ORIGINS")

    # Rate limiting
    rate_limit_per_minute: int = Field(default=60, alias="API_RATE_LIMIT")

    # API keys (for authenticated endpoints)
    api_key: Optional[str] = Field(default=None, alias="API_KEY")

    class Config:
        env_prefix = "API_"


class Settings(BaseSettings):
    """Main application settings"""

    # Environment
    environment: str = Field(default="development", alias="ENVIRONMENT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # Sub-settings
    database: DatabaseSettings = DatabaseSettings()
    dtro: DTROSettings = DTROSettings()
    etl: ETLSettings = ETLSettings()
    api: APISettings = APISettings()

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get settings instance (for dependency injection)"""
    return settings
