"""Voice processing service for audio transcription."""

import logging
import os
from typing import Optional, BinaryIO
from pathlib import Path
import aiofiles
import random

from app.core.config import settings
from app.schemas.voice import VoiceToTextResponse

logger = logging.getLogger(__name__)


class VoiceService:
    """Service for processing voice input and transcription."""
    
    def __init__(self):
        """Initialize voice service."""
        self.supported_formats = settings.SUPPORTED_AUDIO_FORMATS
        self.max_size_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024
    
    async def transcribe_audio(
        self,
        audio_file: BinaryIO,
        filename: str
    ) -> VoiceToTextResponse:
        """
        Transcribe audio file to text.
        
        Args:
            audio_file: Audio file binary data
            filename: Original filename
            
        Returns:
            VoiceToTextResponse with transcribed text
            
        Raises:
            ValueError: If file format is not supported or file is too large
        """
        # Validate file format
        file_extension = Path(filename).suffix.lower().lstrip('.')
        if file_extension not in self.supported_formats:
            raise ValueError(
                f"Unsupported audio format: {file_extension}. "
                f"Supported formats: {', '.join(self.supported_formats)}"
            )
        
        # Check file size
        audio_file.seek(0, 2)  # Seek to end
        file_size = audio_file.tell()
        audio_file.seek(0)  # Reset to beginning
        
        if file_size > self.max_size_bytes:
            raise ValueError(
                f"Audio file too large. Maximum size: {settings.MAX_AUDIO_SIZE_MB}MB"
            )
        
        # For now, return mock transcription
        # In production, integrate with Whisper API or other transcription service
        return await self._mock_transcribe(filename)
    
    async def _mock_transcribe(self, filename: str) -> VoiceToTextResponse:
        """
        Mock transcription for testing.
        
        Args:
            filename: Audio filename
            
        Returns:
            Mock transcription response
        """
        # Simulate processing delay
        import asyncio
        await asyncio.sleep(0.5)
        
        # Generate mock transcription based on random samples
        sample_meals = [
            ("I had a chicken salad with ranch dressing and a diet coke", "en"),
            ("我早餐吃了两个鸡蛋和一片全麦面包", "zh"),
            ("For lunch I had a turkey sandwich with lettuce and tomato", "en"),
            ("晚饭吃了一碗牛肉面加一个煎蛋", "zh"),
            ("I just finished a large pepperoni pizza and a beer", "en"),
            ("下午茶喝了一杯拿铁和一块芝士蛋糕", "zh"),
            ("Had grilled salmon with steamed vegetables and brown rice", "en"),
            ("早上喝了一杯豆浆配两个包子", "zh")
        ]
        
        text, language = random.choice(sample_meals)
        confidence = random.uniform(0.85, 0.99)
        duration = random.uniform(2.0, 5.0)
        
        logger.info(f"Mock transcribed audio file: {filename}")
        
        return VoiceToTextResponse(
            text=text,
            confidence=round(confidence, 2),
            language=language,
            duration_seconds=round(duration, 1)
        )
    
    async def transcribe_with_whisper(
        self,
        audio_file_path: str
    ) -> VoiceToTextResponse:
        """
        Transcribe audio using OpenAI Whisper API.
        
        Args:
            audio_file_path: Path to saved audio file
            
        Returns:
            Transcription response
        """
        if not settings.OPENAI_API_KEY:
            logger.warning("OpenAI API key not configured, using mock transcription")
            return await self._mock_transcribe(audio_file_path)
        
        try:
            import openai
            
            client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            
            async with aiofiles.open(audio_file_path, 'rb') as audio:
                audio_data = await audio.read()
            
            # Call Whisper API
            response = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_data,
                response_format="verbose_json"
            )
            
            return VoiceToTextResponse(
                text=response.text,
                confidence=0.95,  # Whisper doesn't provide confidence scores
                language=response.language or "en",
                duration_seconds=response.duration
            )
            
        except Exception as e:
            logger.error(f"Error transcribing with Whisper: {e}")
            # Fallback to mock
            return await self._mock_transcribe(audio_file_path)
    
    async def save_audio_file(
        self,
        audio_file: BinaryIO,
        filename: str
    ) -> str:
        """
        Save uploaded audio file temporarily.
        
        Args:
            audio_file: Audio file data
            filename: Original filename
            
        Returns:
            Path to saved file
        """
        import uuid
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads/audio")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = audio_file.read()
            await f.write(content)
        
        logger.info(f"Saved audio file: {file_path}")
        
        return str(file_path)
    
    async def cleanup_audio_file(self, file_path: str) -> None:
        """
        Remove temporary audio file.
        
        Args:
            file_path: Path to audio file
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up audio file: {file_path}")
        except Exception as e:
            logger.error(f"Error cleaning up audio file {file_path}: {e}")