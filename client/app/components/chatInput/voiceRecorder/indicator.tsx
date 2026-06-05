import useAudioStream from "@/app/hooks/useStream";
import React, { useEffect, useRef, useState } from "react";

const MicNoiseIndicator = () => {
  const [levels, setLevels] = useState<number[]>(Array(24).fill(4));

  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    const start = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
console.log(streamRef.current)
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;

      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const update = () => {
        analyser.getByteFrequencyData(dataArray);

        const newLevels = Array.from({ length: 24 }, (_, index) => {
          const value = dataArray[index * 2] || 0;
          return Math.max(4, (value / 255) * 32);
        });

        setLevels(newLevels);
        animationRef.current = requestAnimationFrame(update);
      };

      update();
    };

    start();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="flex items-center gap-[3px] h-10">
      {levels.map((height, index) => (
        <div
          key={index}
          className="w-[3px] bg-violet-600 rounded-full transition-all duration-75"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};

export default MicNoiseIndicator;
