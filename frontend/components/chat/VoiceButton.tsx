'use client';

import React, { useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface VoiceButtonProps {
  onTranscription?: (text: string) => void;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onTranscription,
  className,
}) => {
  const {
    isRecording,
    isProcessing,
    transcribedText,
    toggleRecording,
    processAudio,
  } = useVoiceInput();

  // Handle transcription completion
  useEffect(() => {
    if (transcribedText && onTranscription) {
      onTranscription(transcribedText);
    }
  }, [transcribedText, onTranscription]);

  // Process audio after recording stops
  useEffect(() => {
    if (!isRecording && transcribedText === '') {
      // Small delay to ensure audio blob is ready
      const timer = setTimeout(() => {
        processAudio();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRecording, transcribedText, processAudio]);

  const handleClick = async () => {
    await toggleRecording();
  };

  return (
    <Button
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      onClick={handleClick}
      disabled={isProcessing}
      className={cn(
        "relative transition-all",
        isRecording && "animate-pulse",
        className
      )}
      title={isRecording ? "停止录音" : "开始录音"}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <>
          <MicOff className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};