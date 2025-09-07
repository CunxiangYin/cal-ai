"""Tests for meal analysis functionality."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from app.core.database import Base, get_db

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


class TestMealAnalysis:
    """Test meal analysis endpoints."""
    
    def test_analyze_meal_success(self):
        """Test successful meal analysis."""
        response = client.post(
            "/api/analyze-meal",
            json={
                "message": "I had 2 eggs and toast for breakfast",
                "language": "en"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message_id" in data
        assert "nutrition" in data
        assert "ai_response" in data
        assert "session_id" in data
        
        # Check nutrition data
        nutrition = data["nutrition"]
        assert "total_calories" in nutrition
        assert "total_protein" in nutrition
        assert "total_carbs" in nutrition
        assert "total_fat" in nutrition
        assert "food_items" in nutrition
        
    def test_analyze_meal_empty_message(self):
        """Test meal analysis with empty message."""
        response = client.post(
            "/api/analyze-meal",
            json={
                "message": ""
            }
        )
        
        assert response.status_code == 422  # Validation error
        
    def test_analyze_meal_with_session(self):
        """Test meal analysis with session tracking."""
        # First request
        response1 = client.post(
            "/api/analyze-meal",
            json={
                "message": "I had a sandwich for lunch"
            }
        )
        
        assert response1.status_code == 200
        session_id = response1.json()["session_id"]
        
        # Second request with same session
        response2 = client.post(
            "/api/analyze-meal",
            json={
                "message": "I also had a cookie",
                "session_id": session_id
            }
        )
        
        assert response2.status_code == 200
        assert response2.json()["session_id"] == session_id


class TestChatHistory:
    """Test chat history endpoints."""
    
    def test_get_chat_history_empty(self):
        """Test getting chat history when empty."""
        response = client.get("/api/chat-history")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "messages" in data
        assert "total" in data
        assert "session_id" in data
        assert "has_more" in data
        
    def test_get_chat_history_with_messages(self):
        """Test getting chat history after adding messages."""
        # Create a message first
        meal_response = client.post(
            "/api/analyze-meal",
            json={
                "message": "Test meal"
            }
        )
        session_id = meal_response.json()["session_id"]
        
        # Get chat history
        response = client.get(f"/api/chat-history?session_id={session_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["messages"]) > 0
        assert data["total"] > 0


class TestHealth:
    """Test health check endpoints."""
    
    def test_health_check(self):
        """Test basic health check."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
        assert "version" in data
        assert "timestamp" in data
        
    def test_database_health_check(self):
        """Test database health check."""
        response = client.get("/health/db")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
        assert data["details"]["database"] == "connected"