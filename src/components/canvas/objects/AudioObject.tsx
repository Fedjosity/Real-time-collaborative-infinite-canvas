'use client';

import React, { useState, useRef } from 'react';
import { Group, Rect, Circle, Text } from 'react-konva';
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
    <Group x={0} y={0} rotation={0} onClick={onSelect} onTap={onSelect}>
      {/* Audio Card Base */}
      <Rect
        x={0}
        y={0}
        width={object.width}
        height={object.height}
        fill="#0F172A"
        stroke={isSelected ? '#38BDF8' : '#334155'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={12}
        shadowColor="rgba(0, 0, 0, 0.4)"
        shadowBlur={8}
        shadowOffsetY={4}
      />

      {/* Play / Pause Toggle Button */}
      <Group x={24} y={object.height / 2} onClick={togglePlayback} onTap={togglePlayback}>
        <Circle radius={16} fill={isPlaying ? '#EF4444' : '#6366F1'} />
        <Text
          x={-6}
          y={-6}
          text={isPlaying ? '❚❚' : '▶'}
          fontSize={10}
          fill="#FFFFFF"
        />
      </Group>

      {/* Audio Waveform Bars Visualization */}
      <Group x={52} y={object.height / 2 - 12}>
        {waveform.slice(0, 16).map((val, idx) => (
          <Rect
            key={idx}
            x={idx * 8}
            y={12 - (val * 24) / 2}
            width={4}
            height={Math.max(4, val * 24)}
            fill={isPlaying ? '#818CF8' : '#475569'}
            cornerRadius={2}
          />
        ))}
      </Group>

      {/* Duration Label */}
      <Text
        x={object.width - 50}
        y={object.height / 2 - 6}
        text={formatTime(duration)}
        fontSize={11}
        fill="#94A3B8"
        fontFamily="sans-serif"
      />
    </Group>
  );
};
