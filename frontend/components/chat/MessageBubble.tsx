'use client';

import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/types';
import { NutritionTable } from '@/components/nutrition/NutritionTable';
import { Avatar } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={cn(
          "h-8 w-8 flex items-center justify-center",
          isUser ? "bg-blue-100" : "bg-gray-100"
        )}>
          {isUser ? (
            <User className="h-4 w-4 text-blue-600" />
          ) : (
            <Bot className="h-4 w-4 text-gray-600" />
          )}
        </Avatar>
      </div>

      {/* Message content */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Nutrition data (if available) */}
        {message.nutritionData && (
          <div className="mt-2 w-full">
            <NutritionTable data={message.nutritionData} />
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-400 px-1">
          {format(new Date(message.timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  );
};