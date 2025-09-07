import { create } from 'zustand';
import { Message, SuggestedPrompt } from './types';

interface FoodRecord {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  mealType: string;
  date: string;
  timestamp: string;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [] }),
}));

interface VoiceStore {
  isRecording: boolean;
  audioBlob: Blob | null;
  transcribedText: string;
  setRecording: (recording: boolean) => void;
  setAudioBlob: (blob: Blob | null) => void;
  setTranscribedText: (text: string) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  isRecording: false,
  audioBlob: null,
  transcribedText: '',
  setRecording: (recording) => set({ isRecording: recording }),
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  setTranscribedText: (text) => set({ transcribedText: text }),
  reset: () => set({ 
    isRecording: false, 
    audioBlob: null, 
    transcribedText: '' 
  }),
}));

interface UIStore {
  activeTab: 'chat' | 'profile' | 'history';
  isMobileMenuOpen: boolean;
  suggestedPrompts: SuggestedPrompt[];
  setActiveTab: (tab: 'chat' | 'profile' | 'history') => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSuggestedPrompts: (prompts: SuggestedPrompt[]) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'chat',
  isMobileMenuOpen: false,
  suggestedPrompts: [
    { id: '1', text: '问我今天都吃了什么', icon: '🍽️' },
    { id: '2', text: '我这周吃的健康吗？', icon: '📊' },
    { id: '3', text: '分析我的营养摄入', icon: '🔍' },
    { id: '4', text: '给我一些饮食建议', icon: '💡' },
  ],
  setActiveTab: (tab) => set({ activeTab: tab }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setSuggestedPrompts: (prompts) => set({ suggestedPrompts: prompts }),
}));

interface AppStore {
  foodRecords: FoodRecord[];
  dailyCalorieGoal: number;
  addFoodRecord: (record: FoodRecord) => void;
  updateFoodRecord: (id: string, record: Partial<FoodRecord>) => void;
  deleteFoodRecord: (id: string) => void;
  getFoodRecordsByDate: (date: string) => FoodRecord[];
  getTotalCaloriesByDate: (date: string) => number;
  setDailyCalorieGoal: (goal: number) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  foodRecords: [],
  dailyCalorieGoal: 1800,
  
  addFoodRecord: (record) => set((state) => ({
    foodRecords: [...state.foodRecords, record]
  })),
  
  updateFoodRecord: (id, record) => set((state) => ({
    foodRecords: state.foodRecords.map(r => 
      r.id === id ? { ...r, ...record } : r
    )
  })),
  
  deleteFoodRecord: (id) => set((state) => ({
    foodRecords: state.foodRecords.filter(r => r.id !== id)
  })),
  
  getFoodRecordsByDate: (date) => {
    const state = get();
    return state.foodRecords.filter(r => r.date === date);
  },
  
  getTotalCaloriesByDate: (date) => {
    const records = get().getFoodRecordsByDate(date);
    return records.reduce((total, record) => total + record.calories, 0);
  },
  
  setDailyCalorieGoal: (goal) => set({ dailyCalorieGoal: goal }),
}));