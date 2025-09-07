"""Chat service for managing conversation history."""

import logging
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.message import Message
from app.models.session import UserSession
from app.schemas.chat import ChatMessage, ChatHistoryResponse

logger = logging.getLogger(__name__)


class ChatService:
    """Service for managing chat history and conversations."""
    
    def __init__(self, db: Session):
        """
        Initialize chat service.
        
        Args:
            db: Database session
        """
        self.db = db
    
    def get_chat_history(
        self,
        session_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> ChatHistoryResponse:
        """
        Retrieve chat history for a session.
        
        Args:
            session_id: Optional session ID to filter by
            limit: Number of messages to return
            offset: Offset for pagination
            
        Returns:
            ChatHistoryResponse with messages and metadata
        """
        # Build query
        query = self.db.query(Message)
        
        if session_id:
            # Verify session exists
            session = self.db.query(UserSession).filter(
                UserSession.id == session_id
            ).first()
            
            if not session:
                # Return empty response for non-existent session
                return ChatHistoryResponse(
                    messages=[],
                    total=0,
                    session_id=session_id or "unknown",
                    has_more=False
                )
            
            query = query.filter(Message.session_id == session_id)
        else:
            # If no session_id provided, get the most recent session
            recent_session = self.db.query(UserSession).order_by(
                desc(UserSession.last_activity)
            ).first()
            
            if recent_session:
                session_id = recent_session.id
                query = query.filter(Message.session_id == session_id)
            else:
                # No sessions exist
                return ChatHistoryResponse(
                    messages=[],
                    total=0,
                    session_id="none",
                    has_more=False
                )
        
        # Get total count
        total = query.count()
        
        # Get messages with pagination
        messages = query.order_by(desc(Message.timestamp)).limit(limit).offset(offset).all()
        
        # Reverse to show oldest first (chronological order)
        messages.reverse()
        
        # Convert to schemas
        chat_messages = []
        for msg in messages:
            nutrition_data = None
            if msg.nutrition_data:
                nutrition_data = {
                    "total_calories": msg.nutrition_data.total_calories,
                    "total_protein": msg.nutrition_data.total_protein,
                    "total_carbs": msg.nutrition_data.total_carbs,
                    "total_fat": msg.nutrition_data.total_fat,
                    "food_items": [
                        {
                            "name": item.name,
                            "amount": item.amount,
                            "calories": item.calories
                        }
                        for item in msg.nutrition_data.food_items
                    ]
                }
            
            chat_messages.append(ChatMessage(
                id=msg.id,
                content=msg.content,
                role=msg.role,
                timestamp=msg.timestamp,
                nutrition_data=nutrition_data
            ))
        
        has_more = (offset + limit) < total
        
        return ChatHistoryResponse(
            messages=chat_messages,
            total=total,
            session_id=session_id,
            has_more=has_more
        )
    
    def clear_session_history(self, session_id: str) -> bool:
        """
        Clear all messages for a session.
        
        Args:
            session_id: Session ID to clear
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Delete all messages for the session
            self.db.query(Message).filter(
                Message.session_id == session_id
            ).delete()
            
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error clearing session history: {e}")
            self.db.rollback()
            return False
    
    def get_session_summary(self, session_id: str) -> dict:
        """
        Get summary statistics for a session.
        
        Args:
            session_id: Session ID
            
        Returns:
            Dictionary with session statistics
        """
        session = self.db.query(UserSession).filter(
            UserSession.id == session_id
        ).first()
        
        if not session:
            return {
                "exists": False
            }
        
        # Get message count
        message_count = self.db.query(Message).filter(
            Message.session_id == session_id
        ).count()
        
        # Get messages with nutrition data
        nutrition_messages = self.db.query(Message).filter(
            Message.session_id == session_id,
            Message.nutrition_data_id.isnot(None)
        ).all()
        
        # Calculate total nutrition for the session
        total_calories = 0
        total_meals = len(nutrition_messages)
        
        for msg in nutrition_messages:
            if msg.nutrition_data:
                total_calories += msg.nutrition_data.total_calories
        
        return {
            "exists": True,
            "session_id": session_id,
            "created_at": session.created_at,
            "last_activity": session.last_activity,
            "message_count": message_count,
            "total_meals_analyzed": total_meals,
            "total_calories_tracked": total_calories
        }