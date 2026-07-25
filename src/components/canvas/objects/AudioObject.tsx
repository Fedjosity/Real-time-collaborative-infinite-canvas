'use client';

import React, { useState, useRef } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import type Konva from 'konva';
import type { CanvasObject, AudioData } from '@/types/canvas';

export interface AudioObjectProps {
  object: CanvasObject;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<any>) => void;
}

export const AudioObject: React.FC<AudioObjectProps> = ({
  object,
  isSelected,
  onSelect,
}) => {
  const data = object.data as AudioData;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const duration = data.duration || 0;
  const waveform = data.waveform || Array.from({ length: 16 }, () => 0.5);

  const togglePlayback = (e: Konva.KonvaEventObject<any>) => {
    e.cancelBubble = true;

    if (!audioRef.current && data.audioId) {
      audioRef.current = new Audio(`/api/audio?id=${data.audioId}`);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Group x={object.x} y={object.y} rotation={object.rotation} onClick={onSelect} onTap={onSelect}>
      {/* Audio Card Base */}
      <Rect
        width={object.width}
        height={object.height}
        fill="#0F172A"
        stroke={isSelected ? '#38BDF8' : '#334155'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={12}
        shadowColor="rgba(0, 0, 0, 0.4)"
        shadowBlur={8}
      />

      {/* Play/Pause Button Circle */}
      <Circle
        x={28}
        y={object.height / 2}
        radius={16}
        fill={isPlaying ? '#EC4899' : '#6366F1'}
        onClick={togglePlayback}
        onTap={togglePlayback}
      />

      {/* Play / Pause Icon Label */}
      <Text
        x={21}
        y={object.height / 2 - 7}
        text={isPlaying ? '❚❚' : '▶'}
        fontSize={12}
        fill="#FFFFFF"
        onClick={togglePlayback}
        onTap={togglePlayback}
      />

      {/* Waveform Amplitudes Visualization */}
      <Group x={56} y={object.height / 2 - 12}>
        {waveform.map((amp, idx) => {
          const barHeight = Math.max(4, amp * 24);
          return (
            <Rect
              key={idx}
              x={idx * 7}
              y={12 - barHeight / 2}
              width={4}
              height={barHeight}
              fill={isPlaying ? '#F472B6' : '#818CF8'}
              cornerRadius={2}
              opacity={isPlaying ? 0.9 : 0.6}
            />
          );
        })}
      </Group>

      {/* Duration Display */}
      <Text
        x={object.width - 45}
        y={object.height / 2 - 6}
        text={formatTime(duration)}
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        fill="#94A3B8"
      />
    </Group>
  );
};
