# Cal AI Backend Service Design

## Architecture Overview

Cal AI is a calorie tracking application that provides intelligent meal analysis through AI-powered nutritional calculations. The backend service follows a clean architecture pattern with clear separation of concerns.

```
┌─────────────────────────────────────────────────┐
│                   Client (React)                 │
│              http://localhost:3000               │
└────────────────┬────────────────────────────────┘
                 │ HTTP/REST
                 ▼
┌─────────────────────────────────────────────────┐
│              FastAPI Backend                     │
│           http://localhost:8000                  │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Routers    │  │   Services   │            │
│  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                     │
│  ┌──────▼───────┐  ┌──────▼───────┐            │
│  │   Schemas    │  │ Repositories │            │
│  └──────────────┘  └──────┬───────┘            │
│                           │                      │
│  ┌────────────────────────▼────────┐            │
│  │     SQLAlchemy Models           │            │
│  └────────────────────┬────────────┘            │
└───────────────────────┼─────────────────────────┘
                        │
                 ┌──────▼───────┐
                 │   SQLite DB   │
                 └───────────────┘
```

## Service Components

### 1. API Layer (Routers)
- **meal_router**: Handles meal analysis endpoints
- **chat_router**: Manages chat history operations
- **voice_router**: Processes voice-to-text conversions

### 2. Business Logic Layer (Services)
- **MealAnalysisService**: Core logic for analyzing meals and calculating nutrition
- **ChatService**: Manages conversation history and context
- **VoiceService**: Handles audio processing and transcription
- **AIIntegrationService**: Interfaces with Claude/OpenAI for intelligent analysis

### 3. Data Access Layer (Repositories)
- **MessageRepository**: CRUD operations for messages
- **NutritionRepository**: Stores and retrieves nutrition data
- **UserSessionRepository**: Manages user sessions

### 4. External Integrations
- **Claude/OpenAI API**: For intelligent meal analysis
- **Voice Processing**: Mock implementation initially, can integrate with Whisper API

## Database Schema

### Tables

#### messages
- id: UUID (Primary Key)
- session_id: UUID (Foreign Key)
- content: Text
- role: Enum (user/assistant)
- timestamp: DateTime
- nutrition_data_id: UUID (Foreign Key, nullable)

#### nutrition_info
- id: UUID (Primary Key)
- total_calories: Float
- total_protein: Float
- total_carbs: Float
- total_fat: Float
- analysis_notes: Text
- created_at: DateTime

#### food_items
- id: UUID (Primary Key)
- nutrition_info_id: UUID (Foreign Key)
- name: String
- amount: String
- calories: Float
- protein: Float
- carbs: Float
- fat: Float

#### user_sessions
- id: UUID (Primary Key)
- session_token: String (Unique)
- created_at: DateTime
- last_activity: DateTime

## API Endpoints Specification

### 1. POST /api/analyze-meal
**Purpose**: Analyze meal description and calculate nutrition information

**Request**:
```json
{
  "message": "I had 2 eggs, toast with butter, and a glass of orange juice",
  "session_id": "optional-session-id"
}
```

**Response**:
```json
{
  "message_id": "uuid",
  "nutrition": {
    "total_calories": 450,
    "total_protein": 15.5,
    "total_carbs": 45.2,
    "total_fat": 18.3,
    "food_items": [
      {
        "name": "Eggs",
        "amount": "2 large",
        "calories": 140,
        "protein": 12,
        "carbs": 1,
        "fat": 10
      }
    ],
    "analysis_notes": "This meal provides a good balance of protein and carbohydrates..."
  },
  "ai_response": "I've analyzed your meal. You consumed approximately 450 calories..."
}
```

### 2. GET /api/chat-history
**Purpose**: Retrieve conversation history for a session

**Query Parameters**:
- session_id: UUID (optional)
- limit: int (default: 50)
- offset: int (default: 0)

**Response**:
```json
{
  "messages": [
    {
      "id": "uuid",
      "content": "message content",
      "role": "user|assistant",
      "timestamp": "2024-01-01T12:00:00",
      "nutrition_data": {}
    }
  ],
  "total": 100,
  "session_id": "uuid"
}
```

### 3. POST /api/voice-to-text
**Purpose**: Convert audio input to text

**Request**: Multipart form data with audio file

**Response**:
```json
{
  "text": "Transcribed text from audio",
  "confidence": 0.95,
  "language": "en"
}
```

## Key Implementation Details

### Multilingual Support
- Support for Chinese (Simplified & Traditional) and English
- Food database includes common dishes from both cuisines
- AI prompts crafted to handle mixed language input

### Nutrition Calculation Strategy
1. Parse meal description using AI to identify food items
2. Extract quantities and portion sizes
3. Match against nutrition database or use AI estimation
4. Calculate total nutritional values
5. Provide contextual advice based on daily recommendations

### Session Management
- Session-based tracking without requiring user authentication
- Sessions expire after 30 days of inactivity
- Option to export/import session data

### Error Handling
- Graceful degradation when AI service is unavailable
- Fallback to basic keyword-based analysis
- Comprehensive error logging and monitoring

### Performance Optimization
- Async operations for all I/O bound tasks
- Database connection pooling
- Response caching for frequently analyzed meals
- Rate limiting to prevent abuse

### Security Considerations
- Input validation using Pydantic
- SQL injection prevention via SQLAlchemy ORM
- CORS configuration for frontend origin
- API rate limiting
- Secure session token generation

## Deployment Configuration

### Environment Variables
```env
DATABASE_URL=sqlite:///./cal_ai.db
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
CORS_ORIGINS=http://localhost:3000
MAX_REQUESTS_PER_MINUTE=60
SESSION_EXPIRY_DAYS=30
```

### Docker Support
- Dockerfile for containerized deployment
- Docker Compose for local development
- Health check endpoints
- Graceful shutdown handling

## Testing Strategy

### Unit Tests
- Service layer business logic
- Nutrition calculation accuracy
- Input parsing and validation

### Integration Tests
- API endpoint functionality
- Database operations
- External API mocking

### E2E Tests
- Complete meal analysis flow
- Session management
- Error handling scenarios

## Future Enhancements
1. User authentication and profiles
2. Meal planning and recommendations
3. Integration with fitness trackers
4. Barcode scanning for packaged foods
5. Photo-based meal recognition
6. Daily/weekly nutrition reports
7. Social features and meal sharing