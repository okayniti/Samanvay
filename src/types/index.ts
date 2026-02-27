export type AppMode = 'isl-to-english' | 'english-to-isl';

export type EmotionLabel = 'Happy' | 'Sad' | 'Neutral' | 'Angry' | 'Surprised';

export interface HandLandmark {
    x: number;
    y: number;
    z: number;
}

export interface DetectedSign {
    label: string;
    confidence: number;
    timestamp: number;
}

export interface EmotionResult {
    label: EmotionLabel;
    confidence: number;
}

export interface SignEntry {
    id: string;
    label: string;
    description: string;
    match: (landmarks: HandLandmark[][]) => number;
}

export interface TranslationResult {
    original: string;
    translated: string;
    signKeys: string[];
    language: string;
}

export interface WebcamState {
    status: 'idle' | 'requesting' | 'active' | 'error';
    error?: string;
}

export interface TeachMeState {
    enabled: boolean;
    showKeypoints: boolean;
    showConfidence: boolean;
    slowMotion: boolean;
}

export interface ConversationMessage {
    id: string;
    text: string;
    emotion?: EmotionLabel;
    source: 'sign' | 'text' | 'voice';
    timestamp: number;
}
