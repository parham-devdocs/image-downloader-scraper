"use client"

import { ParamValue } from 'next/dist/server/request/params';
import { useState, useRef, useEffect, useCallback } from 'react';

interface UseAudioStreamReturn {
  isRecording: boolean;
  hasPermission: boolean;
  error: string | null;
  audioChunks: Blob[];
  requestPermission: () => Promise<boolean>;
  startStreaming: () => Promise<void>;
  stopStreaming: () => Promise<Blob | null>;
  clearChunks: () => void;
}

const useAudioStream = (id:ParamValue): UseAudioStreamReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mimeType = useRef("audio/webm;codecs=opus"); // Default value
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionIdRef = useRef<string>("");
  const fileNameRef = useRef("");
  const startTimeRef = useRef<number | null>(null); // For duration calculation

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      setHasPermission(false);
      setError(err instanceof Error ? err.message : 'Permission denied');
      return false;
    }
  }, []);

  // Clear all chunks
  const clearChunks = useCallback(() => {
    audioChunksRef.current = [];
    setAudioChunks([]);
  }, []);

  // Start streaming
  const startStreaming = useCallback(async (): Promise<void> => {
    // Check permission first
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    // Reset chunks
    clearChunks();
    
    try {
      // Create new stream if needed
      if (!streamRef.current || !streamRef.current.active) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      // Generate IDs
      sessionIdRef.current = crypto.randomUUID();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fileNameRef.current = `recording_${timestamp}.webm`;
      
      // Check and set supported MIME type
      const supportedMimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      mimeType.current = supportedMimeType;
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: mimeType.current
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Update actual MIME type used
      mimeType.current = mediaRecorder.mimeType;
      
      // Record start time for duration
      startTimeRef.current = Date.now();

      // Collect data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          setAudioChunks(prev => [...prev, event.data]);
          console.log('Chunk received:', event.data.size, 'bytes');
          console.log('Total chunks so far:', audioChunksRef.current.length);
        }
      };
      
      // Start recording (chunk every second)
      mediaRecorder.start(1000); // Changed to 1000ms for better chunk management
      setIsRecording(true);
      
      console.log('Recording started with MIME type:', mimeType.current);
      
    } catch (err) {
      console.error('Error starting stream:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [hasPermission, requestPermission, clearChunks]);

  // Stop streaming
  const stopStreaming = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        
        mediaRecorderRef.current.onstop = () => {
          setIsRecording(false);
          
          // Calculate actual duration
          const durationSeconds = startTimeRef.current 
            ? (Date.now() - startTimeRef.current) / 1000 
            : 0;
          
          // Create final blob from all chunks
          const finalBlob = new Blob(audioChunksRef.current, { type: mimeType.current });
          
          console.log('Recording stopped. Final blob size:', finalBlob.size, 'bytes');
          console.log('Total chunks:', audioChunksRef.current.length);
          console.log('Duration:', durationSeconds, 'seconds');
          
          const formData = new FormData();
          
          formData.append('mimeType', mimeType.current);
          formData.append('duration', durationSeconds.toString());
          formData.append('size', finalBlob.size.toString());
          formData.append('fileName', fileNameRef.current);
          formData.append('originalName', fileNameRef.current);
          formData.append('sessionId', sessionIdRef.current);
          
          // Debug FormData
          console.log('=== FormData Contents ===');
          formData.forEach((value, key) => {
            if (value instanceof Blob) {
              console.log(`${key}: [Blob] - size: ${value.size}, type: ${value.type}, name: ${value.name || 'unnamed'}`);
            } else {
              console.log(`${key}: ${value}`);
            }
          });
          
          resolve(finalBlob);
        };
        
        mediaRecorderRef.current.stop();
      } else {
        setIsRecording(false);
        resolve(null);
      }
    });
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    isRecording,
    hasPermission,
    error,
    audioChunks,
    requestPermission,
    startStreaming,
    stopStreaming,
    clearChunks
  };
};

export default useAudioStream;