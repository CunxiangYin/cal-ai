"""Meal analysis service for processing food descriptions."""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.services.ai_integration import AIIntegrationService
from app.models.nutrition import NutritionInfo, FoodItem
from app.models.message import Message, MessageRole
from app.models.session import UserSession
from app.schemas.meal import MealAnalysisResponse, NutritionInfoSchema, FoodItemSchema

logger = logging.getLogger(__name__)


class MealAnalysisService:
    """Service for analyzing meals and calculating nutrition."""
    
    def __init__(self, db: Session):
        """
        Initialize meal analysis service.
        
        Args:
            db: Database session
        """
        self.db = db
        self.ai_service = AIIntegrationService()
    
    async def analyze_meal(
        self,
        description: str,
        session_id: Optional[str] = None,
        language: str = "auto"
    ) -> MealAnalysisResponse:
        """
        Analyze a meal description and return nutrition information.
        
        Args:
            description: Meal description from user
            session_id: Optional session ID for tracking
            language: Language preference
            
        Returns:
            MealAnalysisResponse with nutrition data and AI response
        """
        # Get or create session
        session = self._get_or_create_session(session_id)
        
        # Store user message
        user_message = self._create_message(
            session_id=session.id,
            content=description,
            role=MessageRole.USER
        )
        
        # Analyze meal using AI with session context
        ai_result = await self.ai_service.analyze_meal(description, language, session.id)
        
        # Create nutrition info
        nutrition_info = self._create_nutrition_info(ai_result)
        
        # Create assistant message with nutrition data
        assistant_message = self._create_message(
            session_id=session.id,
            content=ai_result.get("ai_response", "Meal analysis completed."),
            role=MessageRole.ASSISTANT,
            nutrition_data_id=nutrition_info.id
        )
        
        # Update session activity
        session.update_activity()
        self.db.commit()
        
        # Prepare response
        return MealAnalysisResponse(
            message_id=assistant_message.id,
            nutrition=self._nutrition_to_schema(nutrition_info),
            ai_response=ai_result.get("ai_response", "Meal analysis completed."),
            session_id=session.id,
            timestamp=assistant_message.timestamp
        )
    
    def _get_or_create_session(self, session_id: Optional[str]) -> UserSession:
        """Get existing session or create new one."""
        if session_id:
            session = self.db.query(UserSession).filter(
                UserSession.id == session_id
            ).first()
            if session:
                return session
        
        # Create new session
        import uuid
        session = UserSession(
            id=str(uuid.uuid4()),
            session_token=str(uuid.uuid4())
        )
        self.db.add(session)
        self.db.flush()
        return session
    
    def _create_message(
        self,
        session_id: str,
        content: str,
        role: MessageRole,
        nutrition_data_id: Optional[str] = None
    ) -> Message:
        """Create and save a message."""
        message = Message(
            session_id=session_id,
            content=content,
            role=role,
            nutrition_data_id=nutrition_data_id
        )
        self.db.add(message)
        self.db.flush()
        return message
    
    def _create_nutrition_info(self, ai_result: Dict[str, Any]) -> NutritionInfo:
        """Create nutrition info from AI analysis."""
        nutrition = NutritionInfo(
            analysis_notes=ai_result.get("analysis_notes", "")
        )
        self.db.add(nutrition)
        self.db.flush()
        
        # Add food items
        food_items_data = ai_result.get("food_items", [])
        for item_data in food_items_data:
            food_item = FoodItem(
                nutrition_info_id=nutrition.id,
                name=item_data.get("name", "Unknown"),
                name_cn=item_data.get("name_cn"),
                amount=str(item_data.get("amount", "1")),
                unit=item_data.get("unit", "serving"),
                calories=float(item_data.get("calories", 0)),
                protein=float(item_data.get("protein", 0)),
                carbs=float(item_data.get("carbs", 0)),
                fat=float(item_data.get("fat", 0)),
                fiber=item_data.get("fiber"),
                sugar=item_data.get("sugar"),
                sodium=item_data.get("sodium")
            )
            self.db.add(food_item)
            nutrition.food_items.append(food_item)
        
        # Calculate totals
        nutrition.calculate_totals()
        self.db.flush()
        
        return nutrition
    
    def _nutrition_to_schema(self, nutrition: NutritionInfo) -> NutritionInfoSchema:
        """Convert nutrition model to schema."""
        food_items = [
            FoodItemSchema(
                name=item.name,
                name_cn=item.name_cn,
                amount=item.amount,
                unit=item.unit,
                calories=item.calories,
                protein=item.protein,
                carbs=item.carbs,
                fat=item.fat,
                fiber=item.fiber,
                sugar=item.sugar,
                sodium=item.sodium
            )
            for item in nutrition.food_items
        ]
        
        return NutritionInfoSchema(
            total_calories=nutrition.total_calories,
            total_protein=nutrition.total_protein,
            total_carbs=nutrition.total_carbs,
            total_fat=nutrition.total_fat,
            total_fiber=nutrition.total_fiber,
            total_sugar=nutrition.total_sugar,
            total_sodium=nutrition.total_sodium,
            food_items=food_items,
            analysis_notes=nutrition.analysis_notes
        )