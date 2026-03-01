import type { HandLandmark, DetectedSign } from '../types';
import { smoothLandmarks } from './LandmarkProcessor';
import { signDictionary } from './SignDictionary';
import { recognizeAlphabet } from './AlphabetDictionary';
import { recognizeNumber } from './NumberDictionary';
import { addLetter, addWord, checkAutoSpace } from './SentenceBuilder';
import { predict, isModelLoaded, loadModel } from './ModelLoader';

export type RecognitionMode = 'auto' | 'fingerspell' | 'word-signs';

const MODEL_CONFIDENCE_THRESHOLD = 0.6;
const HEURISTIC_WORD_THRESHOLD = 0.4;
const COOLDOWN_MS = 1200;
const LETTER_COOLDOWN_MS = 500;

let lastDetected = '';
let lastDetectedTime = 0;
let recognitionMode: RecognitionMode = 'auto';
let modelInitAttempted = false;

export interface GestureResult {
    sign: DetectedSign | null;
    handsDetected: boolean;
    bestCandidate: string;
    bestCandidateConfidence: number;
    type: 'model' | 'word' | 'letter' | 'number' | 'none';
    usingModel: boolean;
}

export function setRecognitionMode(mode: RecognitionMode) {
    recognitionMode = mode;
}

export function getRecognitionMode(): RecognitionMode {
    return recognitionMode;
}

/** Attempt to initialize the ML model (call once at app start) */
export async function initModel(): Promise<boolean> {
    if (modelInitAttempted) return isModelLoaded();
    modelInitAttempted = true;
    return await loadModel();
}

export function recognizeGesture(rawHands: HandLandmark[][]): GestureResult {
    if (rawHands.length === 0) {
        checkAutoSpace();
        return { sign: null, handsDetected: false, bestCandidate: '', bestCandidateConfidence: 0, type: 'none', usingModel: false };
    }

    const hands = smoothLandmarks(rawHands);
    const now = Date.now();
    const result: GestureResult = {
        sign: null,
        handsDetected: true,
        bestCandidate: '',
        bestCandidateConfidence: 0,
        type: 'none',
        usingModel: isModelLoaded(),
    };

    // ─── Priority 1: Trained ML Model ─────────────────────────────
    if (isModelLoaded()) {
        const modelResult = predict(hands[0]);
        if (modelResult && modelResult.confidence >= MODEL_CONFIDENCE_THRESHOLD) {
            result.bestCandidate = modelResult.label;
            result.bestCandidateConfidence = modelResult.confidence;
            result.type = 'model';

            const isDuplicate = modelResult.label === lastDetected && now - lastDetectedTime < COOLDOWN_MS;
            if (!isDuplicate) {
                lastDetected = modelResult.label;
                lastDetectedTime = now;

                // Single character = letter, else = word
                if (modelResult.label.length === 1) {
                    addLetter(modelResult.label);
                } else {
                    addWord(modelResult.label);
                }

                result.sign = {
                    label: modelResult.label,
                    confidence: modelResult.confidence,
                    timestamp: now,
                };
            }
            return result;
        }

        // Model returned low confidence — show it but don't commit
        if (modelResult) {
            result.bestCandidate = `${modelResult.label} (low)`;
            result.bestCandidateConfidence = modelResult.confidence;
            result.type = 'model';
        }
    }

    // ─── Priority 2: Heuristic Word Signs ─────────────────────────
    if (recognitionMode === 'auto' || recognitionMode === 'word-signs') {
        let bestWordConf = 0;
        let bestWordLabel = '';
        let bestWordId = '';

        for (const entry of signDictionary) {
            const conf = entry.match(hands);
            if (conf > bestWordConf) {
                bestWordConf = conf;
                bestWordLabel = entry.label;
                bestWordId = entry.id;
            }
        }

        if (bestWordConf >= HEURISTIC_WORD_THRESHOLD && bestWordConf > result.bestCandidateConfidence) {
            result.bestCandidate = bestWordLabel;
            result.bestCandidateConfidence = bestWordConf;
            result.type = 'word';

            if (bestWordConf >= 0.5) {
                const isDuplicate = bestWordId === lastDetected && now - lastDetectedTime < COOLDOWN_MS;
                if (!isDuplicate) {
                    lastDetected = bestWordId;
                    lastDetectedTime = now;
                    addWord(bestWordLabel);
                    result.sign = { label: bestWordLabel, confidence: bestWordConf, timestamp: now };
                }
            }
            return result;
        }
    }

    // ─── Priority 3: Alphabet Fingerspelling ──────────────────────
    if (recognitionMode === 'auto' || recognitionMode === 'fingerspell') {
        const letterResult = recognizeAlphabet(hands[0]);
        if (letterResult && letterResult.confidence >= 0.45) {
            result.bestCandidate = `Letter: ${letterResult.letter}`;
            result.bestCandidateConfidence = letterResult.confidence;
            result.type = 'letter';

            if (letterResult.confidence >= 0.5) {
                const isDuplicate = letterResult.letter === lastDetected && now - lastDetectedTime < LETTER_COOLDOWN_MS;
                if (!isDuplicate) {
                    lastDetected = letterResult.letter;
                    lastDetectedTime = now;
                    addLetter(letterResult.letter);
                    result.sign = { label: letterResult.letter, confidence: letterResult.confidence, timestamp: now };
                }
            }
            return result;
        }

        // Numbers
        const numResult = recognizeNumber(hands[0]);
        if (numResult && numResult.confidence >= 0.45 && numResult.confidence > result.bestCandidateConfidence) {
            result.bestCandidate = `Number: ${numResult.digit}`;
            result.bestCandidateConfidence = numResult.confidence;
            result.type = 'number';

            if (numResult.confidence >= 0.5) {
                const isDuplicate = numResult.digit === lastDetected && now - lastDetectedTime < LETTER_COOLDOWN_MS;
                if (!isDuplicate) {
                    lastDetected = numResult.digit;
                    lastDetectedTime = now;
                    addLetter(numResult.digit);
                    result.sign = { label: numResult.digit, confidence: numResult.confidence, timestamp: now };
                }
            }
            return result;
        }
    }

    return result;
}

export function resetEngine(): void {
    lastDetected = '';
    lastDetectedTime = 0;
}
