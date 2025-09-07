"""Meal analysis related schemas."""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class MealAnalysisRequest(BaseModel):
    """Request for meal analysis."""
    message: str = Field(..., min_length=1, max_length=5000, description="Meal description")
    session_id: Optional[str] = Field(None, description="Session ID for tracking")
    language: Optional[str] = Field("auto", description="Language preference (auto, en, zh)")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "message": "I had 2 scrambled eggs, 2 slices of whole wheat toast with butter, and a glass of orange juice",
            "session_id": "optional-session-id",
            "language": "en"
        }
    })


class FoodItemSchema(BaseModel):
    """Individual food item with nutrition data."""
    name: str = Field(..., description="Food item name")
    name_cn: Optional[str] = Field(None, description="Chinese name if applicable")
    amount: str = Field(..., description="Quantity/portion size")
    unit: Optional[str] = Field(None, description="Measurement unit")
    calories: float = Field(..., ge=0, description="Calories")
    protein: float = Field(..., ge=0, description="Protein in grams")
    carbs: float = Field(..., ge=0, description="Carbohydrates in grams")
    fat: float = Field(..., ge=0, description="Fat in grams")
    fiber: Optional[float] = Field(None, ge=0, description="Fiber in grams")
    sugar: Optional[float] = Field(None, ge=0, description="Sugar in grams")
    sodium: Optional[float] = Field(None, ge=0, description="Sodium in milligrams")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "name": "Scrambled Eggs",
            "amount": "2",
            "unit": "large eggs",
            "calories": 140,
            "protein": 12,
            "carbs": 1,
            "fat": 10
        }
    })


class NutritionInfoSchema(BaseModel):
    """Aggregated nutrition information."""
    total_calories: float = Field(..., ge=0, description="Total calories")
    total_protein: float = Field(..., ge=0, description="Total protein in grams")
    total_carbs: float = Field(..., ge=0, description="Total carbohydrates in grams")
    total_fat: float = Field(..., ge=0, description="Total fat in grams")
    total_fiber: Optional[float] = Field(None, ge=0, description="Total fiber in grams")
    total_sugar: Optional[float] = Field(None, ge=0, description="Total sugar in grams")
    total_sodium: Optional[float] = Field(None, ge=0, description="Total sodium in milligrams")
    food_items: List[FoodItemSchema] = Field(..., description="Individual food items")
    analysis_notes: Optional[str] = Field(None, description="Nutritional analysis and advice")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "total_calories": 450,
            "total_protein": 15.5,
            "total_carbs": 45.2,
            "total_fat": 18.3,
            "food_items": [],
            "analysis_notes": "This meal provides a good balance of protein and carbohydrates. Consider adding more vegetables for additional fiber and nutrients."
        }
    })


class MealAnalysisResponse(BaseModel):
    """Response from meal analysis."""
    message_id: str = Field(..., description="Unique message ID")
    nutrition: NutritionInfoSchema = Field(..., description="Nutrition breakdown")
    ai_response: str = Field(..., description="AI assistant's response")
    session_id: str = Field(..., description="Session ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Analysis timestamp")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "message_id": "uuid-here",
            "nutrition": {},
            "ai_response": "I've analyzed your meal. You consumed approximately 450 calories with a good balance of macronutrients.",
            "session_id": "session-uuid",
            "timestamp": "2024-01-01T12:00:00Z"
        }
    })