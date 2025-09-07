"""Voice processing related schemas."""

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class VoiceToTextResponse(BaseModel):
    """Response from voice to text conversion."""
    text: str = Field(..., description="Transcribed text from audio")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score of transcription")
    language: str = Field(..., description="Detected language code")
    duration_seconds: Optional[float] = Field(None, ge=0, description="Audio duration in seconds")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "text": "I had two eggs and toast for breakfast",
            "confidence": 0.95,
            "language": "en",
            "duration_seconds": 3.5
        }
    })


class VoiceProcessingError(BaseModel):
    """Error response for voice processing."""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    supported_formats: Optional[list] = Field(None, description="List of supported audio formats")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "error": "unsupported_format",
            "message": "The uploaded audio format is not supported",
            "supported_formats": ["mp3", "wav", "m4a", "webm"]
        }
    })