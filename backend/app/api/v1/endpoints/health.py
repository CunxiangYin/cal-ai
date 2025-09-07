"""Health check API endpoints."""

import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.v1.deps import get_db
from app.schemas.common import HealthCheck
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthCheck,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Check if the service is healthy and running"
)
async def health_check() -> HealthCheck:
    """
    Basic health check endpoint.
    
    Returns:
        HealthCheck response with service status
    """
    return HealthCheck(
        status="healthy",
        version=settings.APP_VERSION,
        details={
            "app_name": settings.APP_NAME,
            "ai_provider": settings.AI_PROVIDER,
            "debug_mode": settings.DEBUG
        }
    )


@router.get(
    "/health/db",
    response_model=HealthCheck,
    status_code=status.HTTP_200_OK,
    summary="Database health check",
    description="Check database connectivity"
)
async def database_health_check(
    db: Session = Depends(get_db)
) -> HealthCheck:
    """
    Database connectivity health check.
    
    Args:
        db: Database session
        
    Returns:
        HealthCheck response with database status
    """
    try:
        # Execute a simple query to check database connectivity
        result = db.execute(text("SELECT 1"))
        result.scalar()
        
        return HealthCheck(
            status="healthy",
            version=settings.APP_VERSION,
            details={
                "database": "connected",
                "database_url": settings.DATABASE_URL.split("://")[0]  # Show only the DB type
            }
        )
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return HealthCheck(
            status="unhealthy",
            version=settings.APP_VERSION,
            details={
                "database": "disconnected",
                "error": str(e)
            }
        )