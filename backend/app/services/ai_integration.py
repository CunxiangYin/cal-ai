"""AI service integration for meal analysis."""

import json
import logging
from typing import Optional, Dict, Any, List
from abc import ABC, abstractmethod

from app.core.config import settings
from app.services.ai_prompts import prompt_manager
from app.services.session_manager import session_manager

logger = logging.getLogger(__name__)


class AIClient(ABC):
    """Abstract base class for AI clients."""
    
    @abstractmethod
    async def analyze_meal(self, description: str, language: str = "auto") -> Dict[str, Any]:
        """Analyze meal description and return nutrition information."""
        pass


class AnthropicClient(AIClient):
    """Claude AI client for meal analysis."""
    
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.MEAL_ANALYSIS_MODEL or "claude-3-haiku-20240307"
        
    async def analyze_meal(self, description: str, language: str = "auto") -> Dict[str, Any]:
        """
        Analyze meal using Claude AI.
        
        Args:
            description: Meal description
            language: Language preference (auto, en, zh)
            
        Returns:
            Analyzed nutrition data
        """
        if not self.api_key:
            return self._get_mock_response(description)
            
        try:
            import anthropic
            
            client = anthropic.AsyncAnthropic(api_key=self.api_key)
            
            # Get user context if available (for future enhancement)
            context = self._get_user_context()
            prompt = self._create_prompt(description, language, context)
            
            response = await client.messages.create(
                model=self.model,
                max_tokens=settings.MAX_TOKENS,
                temperature=settings.TEMPERATURE,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Parse the response
            content = response.content[0].text
            return self._parse_ai_response(content)
            
        except Exception as e:
            logger.error(f"Error calling Anthropic API: {e}")
            return self._get_mock_response(description)
    
    def _create_prompt(self, description: str, language: str, context: Dict = None) -> str:
        """Create prompt for meal analysis using optimized prompt manager."""
        return prompt_manager.get_meal_analysis_prompt(description, language, context)
    
    def _get_user_context(self, session_id: str = None) -> Dict:
        """Get user context for personalized responses."""
        if session_id:
            return session_manager.get_context_for_ai(session_id)
        return {}
    
    def _parse_ai_response(self, content: str) -> Dict[str, Any]:
        """Parse AI response into structured data."""
        try:
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                # If no JSON found, return mock response
                return self._get_mock_response("")
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI response as JSON: {content}")
            return self._get_mock_response("")
    
    def _get_mock_response(self, description: str) -> Dict[str, Any]:
        """Get mock response for testing or when AI is unavailable."""
        return {
            "food_items": [
                {
                    "name": "Estimated meal",
                    "name_cn": "估算餐食",
                    "amount": "1",
                    "unit": "serving",
                    "calories": 500,
                    "protein": 20,
                    "carbs": 50,
                    "fat": 25,
                    "fiber": 5,
                    "sugar": 10,
                    "sodium": 800
                }
            ],
            "analysis_notes": "This is an estimated nutritional breakdown. For more accurate results, please provide specific food items and quantities.",
            "ai_response": f"I've provided an estimated nutritional breakdown for your meal. To get more accurate results, please describe specific food items and their quantities."
        }


class OpenAIClient(AIClient):
    """OpenAI client for meal analysis."""
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4-turbo-preview"
        
    async def analyze_meal(self, description: str, language: str = "auto") -> Dict[str, Any]:
        """
        Analyze meal using OpenAI.
        
        Args:
            description: Meal description
            language: Language preference
            
        Returns:
            Analyzed nutrition data
        """
        if not self.api_key:
            return self._get_mock_response(description)
            
        try:
            import openai
            
            client = openai.AsyncOpenAI(api_key=self.api_key)
            
            context = self._get_user_context()
            prompt = self._create_prompt(description, language, context)
            
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional nutritionist AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=settings.TEMPERATURE,
                max_tokens=settings.MAX_TOKENS,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return self._get_mock_response(description)
    
    def _create_prompt(self, description: str, language: str, context: Dict = None) -> str:
        """Create prompt for meal analysis using optimized prompt manager."""
        return prompt_manager.get_meal_analysis_prompt(description, language, context)
    
    def _get_user_context(self) -> Dict:
        """Get user context for personalized responses."""
        return {}
    
    def _get_mock_response(self, description: str) -> Dict[str, Any]:
        """Get mock response."""
        return AnthropicClient._get_mock_response(self, description)


class AIIntegrationService:
    """Service for integrating with AI providers."""
    
    def __init__(self):
        """Initialize AI integration service."""
        self.client = self._get_ai_client()
    
    def _get_ai_client(self) -> AIClient:
        """Get the appropriate AI client based on configuration."""
        if settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            return OpenAIClient()
        else:
            return AnthropicClient()
    
    async def analyze_meal(self, description: str, language: str = "auto", session_id: str = None) -> Dict[str, Any]:
        """
        Analyze meal description using configured AI provider.
        
        Args:
            description: Meal description from user
            language: Language preference
            session_id: Optional session ID for context
            
        Returns:
            Structured nutrition data with context awareness
        """
        # Get session context if available
        if session_id:
            context = session_manager.get_context_for_ai(session_id)
            # Store user message
            session_manager.add_message(session_id, {
                "type": "user",
                "content": description
            })
        else:
            context = {}
        
        # Analyze with context
        result = await self.client.analyze_meal(description, language)
        
        # Update session with results
        if session_id and result.get("nutrition"):
            session_manager.update_daily_intake(session_id, result["nutrition"])
            # Store AI response
            session_manager.add_message(session_id, {
                "type": "assistant",
                "content": result.get("ai_response", ""),
                "nutrition": result.get("nutrition")
            })
        
        return result