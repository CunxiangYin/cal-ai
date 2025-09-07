import { useState, useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import api from '@/lib/api';
import { Message } from '@/lib/types';

export const useChat = () => {
  const { 
    messages, 
    isLoading, 
    error, 
    addMessage, 
    setMessages, 
    setLoading, 
    setError 
  } = useChatStore();
  
  // Prevent duplicate sends
  const lastMessageRef = useRef<string>('');
  const sendingRef = useRef<boolean>(false);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getChatHistory();
      setMessages(response.messages);
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setMessages, setError]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Prevent duplicate sends
    const now = Date.now();
    const messageKey = `${content}-${Math.floor(now / 1000)}`; // Same message within 1 second
    if (lastMessageRef.current === messageKey || sendingRef.current) {
      console.log('Preventing duplicate message send');
      return;
    }
    
    lastMessageRef.current = messageKey;
    sendingRef.current = true;

    // Add user message immediately
    const userMessage: Message = {
      id: `user-${now}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    try {
      setLoading(true);
      setError(null);

      // Send to API and get response
      const response = await api.analyzeMeal({ message: content });

      // Add assistant message with nutrition data
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        nutritionData: response.nutritionData,
      };
      addMessage(assistantMessage);

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      // Add error message
      const errorAssistantMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `抱歉，发生了错误：${errorMessage}`,
        timestamp: new Date(),
      };
      addMessage(errorAssistantMessage);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, [addMessage, setLoading, setError]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, [setMessages, setError]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    loadChatHistory,
  };
};