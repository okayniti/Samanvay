import type { HandLandmark } from '../types';

export interface NumberEntry {
    digit: string;
    match: (landmarks: HandLandmark[]) => number;
}

function dist(a: HandLandmark, b: HandLandmark): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function isExtended(lm: HandLandmark[], tip: number, mcp: number): boolean {
    return dist(lm[tip], lm[0]) > dist(lm[mcp], lm[0]) * 1.08;
}

function isCurled(lm: HandLandmark[], tip: number, pip: number, mcp: number): boolean {
    return dist(lm[tip], lm[0]) < dist(lm[pip], lm[0]) && dist(lm[tip], lm[0]) < dist(lm[mcp], lm[0]) * 1.05;
}

function thumbExt(lm: HandLandmark[]): boolean {
    return dist(lm[4], lm[0]) > dist(lm[2], lm[0]) * 1.2;
}

function allCurled(lm: HandLandmark[]): boolean {
    return isCurled(lm, 8, 6, 5) && isCurled(lm, 12, 10, 9) &&
        isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17);
}

export const numberDictionary: NumberEntry[] = [
    {
        digit: '0',
        match: (lm) => {
            const touching = dist(lm[4], lm[8]) < 0.05;
            if (touching && isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) return 0.6;
            return 0;
        },
    },
    {
        digit: '1',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && !thumbExt(lm) &&
                isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) return 0.7;
            return 0;
        },
    },
    {
        digit: '2',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) && !thumbExt(lm) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                const spread = dist(lm[8], lm[12]);
                if (spread > 0.03) return 0.65;
            }
            return 0;
        },
    },
    {
        digit: '3',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) && isExtended(lm, 16, 13) &&
                !thumbExt(lm) && isCurled(lm, 20, 18, 17)) return 0.65;
            return 0;
        },
    },
    {
        digit: '4',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) &&
                isExtended(lm, 16, 13) && isExtended(lm, 20, 17) && !thumbExt(lm)) return 0.65;
            return 0;
        },
    },
    {
        digit: '5',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) &&
                isExtended(lm, 16, 13) && isExtended(lm, 20, 17) && thumbExt(lm)) return 0.65;
            return 0;
        },
    },
    {
        digit: '6',
        match: (lm) => {
            if (thumbExt(lm) && isExtended(lm, 20, 17) &&
                isCurled(lm, 8, 6, 5) && isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13)) return 0.55;
            return 0;
        },
    },
    {
        digit: '7',
        match: (lm) => {
            if (thumbExt(lm) && isExtended(lm, 16, 13) &&
                isCurled(lm, 8, 6, 5) && isCurled(lm, 12, 10, 9) && isCurled(lm, 20, 18, 17)) return 0.55;
            return 0;
        },
    },
    {
        digit: '8',
        match: (lm) => {
            if (thumbExt(lm) && isExtended(lm, 12, 9) &&
                isCurled(lm, 8, 6, 5) && isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) return 0.55;
            return 0;
        },
    },
    {
        digit: '9',
        match: (lm) => {
            if (thumbExt(lm) && isExtended(lm, 8, 5) &&
                isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) return 0.55;
            return 0;
        },
    },
];

export function recognizeNumber(landmarks: HandLandmark[]): { digit: string; confidence: number } | null {
    if (landmarks.length < 21) return null;

    let bestDigit = '';
    let bestConf = 0;

    for (const entry of numberDictionary) {
        const conf = entry.match(landmarks);
        if (conf > bestConf) {
            bestConf = conf;
            bestDigit = entry.digit;
        }
    }

    if (bestConf < 0.4) return null;
    return { digit: bestDigit, confidence: bestConf };
}
