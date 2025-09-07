#!/bin/bash

# Cal AI Backend Startup Script

echo "🚀 Starting Cal AI Backend Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your API keys!"
    echo "   Required: ANTHROPIC_API_KEY or OPENAI_API_KEY"
fi

# Create necessary directories
mkdir -p uploads/audio
mkdir -p data

# Start the application
echo "✅ Starting FastAPI server..."
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/health"
echo ""

python main.py