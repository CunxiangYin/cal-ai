"""Chat history related schemas."""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    """Chat message schema."""
    id: str = Field(..., description="Message ID")
    content: str = Field(..., description="Message content")
    role: MessageRole = Field(..., description="Message role")
    timestamp: datetime = Field(..., description="Message timestamp")
    nutrition_data: Optional[dict] = Field(None, description="Associated nutrition data if any")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "id": "msg-uuid",
            "content": "I had a sandwich for lunch",
            "role": "user",
            "timestamp": "2024-01-01T12:00:00Z",
            "nutrition_data": None
        }
    })


class ChatHistoryRequest(BaseModel):
    """Request for chat history."""
    session_id: Optional[str] = Field(None, description="Session ID to filter by")
    limit: int = Field(50, ge=1, le=200, description="Number of messages to return")
    offset: int = Field(0, ge=0, description="Offset for pagination")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "session_id": "optional-session-id",
            "limit": 50,
            "offset": 0
        }
    })


class ChatHistoryResponse(BaseModel):
    """Response containing chat history."""
    messages: List[ChatMessage] = Field(..., description="List of chat messages")
    total: int = Field(..., description="Total number of messages")
    session_id: str = Field(..., description="Session ID")
    has_more: bool = Field(..., description="Whether more messages are available")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "messages": [],
            "total": 100,
            "session_id": "session-uuid",
            "has_more": True
        }
    })