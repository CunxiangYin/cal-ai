'use client';

import React, { useState, useCallback, KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceButton } from './VoiceButton';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "输入你吃了什么...",
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { suggestedPrompts } = useUIStore();

  const handleSend = useCallback(() => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
    }
  }, [inputValue, disabled, onSendMessage]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscription = useCallback((text: string) => {
    setInputValue(text);
    // Don't auto-send, let user confirm
    // User can press enter or click send button
  }, []);

  const handleSuggestionClick = (prompt: string) => {
    if (!disabled) {
      onSendMessage(prompt);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100">
      <div className="max-w-md mx-auto p-4">
        {/* Suggested prompts */}
        {showSuggestions && suggestedPrompts.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedPrompts.slice(0, 2).map((prompt) => (
              <Badge
                key={prompt.id}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSuggestionClick(prompt.text)}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {prompt.text}
              </Badge>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-2">
          <VoiceButton
            onTranscription={handleVoiceTranscription}
            className="flex-shrink-0"
          />
          
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value === '');
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            size="icon"
            className={cn(
              "flex-shrink-0",
              inputValue.trim() && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};