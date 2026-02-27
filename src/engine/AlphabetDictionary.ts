import type { HandLandmark } from '../types';

export interface AlphabetEntry {
    letter: string;
    match: (landmarks: HandLandmark[]) => number;
}

function tipY(lm: HandLandmark[], idx: number): number {
    return lm[idx]?.y ?? 0;
}

function dist(a: HandLandmark, b: HandLandmark): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function isCurled(lm: HandLandmark[], tip: number, pip: number, mcp: number): boolean {
    const tipToWrist = dist(lm[tip], lm[0]);
    const mcpToWrist = dist(lm[mcp], lm[0]);
    const pipToWrist = dist(lm[pip], lm[0]);
    return tipToWrist < pipToWrist && tipToWrist < mcpToWrist * 1.05;
}

function isExtended(lm: HandLandmark[], tip: number, mcp: number): boolean {
    return dist(lm[tip], lm[0]) > dist(lm[mcp], lm[0]) * 1.08;
}

function thumbExtended(lm: HandLandmark[]): boolean {
    return dist(lm[4], lm[0]) > dist(lm[2], lm[0]) * 1.2;
}

function thumbAcrossPalm(lm: HandLandmark[]): boolean {
    const thumb = lm[4];
    const pinkyMcp = lm[17];
    const indexMcp = lm[5];
    if (!thumb || !pinkyMcp || !indexMcp) return false;
    return Math.abs(thumb.x - pinkyMcp.x) < Math.abs(indexMcp.x - pinkyMcp.x) * 0.5;
}

function fingersTouching(lm: HandLandmark[], a: number, b: number, threshold = 0.04): boolean {
    return dist(lm[a], lm[b]) < threshold;
}

function allFingersCurled(lm: HandLandmark[]): boolean {
    return isCurled(lm, 8, 6, 5) && isCurled(lm, 12, 10, 9) &&
        isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17);
}

function allFingersExtended(lm: HandLandmark[]): boolean {
    return isExtended(lm, 8, 5) && isExtended(lm, 12, 9) &&
        isExtended(lm, 16, 13) && isExtended(lm, 20, 17);
}

function fingersTogetherExtended(lm: HandLandmark[]): boolean {
    if (!allFingersExtended(lm)) return false;
    const spread = dist(lm[8], lm[20]);
    return spread < 0.12;
}

function countExtendedFingers(lm: HandLandmark[]): number {
    let c = 0;
    if (isExtended(lm, 8, 5)) c++;
    if (isExtended(lm, 12, 9)) c++;
    if (isExtended(lm, 16, 13)) c++;
    if (isExtended(lm, 20, 17)) c++;
    return c;
}

export const alphabetDictionary: AlphabetEntry[] = [
    {
        letter: 'A',
        match: (lm) => {
            if (allFingersCurled(lm) && thumbExtended(lm) && lm[4].y < lm[8].y) return 0.7;
            return 0;
        },
    },
    {
        letter: 'B',
        match: (lm) => {
            if (fingersTogetherExtended(lm) && !thumbExtended(lm)) return 0.7;
            if (allFingersExtended(lm) && dist(lm[8], lm[12]) < 0.04 && !thumbExtended(lm)) return 0.65;
            return 0;
        },
    },
    {
        letter: 'C',
        match: (lm) => {
            const curveScore = dist(lm[4], lm[8]);
            const ext = countExtendedFingers(lm);
            if (curveScore > 0.06 && curveScore < 0.15 && ext >= 2 && ext <= 4) {
                const thumbAbove = lm[4].y < lm[12].y;
                if (thumbAbove) return 0.6;
            }
            return 0;
        },
    },
    {
        letter: 'D',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isCurled(lm, 12, 10, 9) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                if (fingersTouching(lm, 4, 12, 0.06)) return 0.7;
                if (thumbExtended(lm) && lm[4].y > lm[8].y) return 0.5;
            }
            return 0;
        },
    },
    {
        letter: 'E',
        match: (lm) => {
            if (allFingersCurled(lm) && !thumbExtended(lm) && thumbAcrossPalm(lm)) return 0.6;
            return 0;
        },
    },
    {
        letter: 'F',
        match: (lm) => {
            if (fingersTouching(lm, 4, 8, 0.05) &&
                isExtended(lm, 12, 9) && isExtended(lm, 16, 13) && isExtended(lm, 20, 17)) return 0.7;
            return 0;
        },
    },
    {
        letter: 'G',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && thumbExtended(lm) &&
                isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                const pointing = Math.abs(lm[8].y - lm[5].y) < Math.abs(lm[8].x - lm[5].x);
                if (pointing) return 0.65;
            }
            return 0;
        },
    },
    {
        letter: 'H',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                const sideways = Math.abs(lm[8].y - lm[5].y) < Math.abs(lm[8].x - lm[5].x);
                if (sideways) return 0.6;
            }
            return 0;
        },
    },
    {
        letter: 'I',
        match: (lm) => {
            if (isExtended(lm, 20, 17) && isCurled(lm, 8, 6, 5) &&
                isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13) && !thumbExtended(lm)) return 0.7;
            return 0;
        },
    },
    {
        letter: 'J',
        match: (lm) => {
            if (isExtended(lm, 20, 17) && isCurled(lm, 8, 6, 5) &&
                isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13)) return 0.45;
            return 0;
        },
    },
    {
        letter: 'K',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17) && thumbExtended(lm)) {
                const spread = dist(lm[8], lm[12]);
                if (spread > 0.04) return 0.65;
            }
            return 0;
        },
    },
    {
        letter: 'L',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && thumbExtended(lm) &&
                isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                const angle = Math.abs(lm[4].x - lm[0].x) > 0.05;
                if (angle) return 0.7;
            }
            return 0;
        },
    },
    {
        letter: 'M',
        match: (lm) => {
            if (allFingersCurled(lm) && thumbAcrossPalm(lm)) {
                if (tipY(lm, 4) > tipY(lm, 16)) return 0.5;
            }
            return 0;
        },
    },
    {
        letter: 'N',
        match: (lm) => {
            if (allFingersCurled(lm) && thumbAcrossPalm(lm)) {
                if (tipY(lm, 4) > tipY(lm, 12) && tipY(lm, 4) < tipY(lm, 16)) return 0.5;
            }
            return 0;
        },
    },
    {
        letter: 'O',
        match: (lm) => {
            if (fingersTouching(lm, 4, 8, 0.05) && fingersTouching(lm, 4, 12, 0.07)) {
                if (isCurled(lm, 16, 14, 13) || fingersTouching(lm, 4, 16, 0.08)) return 0.65;
            }
            return 0;
        },
    },
    {
        letter: 'P',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                if (lm[8].y > lm[5].y) return 0.55;
            }
            return 0;
        },
    },
    {
        letter: 'Q',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && thumbExtended(lm) &&
                isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                if (lm[8].y > lm[5].y && lm[4].y > lm[2].y) return 0.55;
            }
            return 0;
        },
    },
    {
        letter: 'R',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                const crossed = dist(lm[8], lm[12]) < 0.025;
                if (crossed) return 0.65;
            }
            return 0;
        },
    },
    {
        letter: 'S',
        match: (lm) => {
            if (allFingersCurled(lm) && !thumbExtended(lm) && !thumbAcrossPalm(lm)) return 0.55;
            return 0;
        },
    },
    {
        letter: 'T',
        match: (lm) => {
            if (allFingersCurled(lm) && thumbAcrossPalm(lm)) {
                if (fingersTouching(lm, 4, 6, 0.05)) return 0.55;
            }
            return 0;
        },
    },
    {
        letter: 'U',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17) && !thumbExtended(lm)) {
                const together = dist(lm[8], lm[12]) < 0.035;
                if (together) return 0.65;
            }
            return 0;
        },
    },
    {
        letter: 'V',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                const spread = dist(lm[8], lm[12]);
                if (spread > 0.04) return 0.65;
            }
            return 0;
        },
    },
    {
        letter: 'W',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isExtended(lm, 12, 9) && isExtended(lm, 16, 13) &&
                isCurled(lm, 20, 18, 17) && !thumbExtended(lm)) return 0.65;
            return 0;
        },
    },
    {
        letter: 'X',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isCurled(lm, 12, 10, 9) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17) && !thumbExtended(lm)) {
                const hooked = lm[8].y > lm[7].y;
                if (hooked) return 0.55;
            }
            return 0;
        },
    },
    {
        letter: 'Y',
        match: (lm) => {
            if (thumbExtended(lm) && isExtended(lm, 20, 17) &&
                isCurled(lm, 8, 6, 5) && isCurled(lm, 12, 10, 9) && isCurled(lm, 16, 14, 13)) return 0.7;
            return 0;
        },
    },
    {
        letter: 'Z',
        match: (lm) => {
            if (isExtended(lm, 8, 5) && isCurled(lm, 12, 10, 9) &&
                isCurled(lm, 16, 14, 13) && isCurled(lm, 20, 18, 17)) {
                return 0.4;
            }
            return 0;
        },
    },
];

export function recognizeAlphabet(landmarks: HandLandmark[]): { letter: string; confidence: number } | null {
    if (landmarks.length < 21) return null;

    let bestLetter = '';
    let bestConf = 0;

    for (const entry of alphabetDictionary) {
        const conf = entry.match(landmarks);
        if (conf > bestConf) {
            bestConf = conf;
            bestLetter = entry.letter;
        }
    }

    if (bestConf < 0.4) return null;
    return { letter: bestLetter, confidence: bestConf };
}
