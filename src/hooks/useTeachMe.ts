import { useRef, useCallback } from 'react';
import type { HandLandmark } from '../types';

interface FrameSnapshot {
    landmarks: HandLandmark[][];
    timestamp: number;
}

const MAX_BUFFER = 300;

export function useTeachMe() {
    const bufferRef = useRef<FrameSnapshot[]>([]);
    const playbackIndexRef = useRef(0);

    const recordFrame = useCallback((landmarks: HandLandmark[][]) => {
        bufferRef.current.push({
            landmarks,
            timestamp: Date.now(),
        });
        if (bufferRef.current.length > MAX_BUFFER) {
            bufferRef.current.shift();
        }
    }, []);

    const getReplayFrames = useCallback((count = 60): FrameSnapshot[] => {
        const buffer = bufferRef.current;
        return buffer.slice(Math.max(0, buffer.length - count));
    }, []);

    const getNextReplayFrame = useCallback((): FrameSnapshot | null => {
        const frames = bufferRef.current;
        if (frames.length === 0) return null;
        const frame = frames[playbackIndexRef.current % frames.length];
        playbackIndexRef.current++;
        return frame ?? null;
    }, []);

    const resetReplay = useCallback(() => {
        playbackIndexRef.current = 0;
    }, []);

    const clearBuffer = useCallback(() => {
        bufferRef.current = [];
        playbackIndexRef.current = 0;
    }, []);

    return {
        recordFrame,
        getReplayFrames,
        getNextReplayFrame,
        resetReplay,
        clearBuffer,
    };
}
