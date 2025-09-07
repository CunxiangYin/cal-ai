"""Voice processing API endpoints."""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse

from app.schemas.voice import VoiceToTextResponse, VoiceProcessingError
from app.services.voice import VoiceService
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["voice"])


@router.post(
    "/voice-to-text",
    response_model=VoiceToTextResponse,
    status_code=status.HTTP_200_OK,
    summary="Convert voice to text",
    description="Transcribe audio file to text for meal description",
    responses={
        400: {"model": VoiceProcessingError, "description": "Invalid audio format or file too large"},
        500: {"description": "Internal server error"}
    }
)
async def voice_to_text(
    audio: UploadFile = File(..., description="Audio file to transcribe")
) -> VoiceToTextResponse:
    """
    Convert audio file to text.
    
    Args:
        audio: Uploaded audio file
        
    Returns:
        VoiceToTextResponse with transcribed text
        
    Raises:
        HTTPException: If transcription fails or file is invalid
    """
    try:
        service = VoiceService()
        
        # Validate file
        if not audio.filename:
            raise ValueError("No filename provided")
        
        # Transcribe audio
        result = await service.transcribe_audio(
            audio_file=audio.file,
            filename=audio.filename
        )
        
        return result
        
    except ValueError as e:
        logger.warning(f"Invalid audio file: {e}")
        error_response = VoiceProcessingError(
            error="invalid_input",
            message=str(e),
            supported_formats=settings.SUPPORTED_AUDIO_FORMATS
        )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response.model_dump()
        )
        
    except Exception as e:
        logger.error(f"Error processing audio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process audio: {str(e)}"
        )
    
    finally:
        # Close the uploaded file
        await audio.close()


@router.get(
    "/voice/supported-formats",
    status_code=status.HTTP_200_OK,
    summary="Get supported audio formats",
    description="Get list of supported audio formats for transcription"
)
async def get_supported_formats() -> dict:
    """
    Get supported audio formats.
    
    Returns:
        Dictionary with supported formats and size limits
    """
    return {
        "supported_formats": settings.SUPPORTED_AUDIO_FORMATS,
        "max_file_size_mb": settings.MAX_AUDIO_SIZE_MB,
        "recommended_format": "mp3",
        "sample_rate_hz": 16000
    }