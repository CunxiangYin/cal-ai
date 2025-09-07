import axios from 'axios';
import {
  AnalyzeMealRequest,
  AnalyzeMealResponse,
  ChatHistoryResponse,
  VoiceToTextResponse,
  Message
} from './types';

// Use relative URLs for Vercel deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' ? '' : 'http://localhost:8000');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
  }
);

export const api = {
  // Analyze meal and get nutritional information
  analyzeMeal: async (data: AnalyzeMealRequest): Promise<AnalyzeMealResponse> => {
    const response = await apiClient.post('/api/analyze-meal', data);
    
    // Transform backend response to match frontend format
    const backendData = response.data;
    
    // Convert backend nutrition format to frontend NutritionInfo format
    const nutritionData = backendData.nutrition ? {
      calories: backendData.nutrition.total_calories || 0,
      protein: backendData.nutrition.total_protein || 0,
      carbs: backendData.nutrition.total_carbs || 0,
      fat: backendData.nutrition.total_fat || 0,
      items: (backendData.nutrition.food_items || []).map((item: { name_cn?: string; name: string; amount: number; unit: string; calories: number; protein: number; carbs: number; fat: number }) => ({
        name: item.name_cn || item.name,
        quantity: `${item.amount}${item.unit}`,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat
      }))
    } : undefined;
    
    return {
      message: backendData.ai_response || '已为您分析营养信息',
      nutritionData,
      suggestions: backendData.analysis_notes ? [backendData.analysis_notes] : []
    };
  },

  // Get chat history
  getChatHistory: async (userId?: string, limit?: number): Promise<ChatHistoryResponse> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (limit) params.append('limit', limit.toString());
    
    const response = await apiClient.get<ChatHistoryResponse>(`/api/chat-history?${params.toString()}`);
    return response.data;
  },

  // Convert voice to text
  voiceToText: async (audioBlob: Blob, language = 'zh-CN'): Promise<VoiceToTextResponse> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('language', language);

    const response = await apiClient.post<VoiceToTextResponse>('/api/voice-to-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Mock API functions for development (remove in production)
export const mockApi = {
  analyzeMeal: async (data: AnalyzeMealRequest): Promise<AnalyzeMealResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      message: `根据您的描述"${data.message}"，我为您分析了营养信息：`,
      nutritionData: {
        calories: 450,
        protein: 25,
        carbs: 55,
        fat: 15,
        items: [
          {
            name: "米饭",
            quantity: "1碗",
            calories: 200,
            protein: 4,
            carbs: 45,
            fat: 1
          },
          {
            name: "鸡胸肉",
            quantity: "100g",
            calories: 165,
            protein: 20,
            carbs: 0,
            fat: 3
          },
          {
            name: "蔬菜",
            quantity: "150g",
            calories: 85,
            protein: 1,
            carbs: 10,
            fat: 11
          }
        ]
      },
      suggestions: [
        "建议增加蔬菜摄入量",
        "蛋白质摄入适中",
        "可以考虑添加一些水果"
      ]
    };
  },

  getChatHistory: async (): Promise<ChatHistoryResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockMessages: Message[] = [
      {
        id: '1',
        type: 'user',
        content: '我今天早餐吃了燕麦粥和鸡蛋',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        type: 'assistant',
        content: '您的早餐营养搭配很好！燕麦粥提供了优质碳水化合物，鸡蛋提供了优质蛋白质。',
        timestamp: new Date(Date.now() - 3590000),
        nutritionData: {
          calories: 350,
          protein: 20,
          carbs: 40,
          fat: 12,
          items: [
            {
              name: "燕麦粥",
              quantity: "1碗",
              calories: 200,
              protein: 8,
              carbs: 35,
              fat: 4
            },
            {
              name: "鸡蛋",
              quantity: "2个",
              calories: 150,
              protein: 12,
              carbs: 5,
              fat: 8
            }
          ]
        }
      }
    ];
    
    return {
      messages: mockMessages,
      totalCount: mockMessages.length
    };
  },

  voiceToText: async (): Promise<VoiceToTextResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      text: "我今天午餐吃了一碗牛肉面",
      confidence: 0.95
    };
  }
};

// Always use real backend API
export default api;