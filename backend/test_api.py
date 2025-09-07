#!/usr/bin/env python3
"""Quick test script for Cal AI Backend API."""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    print("🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        print("✅ Health check passed:", response.json())
    else:
        print("❌ Health check failed:", response.status_code)
    return response.status_code == 200

def test_meal_analysis():
    """Test meal analysis endpoint."""
    print("\n🍽️ Testing meal analysis...")
    
    test_meals = [
        "I had 2 scrambled eggs, 2 slices of whole wheat toast with butter, and a glass of orange juice for breakfast",
        "午餐吃了一碗牛肉面加一个煎蛋",
        "Just finished a large pepperoni pizza and a beer"
    ]
    
    for meal in test_meals:
        print(f"\n📝 Analyzing: '{meal[:50]}...'")
        
        response = requests.post(
            f"{BASE_URL}/api/analyze-meal",
            json={
                "message": meal,
                "language": "auto"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            nutrition = data["nutrition"]
            print(f"✅ Analysis successful!")
            print(f"   - Total Calories: {nutrition['total_calories']:.0f} kcal")
            print(f"   - Protein: {nutrition['total_protein']:.1f}g")
            print(f"   - Carbs: {nutrition['total_carbs']:.1f}g")
            print(f"   - Fat: {nutrition['total_fat']:.1f}g")
            print(f"   - Food Items: {len(nutrition['food_items'])}")
            print(f"   - AI Response: {data['ai_response'][:100]}...")
            
            return data.get("session_id")
        else:
            print(f"❌ Analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
    
    return None

def test_chat_history(session_id=None):
    """Test chat history endpoint."""
    print("\n💬 Testing chat history...")
    
    params = {}
    if session_id:
        params["session_id"] = session_id
        
    response = requests.get(f"{BASE_URL}/api/chat-history", params=params)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Chat history retrieved!")
        print(f"   - Total Messages: {data['total']}")
        print(f"   - Messages Retrieved: {len(data['messages'])}")
        print(f"   - Session ID: {data['session_id']}")
        
        if data['messages']:
            print(f"\n   Recent Messages:")
            for msg in data['messages'][-3:]:  # Show last 3 messages
                timestamp = datetime.fromisoformat(msg['timestamp'].replace('Z', '+00:00'))
                print(f"   [{timestamp.strftime('%H:%M:%S')}] {msg['role']}: {msg['content'][:50]}...")
    else:
        print(f"❌ Failed to retrieve chat history: {response.status_code}")

def test_voice_formats():
    """Test supported voice formats endpoint."""
    print("\n🎤 Testing voice format info...")
    response = requests.get(f"{BASE_URL}/api/voice/supported-formats")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Voice format info retrieved!")
        print(f"   - Supported Formats: {', '.join(data['supported_formats'])}")
        print(f"   - Max File Size: {data['max_file_size_mb']}MB")
        print(f"   - Recommended Format: {data['recommended_format']}")
    else:
        print(f"❌ Failed to get voice format info: {response.status_code}")

def main():
    """Run all tests."""
    print("=" * 60)
    print("🧪 Cal AI Backend API Test Suite")
    print("=" * 60)
    
    # Check if server is running
    try:
        if not test_health():
            print("\n❌ Server is not running! Please start the backend first:")
            print("   cd /Users/jasonyin/project/cal/cal-app/backend")
            print("   ./run.sh")
            return
    except requests.ConnectionError:
        print("\n❌ Cannot connect to server! Please start the backend first:")
        print("   cd /Users/jasonyin/project/cal/cal-app/backend")
        print("   ./run.sh")
        return
    
    # Run tests
    session_id = test_meal_analysis()
    test_chat_history(session_id)
    test_voice_formats()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("\n📚 View full API documentation at: http://localhost:8000/docs")
    print("=" * 60)

if __name__ == "__main__":
    main()