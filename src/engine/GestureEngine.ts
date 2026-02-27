import type { HandLandmark, DetectedSign } from '../types';
import { smoothLandmarks } from './LandmarkProcessor';
import { signDictionary } from './SignDictionary';

const CONFIDENCE_THRESHOLD = 0.35;
const COOLDOWN_MS = 1200;

let lastDetectedSign = '';
let lastDetectedTime = 0;

export interface GestureResult {
    sign: DetectedSign | null;
    handsDetected: boolean;
    bestCandidate: string;
    bestCandidateConfidence: number;
}

export function recognizeGesture(rawHands: HandLandmark[][]): GestureResult {
    if (rawHands.length === 0) {
        return { sign: null, handsDetected: false, bestCandidate: '', bestCandidateConfidence: 0 };
    }

    const hands = smoothLandmarks(rawHands);

    let bestMatch = '';
    let bestConfidence = 0;
    let bestLabel = '';

    for (const entry of signDictionary) {
        const confidence = entry.match(hands);
        if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestMatch = entry.id;
            bestLabel = entry.label;
        }
    }

    const result: GestureResult = {
        sign: null,
        handsDetected: true,
        bestCandidate: bestLabel,
        bestCandidateConfidence: bestConfidence,
    };

    if (bestConfidence < CONFIDENCE_THRESHOLD) return result;

    const now = Date.now();
    if (bestMatch === lastDetectedSign && now - lastDetectedTime < COOLDOWN_MS) {
        return result;
    }

    lastDetectedSign = bestMatch;
    lastDetectedTime = now;

    result.sign = {
        label: bestLabel,
        confidence: bestConfidence,
        timestamp: now,
    };

    return result;
}

export function resetEngine(): void {
    lastDetectedSign = '';
    lastDetectedTime = 0;
}
