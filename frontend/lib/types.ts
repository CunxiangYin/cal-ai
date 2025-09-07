// Type definitions for Cal AI application

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  nutritionData?: NutritionInfo;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: FoodItem[];
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface AnalyzeMealRequest {
  message: string;
  userId?: string;
}

export interface AnalyzeMealResponse {
  message: string;
  nutritionData?: NutritionInfo;
  suggestions?: string[];
}

export interface ChatHistoryResponse {
  messages: Message[];
  totalCount: number;
}

export interface VoiceToTextRequest {
  audio: Blob;
  language?: string;
}

export interface VoiceToTextResponse {
  text: string;
  confidence?: number;
}

export interface SuggestedPrompt {
  id: string;
  text: string;
  icon?: string;
}