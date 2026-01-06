"""Configuration settings for the ML service."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service info
    app_name: str = "EduNexus ML Service"
    debug: bool = False

    # API Keys
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # Model settings
    default_llm_provider: str = "openai"  # openai or anthropic
    openai_model: str = "gpt-4-turbo-preview"
    anthropic_model: str = "claude-3-sonnet-20240229"

    # Redis for caching
    redis_url: str = "redis://localhost:6379"

    # Vector DB settings
    chroma_persist_dir: str = "./data/chroma"

    # NestJS API URL (for fetching data)
    nestjs_api_url: str = "http://localhost:3001"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
