"""Meal analysis API endpoints."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db
from app.schemas.meal import MealAnalysisRequest, MealAnalysisResponse
from app.services.meal_analysis import MealAnalysisService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["meal"])


@router.post(
    "/analyze-meal",
    response_model=MealAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze meal and calculate nutrition",
    description="Analyze a meal description and return detailed nutritional information"
)
async def analyze_meal(
    request: MealAnalysisRequest,
    db: Session = Depends(get_db)
) -> MealAnalysisResponse:
    """
    Analyze a meal description and calculate nutrition information.
    
    Args:
        request: Meal analysis request with description
        db: Database session
        
    Returns:
        MealAnalysisResponse with nutrition breakdown and AI response
        
    Raises:
        HTTPException: If analysis fails
    """
    try:
        service = MealAnalysisService(db)
        
        response = await service.analyze_meal(
            description=request.message,
            session_id=request.session_id,
            language=request.language
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing meal: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze meal: {str(e)}"
        )