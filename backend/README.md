# Cal AI Backend Service

A FastAPI-based backend service for intelligent calorie tracking and nutritional analysis. The service provides AI-powered meal analysis, chat history management, and voice-to-text conversion capabilities.

## Features

- 🍽️ **Intelligent Meal Analysis**: Analyze meal descriptions in English and Chinese
- 📊 **Detailed Nutrition Breakdown**: Get calories, protein, carbs, fat, and more
- 💬 **Chat History Management**: Track conversations and meal analyses
- 🎤 **Voice Input Support**: Convert audio descriptions to text (mock implementation)
- 🌐 **Multilingual Support**: Works with English and Chinese food descriptions
- 🤖 **AI Integration**: Supports Claude (Anthropic) and OpenAI GPT models

## Tech Stack

- **Framework**: FastAPI
- **Database**: SQLAlchemy + SQLite (PostgreSQL ready)
- **AI Services**: Anthropic Claude / OpenAI GPT
- **Validation**: Pydantic
- **Server**: Uvicorn

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/    # API route handlers
│   │       └── deps.py       # Dependencies
│   ├── core/
│   │   ├── config.py         # Configuration settings
│   │   └── database.py       # Database setup
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Business logic
│   └── utils/               # Utility functions
├── tests/                    # Test suite
├── uploads/                  # Temporary file storage
├── main.py                   # Application entry point
├── requirements.txt          # Python dependencies
└── .env.example             # Environment variables template
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8 or higher
- pip package manager
- Virtual environment (recommended)

### 2. Installation

```bash
# Navigate to backend directory
cd /Users/jasonyin/project/cal/cal-app/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

Create a `.env` file based on the template:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required for AI-powered meal analysis
ANTHROPIC_API_KEY=your_anthropic_api_key_here
# OR
OPENAI_API_KEY=your_openai_api_key_here

# Set AI provider (anthropic or openai)
AI_PROVIDER=anthropic
```

### 4. Run the Application

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### 5. Access Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Meal Analysis

**POST** `/api/analyze-meal`

Analyze a meal description and get nutritional information.

```json
{
  "message": "I had 2 scrambled eggs and whole wheat toast",
  "session_id": "optional-session-id",
  "language": "en"
}
```

Response:
```json
{
  "message_id": "uuid",
  "nutrition": {
    "total_calories": 350,
    "total_protein": 20,
    "total_carbs": 30,
    "total_fat": 15,
    "food_items": [...],
    "analysis_notes": "..."
  },
  "ai_response": "Your meal contains approximately 350 calories...",
  "session_id": "session-uuid"
}
```

### Chat History

**GET** `/api/chat-history`

Retrieve chat history with optional pagination.

Query Parameters:
- `session_id`: Filter by session (optional)
- `limit`: Number of messages (default: 50)
- `offset`: Pagination offset (default: 0)

### Voice Transcription

**POST** `/api/voice-to-text`

Convert audio file to text (currently returns mock data).

Form Data:
- `audio`: Audio file (mp3, wav, m4a, webm)

### Health Check

**GET** `/health` - Basic health check
**GET** `/health/db` - Database connectivity check

## Testing

Run tests using pytest:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_meal_analysis.py
```

## Development

### Database Migrations

The application automatically creates database tables on startup. For production, consider using Alembic for migrations:

```bash
# Initialize Alembic (optional)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### Adding New Features

1. Create models in `app/models/`
2. Define schemas in `app/schemas/`
3. Implement business logic in `app/services/`
4. Create API endpoints in `app/api/v1/endpoints/`
5. Add tests in `tests/`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./cal_ai.db` |
| `ANTHROPIC_API_KEY` | Claude API key | None |
| `OPENAI_API_KEY` | OpenAI API key | None |
| `AI_PROVIDER` | AI service provider | `anthropic` |
| `CORS_ORIGINS` | Allowed CORS origins | `["http://localhost:3000"]` |
| `SESSION_EXPIRY_DAYS` | Session expiration time | `30` |
| `MAX_REQUESTS_PER_MINUTE` | Rate limiting | `60` |

## Production Deployment

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t cal-ai-backend .
docker run -p 8000:8000 --env-file .env cal-ai-backend
```

### Using Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./cal_ai.db:/app/cal_ai.db
```

## Troubleshooting

### Issue: AI service not working
**Solution**: Ensure you have valid API keys in `.env` file

### Issue: Database errors
**Solution**: Delete `cal_ai.db` file and restart the application

### Issue: CORS errors from frontend
**Solution**: Update `CORS_ORIGINS` in `.env` to include your frontend URL

## License

Proprietary - Cal AI

## Support

For issues or questions, please contact the development team.