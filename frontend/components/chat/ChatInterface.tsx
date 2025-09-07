'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';
import { useChat } from '@/hooks/useChat';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddFoodDialog } from '@/components/food/AddFoodDialog';
import { useStore } from '@/lib/store';

export const ChatInterface: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useChat();
  const addFoodRecord = useStore((state) => state.addFoodRecord);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAddFood, setShowAddFood] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleAddFood = (food: { name: string; amount: number; unit: string; calories: number; mealType: string; date: string; protein?: number; carbs?: number; fat?: number }) => {
    // Add food to store
    addFoodRecord({
      id: Date.now().toString(),
      ...food,
      timestamp: new Date().toISOString(),
    });

    // Send a message about the added food
    const message = `我刚刚记录了${food.name} ${food.amount}${food.unit}，${food.calories}千卡`;
    sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages area */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 px-4 py-4 pb-32"
      >
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                欢迎使用 Cal AI
              </h2>
              <p className="text-sm text-gray-600 max-w-xs">
                告诉我你今天吃了什么，我会帮你分析卡路里和营养成分
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="max-w-md mx-auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI 正在分析...</span>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Floating Add Button */}
      <Button
        onClick={() => setShowAddFood(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-10"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Input bar */}
      <InputBar 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />

      {/* Add Food Dialog */}
      <AddFoodDialog
        open={showAddFood}
        onOpenChange={setShowAddFood}
        onAddFood={handleAddFood}
      />
    </div>
  );
};