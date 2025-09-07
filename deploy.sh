#!/bin/bash

# Cal AI - Vercel Deployment Script

echo "🚀 Cal AI Vercel Deployment"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm i -g vercel
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${RED}❗ Please edit .env and add your ANTHROPIC_API_KEY${NC}"
    echo "Then run this script again."
    exit 1
fi

# Check if ANTHROPIC_API_KEY is set
if ! grep -q "ANTHROPIC_API_KEY=sk-" .env; then
    echo -e "${RED}❗ ANTHROPIC_API_KEY not configured in .env${NC}"
    echo "Please add your Claude API key to .env file"
    exit 1
fi

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

# Deploy to Vercel
echo -e "${GREEN}🚀 Deploying to Vercel...${NC}"
vercel --prod

echo ""
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo "=========================="
echo ""
echo "Next steps:"
echo "1. Visit your Vercel dashboard to see the deployment"
echo "2. Add environment variables in Vercel settings:"
echo "   - ANTHROPIC_API_KEY"
echo "   - NEXT_PUBLIC_API_URL (your deployed URL)"
echo "3. Redeploy after adding environment variables"
echo ""
echo "For detailed instructions, see DEPLOY_VERCEL.md"