#!/bin/bash

# Cal AI - Complete Application Startup Script

echo "🚀 Starting Cal AI Application..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if ports are available
if check_port 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use. Please stop the existing service.${NC}"
    exit 1
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Please stop the existing service.${NC}"
    exit 1
fi

# Start Backend (Node.js)
echo -e "${GREEN}🔧 Starting Backend Server...${NC}"
cd backend-node

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${RED}❗ Please edit backend-node/.env and add your API keys (ANTHROPIC_API_KEY or OPENAI_API_KEY)${NC}"
fi

# Start backend in background
echo "Starting Node.js server on http://localhost:8000"
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend
echo -e "${GREEN}🎨 Starting Frontend Server...${NC}"
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting Next.js server on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Wait for services to be ready
sleep 5

echo -e "\n${GREEN}✨ Cal AI is running!${NC}"
echo "=================================="
echo -e "📱 Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "🔧 Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "📚 API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo "=================================="
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop all services"
echo ""

# Keep script running
wait