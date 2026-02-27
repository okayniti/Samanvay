import type { HandLandmark, DetectedSign } from '../types';
import { smoothLandmarks } from './LandmarkProcessor';
import { signDictionary } from './SignDictionary';
import { recognizeAlphabet } from './AlphabetDictionary';
import { recognizeNumber } from './NumberDictionary';
import { addLetter, addWord, checkAutoSpace } from './SentenceBuilder';

export type RecognitionMode = 'auto' | 'fingerspell' | 'word-signs';

const WORD_CONFIDENCE_THRESHOLD = 0.4;
const WORD_COOLDOWN_MS = 1200;

let lastDetectedWord = '';
let lastDetectedWordTime = 0;
let recognitionMode: RecognitionMode = 'auto';

export interface GestureResult {
    sign: DetectedSign | null;
    handsDetected: boolean;
    bestCandidate: string;
    bestCandidateConfidence: number;
    type: 'word' | 'letter' | 'number' | 'none';
}

export function setRecognitionMode(mode: RecognitionMode) {
    recognitionMode = mode;
}

export function getRecognitionMode(): RecognitionMode {
    return recognitionMode;
}

export function recognizeGesture(rawHands: HandLandmark[][]): GestureResult {
    if (rawHands.length === 0) {
        checkAutoSpace();
        return { sign: null, handsDetected: false, bestCandidate: '', bestCandidateConfidence: 0, type: 'none' };
    }

    const hands = smoothLandmarks(rawHands);
    const result: GestureResult = {
        sign: null,
        handsDetected: true,
        bestCandidate: '',
        bestCandidateConfidence: 0,
        type: 'none',
    };

    // --- Word-level recognition ---
    if (recognitionMode === 'auto' || recognitionMode === 'word-signs') {
        let bestWordMatch = '';
        let bestWordConf = 0;
        let bestWordLabel = '';

        for (const entry of signDictionary) {
            const confidence = entry.match(hands);
            if (confidence > bestWordConf) {
                bestWordConf = confidence;
                bestWordMatch = entry.id;
                bestWordLabel = entry.label;
            }
        }

        if (bestWordConf >= WORD_CONFIDENCE_THRESHOLD) {
            result.bestCandidate = bestWordLabel;
            result.bestCandidateConfidence = bestWordConf;
            result.type = 'word';

            const now = Date.now();
            const isDuplicate = bestWordMatch === lastDetectedWord && now - lastDetectedWordTime < WORD_COOLDOWN_MS;

            if (!isDuplicate && bestWordConf >= 0.5) {
                lastDetectedWord = bestWordMatch;
                lastDetectedWordTime = now;

                addWord(bestWordLabel);

                result.sign = {
                    label: bestWordLabel,
                    confidence: bestWordConf,
                    timestamp: now,
                };
                return result;
            }
        }
    }

    // --- Alphabet fingerspelling ---
    if (recognitionMode === 'auto' || recognitionMode === 'fingerspell') {
        const letterResult = recognizeAlphabet(hands[0]);
        if (letterResult && letterResult.confidence >= 0.45) {
            if (result.bestCandidateConfidence < letterResult.confidence || recognitionMode === 'fingerspell') {
                result.bestCandidate = `Letter: ${letterResult.letter}`;
                result.bestCandidateConfidence = letterResult.confidence;
                result.type = 'letter';

                if (letterResult.confidence >= 0.5) {
                    addLetter(letterResult.letter);

                    const now = Date.now();
                    result.sign = {
                        label: letterResult.letter,
                        confidence: letterResult.confidence,
                        timestamp: now,
                    };
                }
                return result;
            }
        }

        // --- Number recognition ---
        const numResult = recognizeNumber(hands[0]);
        if (numResult && numResult.confidence >= 0.45) {
            if (result.bestCandidateConfidence < numResult.confidence) {
                result.bestCandidate = `Number: ${numResult.digit}`;
                result.bestCandidateConfidence = numResult.confidence;
                result.type = 'number';

                if (numResult.confidence >= 0.5) {
                    addLetter(numResult.digit);

                    const now = Date.now();
                    result.sign = {
                        label: numResult.digit,
                        confidence: numResult.confidence,
                        timestamp: now,
                    };
                }
                return result;
            }
        }
    }

    return result;
}

export function resetEngine(): void {
    lastDetectedWord = '';
    lastDetectedWordTime = 0;
}
