# Cal AI - Calorie Tracking Application Design Document

## Overview
Cal AI is a mobile-first calorie tracking application with an AI-powered chat interface for food logging and nutritional analysis.

## Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Context/Zustand
- **HTTP Client**: Axios/Fetch API

## Application Architecture

### 1. Project Structure
```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main chat interface
│   ├── profile/
│   │   └── page.tsx        # Profile/My page
│   └── api/               # API route handlers (if needed)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── InputBar.tsx
│   │   └── VoiceButton.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── BottomNavigation.tsx
│   └── nutrition/
│       └── NutritionTable.tsx
├── lib/
│   ├── api.ts             # API client
│   ├── utils.ts           # Utility functions
│   └── types.ts           # TypeScript types
├── hooks/
│   ├── useChat.ts
│   └── useVoiceInput.ts
└── styles/
    └── globals.css

```

### 2. Core Components

#### ChatInterface Component
- Main container for chat functionality
- Manages chat history state
- Handles message sending and receiving
- Integrates voice input functionality

#### MessageBubble Component
- Displays individual messages (user/AI)
- Supports formatted text and tables
- Different styling for user vs AI messages

#### InputBar Component
- Text input field with send button
- Voice input toggle button
- Suggested prompts display

#### VoiceButton Component
- Push-to-talk functionality
- Visual feedback during recording
- Integration with voice-to-text API

#### BottomNavigation Component
- Tab navigation between Q&A and Profile
- Active state highlighting
- Fixed position at bottom

#### NutritionTable Component
- Formatted display of nutritional data
- Calories, proteins, carbs, fats breakdown
- Clean table design with shadcn/ui

### 3. API Integration

#### Endpoints
```typescript
interface APIEndpoints {
  analyzeMeal: 'POST /api/analyze-meal'
  chatHistory: 'GET /api/chat-history'
  voiceToText: 'POST /api/voice-to-text'
}
```

#### Data Types
```typescript
interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  nutritionData?: NutritionInfo
}

interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  items: FoodItem[]
}

interface FoodItem {
  name: string
  quantity: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
}
```

### 4. User Interface Design

#### Color Palette
- Primary: Blue (#3B82F6)
- Background: White (#FFFFFF)
- Text Primary: Gray-900 (#111827)
- Text Secondary: Gray-600 (#4B5563)
- Border: Gray-200 (#E5E7EB)

#### Typography
- Headers: Inter font family
- Body: System font stack
- Chat bubbles: 14px base size

#### Layout
- Mobile-first responsive design
- Max width container for larger screens
- Fixed header and bottom navigation
- Scrollable chat area

### 5. Features

#### Core Features
1. **Chat-based Food Logging**
   - Natural language input
   - AI-powered calorie analysis
   - Nutritional breakdown display

2. **Voice Input**
   - Push-to-talk functionality
   - Real-time transcription
   - Seamless integration with chat

3. **Chat History**
   - Persistent conversation history
   - Scrollable message list
   - Date/time stamps

4. **Suggested Prompts**
   - Quick action buttons
   - Common questions
   - Context-aware suggestions

#### Navigation
1. **Q&A Tab** (默认)
   - Main chat interface
   - Food logging and analysis

2. **My Tab**
   - User profile
   - Settings
   - Statistics/summaries

### 6. State Management

#### Global State
- User session
- Chat history
- Active tab
- Voice recording status

#### Local State
- Input field value
- Loading states
- Error messages
- Voice recording state

### 7. Responsive Design Breakpoints
- Mobile: < 640px (default)
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 8. Performance Optimizations
- Lazy loading for chat history
- Debounced input handling
- Optimistic UI updates
- Image optimization for food images

### 9. Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### 10. Error Handling
- Network error recovery
- Validation messages
- Fallback UI states
- User-friendly error messages

## Implementation Status

### Completed Features
✅ Project setup with Next.js 14 and TypeScript
✅ shadcn/ui integration and component setup
✅ Complete type system with TypeScript interfaces
✅ API client with mock data fallback
✅ State management with Zustand
✅ Chat interface with message bubbles
✅ Voice input support with push-to-talk
✅ Nutrition data visualization
✅ Bottom navigation with tabs
✅ Profile page with statistics
✅ Responsive mobile-first design
✅ Custom hooks for chat and voice functionality

### File Structure Created
```
frontend/
├── app/
│   ├── layout.tsx          ✅ Root layout with header and navigation
│   ├── page.tsx            ✅ Main chat interface page
│   ├── profile/
│   │   └── page.tsx        ✅ User profile page
│   └── globals.css         ✅ Global styles with animations
├── components/
│   ├── ui/                 ✅ All shadcn/ui components installed
│   ├── chat/
│   │   ├── ChatInterface.tsx  ✅ Main chat container
│   │   ├── MessageBubble.tsx  ✅ Message display component
│   │   ├── InputBar.tsx       ✅ Input with suggestions
│   │   └── VoiceButton.tsx    ✅ Voice recording button
│   ├── layout/
│   │   ├── Header.tsx          ✅ App header
│   │   └── BottomNavigation.tsx ✅ Tab navigation
│   └── nutrition/
│       └── NutritionTable.tsx  ✅ Nutrition data display
├── lib/
│   ├── api.ts              ✅ API client with mock support
│   ├── store.ts            ✅ Zustand state management
│   ├── types.ts            ✅ TypeScript type definitions
│   └── utils.ts            ✅ Utility functions (from shadcn)
├── hooks/
│   ├── useChat.ts          ✅ Chat functionality hook
│   └── useVoiceInput.ts    ✅ Voice input hook
└── .env.local              ✅ Environment configuration

```

### Running Application
- Development server: http://localhost:3005
- Mock data enabled by default
- Ready for backend integration

### Next Steps for Production
1. Connect to real backend API
2. Implement user authentication
3. Add data persistence
4. Deploy to production environment
5. Add PWA capabilities for mobile app experience