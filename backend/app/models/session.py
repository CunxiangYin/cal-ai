"""User session model."""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Index
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class UserSession(Base):
    """User session for tracking conversations."""
    
    __tablename__ = "user_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_token = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_activity = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("ix_user_sessions_last_activity", "last_activity"),
    )
    
    def update_activity(self):
        """Update last activity timestamp."""
        self.last_activity = datetime.utcnow()