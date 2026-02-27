import { create } from 'zustand';
import type { AppMode, EmotionLabel, DetectedSign, ConversationMessage, WebcamState, TeachMeState } from '../types';

interface AppState {
    mode: AppMode;
    setMode: (mode: AppMode) => void;

    webcam: WebcamState;
    setWebcamStatus: (status: WebcamState['status'], error?: string) => void;

    currentEmotion: EmotionLabel;
    setCurrentEmotion: (emotion: EmotionLabel) => void;

    detectedSigns: DetectedSign[];
    addDetectedSign: (sign: DetectedSign) => void;
    clearDetectedSigns: () => void;

    messages: ConversationMessage[];
    addMessage: (message: ConversationMessage) => void;
    clearMessages: () => void;

    teachMe: TeachMeState;
    toggleTeachMe: () => void;
    setTeachMeSetting: (key: keyof Omit<TeachMeState, 'enabled'>, value: boolean) => void;

    isProcessing: boolean;
    setIsProcessing: (v: boolean) => void;

    currentSignAnimation: string | null;
    setCurrentSignAnimation: (sign: string | null) => void;

    fps: number;
    setFps: (fps: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
    mode: 'isl-to-english',
    setMode: (mode) => set({ mode }),

    webcam: { status: 'idle' },
    setWebcamStatus: (status, error) => set({ webcam: { status, error } }),

    currentEmotion: 'Neutral',
    setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),

    detectedSigns: [],
    addDetectedSign: (sign) =>
        set((state) => ({
            detectedSigns: [...state.detectedSigns.slice(-19), sign],
        })),
    clearDetectedSigns: () => set({ detectedSigns: [] }),

    messages: [],
    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),
    clearMessages: () => set({ messages: [] }),

    teachMe: {
        enabled: false,
        showKeypoints: true,
        showConfidence: true,
        slowMotion: false,
    },
    toggleTeachMe: () =>
        set((state) => ({
            teachMe: { ...state.teachMe, enabled: !state.teachMe.enabled },
        })),
    setTeachMeSetting: (key, value) =>
        set((state) => ({
            teachMe: { ...state.teachMe, [key]: value },
        })),

    isProcessing: false,
    setIsProcessing: (v) => set({ isProcessing: v }),

    currentSignAnimation: null,
    setCurrentSignAnimation: (sign) => set({ currentSignAnimation: sign }),

    fps: 0,
    setFps: (fps) => set({ fps }),
}));
