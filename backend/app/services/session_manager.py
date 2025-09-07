"""
Session and Context Manager for Cal AI
Manages user sessions, conversation history, and daily intake tracking
"""

from typing import Dict, List, Optional
from datetime import datetime, date
from collections import defaultdict
import json


class SessionManager:
    """Manages user sessions and conversation context."""
    
    def __init__(self):
        # In-memory storage (would use database in production)
        self.sessions: Dict[str, Dict] = {}
        self.daily_intake: Dict[str, Dict[str, float]] = defaultdict(lambda: {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "meals": []
        })
        self.user_profiles: Dict[str, Dict] = {}
    
    def get_session_context(self, session_id: str) -> Dict:
        """Get context for a session."""
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "created_at": datetime.now().isoformat(),
                "messages": [],
                "daily_intake": self.get_daily_intake(session_id),
                "user_profile": self.get_user_profile(session_id)
            }
        return self.sessions[session_id]
    
    def add_message(self, session_id: str, message: Dict):
        """Add a message to session history."""
        context = self.get_session_context(session_id)
        context["messages"].append({
            **message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only last 10 messages for context
        if len(context["messages"]) > 10:
            context["messages"] = context["messages"][-10:]
    
    def update_daily_intake(self, session_id: str, nutrition_data: Dict):
        """Update daily nutrition intake."""
        today_key = f"{session_id}_{date.today().isoformat()}"
        intake = self.daily_intake[today_key]
        
        # Add nutrition values
        if nutrition_data:
            intake["calories"] += nutrition_data.get("total_calories", 0)
            intake["protein"] += nutrition_data.get("total_protein", 0)
            intake["carbs"] += nutrition_data.get("total_carbs", 0)
            intake["fat"] += nutrition_data.get("total_fat", 0)
            
            # Add meal record
            intake["meals"].append({
                "time": datetime.now().isoformat(),
                "items": nutrition_data.get("food_items", [])
            })
    
    def get_daily_intake(self, session_id: str) -> Dict:
        """Get today's nutrition intake."""
        today_key = f"{session_id}_{date.today().isoformat()}"
        return dict(self.daily_intake[today_key])
    
    def set_user_profile(self, session_id: str, profile: Dict):
        """Set user profile information."""
        self.user_profiles[session_id] = {
            **profile,
            "updated_at": datetime.now().isoformat()
        }
    
    def get_user_profile(self, session_id: str) -> Dict:
        """Get user profile."""
        return self.user_profiles.get(session_id, {})
    
    def get_conversation_summary(self, session_id: str) -> Dict:
        """Get a summary of the conversation."""
        context = self.get_session_context(session_id)
        intake = self.get_daily_intake(session_id)
        
        # Count meal records
        meal_count = len(intake.get("meals", []))
        
        # Get food items mentioned
        all_foods = []
        for meal in intake.get("meals", []):
            for item in meal.get("items", []):
                all_foods.append(item.get("name_cn") or item.get("name"))
        
        return {
            "session_id": session_id,
            "message_count": len(context["messages"]),
            "daily_totals": {
                "calories": intake["calories"],
                "protein": intake["protein"],
                "carbs": intake["carbs"],
                "fat": intake["fat"]
            },
            "meal_count": meal_count,
            "foods_mentioned": all_foods,
            "created_at": context.get("created_at")
        }
    
    def get_context_for_ai(self, session_id: str) -> Dict:
        """Get context formatted for AI prompt."""
        intake = self.get_daily_intake(session_id)
        profile = self.get_user_profile(session_id)
        context = self.get_session_context(session_id)
        
        # Get recent messages for conversation context
        recent_messages = context["messages"][-5:] if context["messages"] else []
        
        return {
            "daily_intake": f"{intake['calories']:.0f}",
            "user_goals": profile.get("goals", "保持健康饮食"),
            "dietary_restrictions": profile.get("restrictions", "无"),
            "recent_foods": [
                item.get("name_cn") or item.get("name") 
                for meal in intake.get("meals", [])[-3:]  # Last 3 meals
                for item in meal.get("items", [])
            ],
            "conversation_history": [
                {"type": msg.get("type"), "content": msg.get("content")}
                for msg in recent_messages
            ]
        }
    
    def clear_session(self, session_id: str):
        """Clear a session's data."""
        if session_id in self.sessions:
            del self.sessions[session_id]
        
        # Clear today's intake
        today_key = f"{session_id}_{date.today().isoformat()}"
        if today_key in self.daily_intake:
            del self.daily_intake[today_key]


# Singleton instance
session_manager = SessionManager()