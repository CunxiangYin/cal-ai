"""Chat history API endpoints."""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db
from app.schemas.chat import ChatHistoryResponse
from app.services.chat import ChatService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])


@router.get(
    "/chat-history",
    response_model=ChatHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get chat history",
    description="Retrieve chat history for a session with pagination"
)
async def get_chat_history(
    session_id: Optional[str] = Query(None, description="Session ID to filter by"),
    limit: int = Query(50, ge=1, le=200, description="Number of messages to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db)
) -> ChatHistoryResponse:
    """
    Retrieve chat history with optional filtering by session.
    
    Args:
        session_id: Optional session ID to filter messages
        limit: Maximum number of messages to return
        offset: Pagination offset
        db: Database session
        
    Returns:
        ChatHistoryResponse with messages and metadata
        
    Raises:
        HTTPException: If retrieval fails
    """
    try:
        service = ChatService(db)
        
        response = service.get_chat_history(
            session_id=session_id,
            limit=limit,
            offset=offset
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve chat history: {str(e)}"
        )


@router.get(
    "/session-summary/{session_id}",
    status_code=status.HTTP_200_OK,
    summary="Get session summary",
    description="Get summary statistics for a specific session"
)
async def get_session_summary(
    session_id: str,
    db: Session = Depends(get_db)
) -> dict:
    """
    Get summary statistics for a session.
    
    Args:
        session_id: Session ID
        db: Database session
        
    Returns:
        Dictionary with session statistics
        
    Raises:
        HTTPException: If session not found
    """
    try:
        service = ChatService(db)
        summary = service.get_session_summary(session_id)
        
        if not summary.get("exists"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {session_id} not found"
            )
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session summary: {str(e)}"
        )


@router.delete(
    "/chat-history/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Clear session history",
    description="Delete all messages for a specific session"
)
async def clear_session_history(
    session_id: str,
    db: Session = Depends(get_db)
) -> None:
    """
    Clear all messages for a session.
    
    Args:
        session_id: Session ID to clear
        db: Database session
        
    Raises:
        HTTPException: If deletion fails
    """
    try:
        service = ChatService(db)
        success = service.clear_session_history(session_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to clear session history"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing session history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear session history: {str(e)}"
        )