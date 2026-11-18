"""Configuration settings for VayuMitra backend using Pydantic Settings."""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment or .env file."""

    PROJECT_NAME: str = "VayuMitra - Clean Air & Winter Smog Action Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Gemini API Key (optional default "" so app boots even before key is added)
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API key for GenAI action plans")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash", description="Gemini model variant")

    # CORS configuration with http://localhost:5173 enabled
    CORS_ORIGINS: list[str] | str = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
        description="Allowed origins for CORS",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Caching and Rate Limiting
    CACHE_TTL_SECONDS: int = 900  # 15 minutes TTL for city AQI and identical requests
    RATE_LIMIT_STRING: str = "60/minute"

    # Open-Meteo API Endpoints
    OPEN_METEO_GEOCODING_URL: str = "https://geocoding-api.open-meteo.com/v1/search"
    OPEN_METEO_AQI_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    OPEN_METEO_WEATHER_URL: str = "https://api.open-meteo.com/v1/forecast"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached Settings singleton."""
    return Settings()
