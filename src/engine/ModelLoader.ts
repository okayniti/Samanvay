import type { HandLandmark } from '../types';

const MODEL_PATH = '/models/sign_classifier/model.json';
const LABELS_PATH = '/models/sign_classifier/labels.json';

let model: any = null;
let tf: any = null;
let labels: string[] = [];
let isLoading = false;
let loadFailed = false;

/**
 * Normalize landmarks identically to the Python training script.
 * Wrist-centered + scale-invariant.
 */
export function normalizeLandmarks(landmarks: HandLandmark[]): Float32Array {
    const coords = new Float32Array(landmarks.length * 3);

    // Copy raw coordinates
    for (let i = 0; i < landmarks.length; i++) {
        coords[i * 3] = landmarks[i].x;
        coords[i * 3 + 1] = landmarks[i].y;
        coords[i * 3 + 2] = landmarks[i].z;
    }

    // Center on wrist (landmark 0)
    const wx = coords[0], wy = coords[1], wz = coords[2];
    for (let i = 0; i < landmarks.length; i++) {
        coords[i * 3] -= wx;
        coords[i * 3 + 1] -= wy;
        coords[i * 3 + 2] -= wz;
    }

    // Scale invariant: normalize by max distance from wrist
    let maxDist = 0;
    for (let i = 1; i < landmarks.length; i++) {
        const dx = coords[i * 3];
        const dy = coords[i * 3 + 1];
        const dz = coords[i * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > maxDist) maxDist = dist;
    }

    if (maxDist > 0) {
        for (let i = 0; i < coords.length; i++) {
            coords[i] /= maxDist;
        }
    }

    return coords;
}

/**
 * Attempt to load the TensorFlow.js model and labels.
 * Silently falls back if model files don't exist (pre-training).
 */
export async function loadModel(): Promise<boolean> {
    if (model) return true;
    if (loadFailed || isLoading) return false;

    isLoading = true;

    try {
        // Dynamic import TensorFlow.js (tree-shakes when not used)
        tf = await import('@tensorflow/tfjs');

        // Load labels
        const labelsResponse = await fetch(LABELS_PATH);
        if (!labelsResponse.ok) {
            console.log('[ModelLoader] No trained model found. Using heuristic fallback.');
            loadFailed = true;
            isLoading = false;
            return false;
        }
        labels = await labelsResponse.json();

        // Load model
        model = await tf.loadLayersModel(MODEL_PATH);
        console.log(`[ModelLoader] ✅ Model loaded: ${labels.length} classes`);
        console.log(`[ModelLoader] Classes: ${labels.join(', ')}`);
        isLoading = false;
        return true;
    } catch (err) {
        console.log('[ModelLoader] Model not available, using heuristic fallback.', err);
        loadFailed = true;
        isLoading = false;
        return false;
    }
}

/**
 * Run prediction on hand landmarks.
 * Returns the predicted label and confidence, or null if model not loaded.
 */
export function predict(landmarks: HandLandmark[]): { label: string; confidence: number } | null {
    if (!model || !tf || landmarks.length < 21) return null;

    try {
        const normalized = normalizeLandmarks(landmarks);

        // Create tensor: [1, 63]
        const inputTensor = tf.tensor2d([Array.from(normalized)]);
        const prediction = model.predict(inputTensor) as any;
        const probabilities: Float32Array = prediction.dataSync();

        // Clean up tensors
        inputTensor.dispose();
        prediction.dispose();

        // Find best prediction
        let maxIdx = 0;
        let maxProb = 0;
        for (let i = 0; i < probabilities.length; i++) {
            if (probabilities[i] > maxProb) {
                maxProb = probabilities[i];
                maxIdx = i;
            }
        }

        if (maxIdx < labels.length) {
            return { label: labels[maxIdx], confidence: maxProb };
        }

        return null;
    } catch (err) {
        console.error('[ModelLoader] Prediction error:', err);
        return null;
    }
}

export function isModelLoaded(): boolean {
    return model !== null;
}

export function getModelLabels(): string[] {
    return labels;
}

export function unloadModel(): void {
    if (model && model.dispose) {
        model.dispose();
    }
    model = null;
    labels = [];
    loadFailed = false;
}
