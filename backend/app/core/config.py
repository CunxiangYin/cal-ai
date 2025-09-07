"""Application configuration settings."""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
import secrets


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "Cal AI Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./cal_ai.db")
    
    # AI Services
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    AI_PROVIDER: str = "anthropic"  # Options: anthropic, openai
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Session
    SESSION_EXPIRY_DAYS: int = 30
    SESSION_SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    
    # Rate Limiting
    MAX_REQUESTS_PER_MINUTE: int = 60
    
    # Voice Processing
    MAX_AUDIO_SIZE_MB: int = 10
    SUPPORTED_AUDIO_FORMATS: List[str] = ["mp3", "wav", "m4a", "webm"]
    
    # AI Prompts Configuration
    MEAL_ANALYSIS_MODEL: str = "claude-3-haiku-20240307"  # or "gpt-4-turbo"
    MAX_TOKENS: int = 1500
    TEMPERATURE: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
        # Parse CORS_ORIGINS as JSON
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == "CORS_ORIGINS":
                import json
                return json.loads(raw_val)
            return raw_val


# Create global settings instance
settings = Settings()