"""Message model for chat history."""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Index
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class MessageRole(str, PyEnum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(Base):
    """Chat message with optional nutrition data."""
    
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("user_sessions.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    role = Column(Enum(MessageRole), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    nutrition_data_id = Column(String, ForeignKey("nutrition_info.id"), nullable=True)
    
    # Relationships
    session = relationship("UserSession", back_populates="messages")
    nutrition_data = relationship("NutritionInfo", back_populates="message", uselist=False)
    
    # Indexes
    __table_args__ = (
        Index("ix_messages_session_timestamp", "session_id", "timestamp"),
    )