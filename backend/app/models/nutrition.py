"""Nutrition information models."""

from datetime import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class NutritionInfo(Base):
    """Aggregated nutrition information for a meal."""
    
    __tablename__ = "nutrition_info"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    total_calories = Column(Float, nullable=False, default=0)
    total_protein = Column(Float, nullable=False, default=0)
    total_carbs = Column(Float, nullable=False, default=0)
    total_fat = Column(Float, nullable=False, default=0)
    total_fiber = Column(Float, nullable=True)
    total_sugar = Column(Float, nullable=True)
    total_sodium = Column(Float, nullable=True)
    analysis_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    food_items = relationship("FoodItem", back_populates="nutrition_info", cascade="all, delete-orphan")
    message = relationship("Message", back_populates="nutrition_data", uselist=False)
    
    def calculate_totals(self):
        """Recalculate totals from food items."""
        self.total_calories = sum(item.calories or 0 for item in self.food_items)
        self.total_protein = sum(item.protein or 0 for item in self.food_items)
        self.total_carbs = sum(item.carbs or 0 for item in self.food_items)
        self.total_fat = sum(item.fat or 0 for item in self.food_items)
        self.total_fiber = sum(item.fiber or 0 for item in self.food_items if item.fiber)
        self.total_sugar = sum(item.sugar or 0 for item in self.food_items if item.sugar)
        self.total_sodium = sum(item.sodium or 0 for item in self.food_items if item.sodium)


class FoodItem(Base):
    """Individual food item with nutrition information."""
    
    __tablename__ = "food_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nutrition_info_id = Column(String, ForeignKey("nutrition_info.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    name_cn = Column(String, nullable=True)  # Chinese name if applicable
    amount = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    calories = Column(Float, nullable=False, default=0)
    protein = Column(Float, nullable=False, default=0)
    carbs = Column(Float, nullable=False, default=0)
    fat = Column(Float, nullable=False, default=0)
    fiber = Column(Float, nullable=True)
    sugar = Column(Float, nullable=True)
    sodium = Column(Float, nullable=True)
    
    # Relationships
    nutrition_info = relationship("NutritionInfo", back_populates="food_items")
    
    # Indexes
    __table_args__ = (
        Index("ix_food_items_name", "name"),
    )