import type { HandLandmark } from '../types';

const SMOOTHING_FACTOR = 0.7;

let previousLandmarks: HandLandmark[][] = [];

export function smoothLandmarks(current: HandLandmark[][]): HandLandmark[][] {
    if (previousLandmarks.length === 0) {
        previousLandmarks = current;
        return current;
    }

    const smoothed = current.map((hand, handIdx) => {
        const prevHand = previousLandmarks[handIdx];
        if (!prevHand) return hand;

        return hand.map((lm, i) => {
            const prev = prevHand[i];
            if (!prev) return lm;
            return {
                x: prev.x * SMOOTHING_FACTOR + lm.x * (1 - SMOOTHING_FACTOR),
                y: prev.y * SMOOTHING_FACTOR + lm.y * (1 - SMOOTHING_FACTOR),
                z: prev.z * SMOOTHING_FACTOR + lm.z * (1 - SMOOTHING_FACTOR),
            };
        });
    });

    previousLandmarks = smoothed;
    return smoothed;
}

export function getFingerTipIndices(): number[] {
    return [4, 8, 12, 16, 20];
}

export function getFingerMCPIndices(): number[] {
    return [2, 5, 9, 13, 17];
}

export function distance(a: HandLandmark, b: HandLandmark): number {
    return Math.sqrt(
        (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
    );
}

export function isFingerExtended(landmarks: HandLandmark[], tipIdx: number, mcpIdx: number): boolean {
    const tip = landmarks[tipIdx];
    const mcp = landmarks[mcpIdx];
    const wrist = landmarks[0];
    if (!tip || !mcp || !wrist) return false;

    return distance(tip, wrist) > distance(mcp, wrist) * 1.1;
}

export function getExtendedFingers(landmarks: HandLandmark[]): boolean[] {
    const tips = getFingerTipIndices();
    const mcps = getFingerMCPIndices();
    return tips.map((tip, i) => isFingerExtended(landmarks, tip, mcps[i]));
}

export function palmFacing(landmarks: HandLandmark[]): 'forward' | 'backward' | 'unknown' {
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    const indexMcp = landmarks[5];
    if (!wrist || !middleMcp || !indexMcp) return 'unknown';

    const palmZ = (wrist.z + middleMcp.z + indexMcp.z) / 3;
    return palmZ < 0 ? 'forward' : 'backward';
}

export function resetSmoothing(): void {
    previousLandmarks = [];
}
