"use client"

import { ParamValue } from 'next/dist/server/request/params';
import { useState, useRef, useEffect, useCallback } from 'react';
import { sendFileToGroup } from '../actions/messages';

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

const useAudioStream = (id: ParamValue): UseAudioStreamReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionIdRef = useRef<string>("");
  const fileNameRef = useRef("");
  const startTimeRef = useRef<number | null>(null);
  const mimeTypeRef = useRef<string>("");

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

  const clearChunks = useCallback(() => {
    audioChunksRef.current = [];
    setAudioChunks([]);
  }, []);

  // Start streaming - FIXED VERSION
  const startStreaming = useCallback(async (): Promise<void> => {
    // Check permission
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    // Clean up existing recorder and stream
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear previous chunks
    clearChunks();
    
    try {
      // Get fresh stream with explicit audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Wait a moment for stream to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify stream is active and has tracks
      if (!stream.active || stream.getAudioTracks().length === 0) {
        throw new Error('Stream not active or no audio tracks');
      }
      
      console.log('✅ Stream ready, tracks:', stream.getAudioTracks().length);
      
      // Let browser choose the best format - DON'T specify MIME type
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Store the actual MIME type being used
      mimeTypeRef.current = mediaRecorder.mimeType;
      console.log('✅ MediaRecorder using MIME type:', mimeTypeRef.current);
      
      // Verify we can record with this MIME type
      const testAudio = new Audio();
      const canPlay = testAudio.canPlayType(mimeTypeRef.current);
      console.log('Can play recorded format:', canPlay);
      
      // Generate IDs and filename
      sessionIdRef.current = crypto.randomUUID();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Set correct extension based on MIME type
      let extension = '.webm';
      if (mimeTypeRef.current.includes('mp4')) extension = '.m4a';
      else if (mimeTypeRef.current.includes('mpeg')) extension = '.mp3';
      fileNameRef.current = `recording_${timestamp}${extension}`;
      
      startTimeRef.current = Date.now();
      
      // Clear chunks before starting
      audioChunksRef.current = [];
      
      // Data handler
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`📊 Chunk received: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      // Error handler
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
      };
      
      // Start recording - request data every second
      mediaRecorder.start(1000);
      setIsRecording(true);
      
      console.log('🎤 Recording started successfully');
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsRecording(false);
    }
  }, [hasPermission, requestPermission, clearChunks]);

  // Stop streaming - FIXED VERSION
  const stopStreaming = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        
        const onStopHandler = async () => {
          try {
            setIsRecording(false);
            
            console.log('=== RECORDING STOPPED ===');
            console.log('Chunks collected:', audioChunksRef.current.length);
            
            // Validate we have chunks
            if (audioChunksRef.current.length === 0) {
              console.error('❌ No chunks recorded');
              resolve(null);
              return;
            }
            
            // Calculate total size
            const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
            console.log('Total data size:', totalSize);
            
            if (totalSize === 0) {
              console.error('❌ Total size is 0');
              resolve(null);
              return;
            }
            
            // Create final blob
            const finalBlob = new Blob(audioChunksRef.current, { 
              type: mimeTypeRef.current || 'audio/webm' 
            });
            
            console.log('Final blob size:', finalBlob.size);
            
            // Validate blob with magic bytes
            const firstBytes = await finalBlob.slice(0, 4).arrayBuffer();
            const magicBytes = new Uint8Array(firstBytes);
            const hexSignature = Array.from(magicBytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
            
            console.log('File signature:', hexSignature);
            
            // Check if it's valid WebM
            if (hexSignature === '1a 45 df a3') {
              console.log('✅ Valid WebM file');
            } else if (hexSignature === '00 00 00 18') {
              console.log('✅ Valid MP4 file');
            } else {
              console.error('❌ Still corrupted! Trying alternative method...');
              
              // Alternative: Try to create blob from all chunks concatenated
              const allData = new Blob(audioChunksRef.current);
              console.log('Alternative blob size:', allData.size);
              
              // If still no good, resolve null
              if (allData.size < 1000) {
                console.error('❌ Audio data too small - likely invalid');
                resolve(null);
                return;
              }
              
              // Force use alternative blob
              const altBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              
              const durationSeconds = startTimeRef.current 
                ? (Date.now() - startTimeRef.current) / 1000 
                : 0;
              
              // Prepare form data
              const formData = new FormData();
              formData.append('chunk', altBlob, fileNameRef.current);
              formData.append('mimeType', mimeTypeRef.current);
              formData.append('duration', durationSeconds.toString());
              formData.append('size', altBlob.size.toString());
              formData.append('fileName', fileNameRef.current);
              formData.append('originalName', fileNameRef.current);
              formData.append('sessionId', sessionIdRef.current);
              
              // Send to server
              const result = await sendFileToGroup({ 
                groupId: id, 
                formData: formData
              });
              console.log('Upload result:', result);
              
              resolve(altBlob);
              return;
            }
            
            const durationSeconds = startTimeRef.current 
              ? (Date.now() - startTimeRef.current) / 1000 
              : 0;
            
            // Prepare form data
            const formData = new FormData();
            formData.append('voice', finalBlob, fileNameRef.current);
            formData.append('mimeType', mimeTypeRef.current);
            formData.append('duration', durationSeconds.toString());
            formData.append('size', finalBlob.size.toString());
            formData.append('fileName', fileNameRef.current);
            formData.append('originalName', fileNameRef.current);
            formData.append('sessionId', sessionIdRef.current);
            
            console.log('=== SENDING TO SERVER ===');
            formData.forEach((value, key) => {
              if (value instanceof Blob) {
                console.log(`${key}: Blob (${value.size} bytes)`);
              } else {
                console.log(`${key}: ${value}`);
              }
            });
            
            // Send to server
            const result = await sendFileToGroup({ 
              groupId: id, 
              formData: formData
            });
            console.log('Upload result:', result);
            
            resolve(finalBlob);
            
          } catch (err) {
            console.error('Error in stop handler:', err);
            resolve(null);
          }
        };
        
        // Set the onstop handler
        mediaRecorderRef.current.onstop = onStopHandler;
        
        // Stop the recorder
        mediaRecorderRef.current.stop();
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
      } else {
        console.warn('No active recording to stop');
        setIsRecording(false);
        resolve(null);
      }
    });
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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