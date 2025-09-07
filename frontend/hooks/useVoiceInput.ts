import { useState, useCallback, useRef, useEffect } from 'react';
import { useVoiceStore } from '@/lib/store';
import api from '@/lib/api';

export const useVoiceInput = () => {
  const {
    isRecording,
    audioBlob,
    transcribedText,
    setRecording,
    setAudioBlob,
    setTranscribedText,
    reset
  } = useVoiceStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setError('需要麦克风权限才能使用语音输入');
      return false;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Check permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('无法开始录音，请检查麦克风权限');
      setRecording(false);
    }
  }, [requestPermission, setRecording, setAudioBlob]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current = null;
    }
  }, [isRecording, setRecording]);

  // Process audio and convert to text
  const processAudio = useCallback(async () => {
    if (!audioBlob) {
      setError('没有录音数据');
      return null;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await api.voiceToText(audioBlob);
      setTranscribedText(response.text);
      
      return response.text;
    } catch (err) {
      console.error('Failed to process audio:', err);
      setError('语音识别失败，请重试');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, setTranscribedText]);

  // Toggle recording (start/stop)
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    transcribedText,
    error,
    startRecording,
    stopRecording,
    toggleRecording,
    processAudio,
    reset,
  };
};