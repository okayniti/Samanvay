import { getExtendedFingers, distance } from './LandmarkProcessor';
import type { EngineSignEntry } from './types';

function countExtended(fingers: boolean[]): number {
    return fingers.filter(Boolean).length;
}

export const signDictionary: EngineSignEntry[] = [
    {
        id: 'hello',
        label: 'Hello',
        description: 'Open palm, all fingers extended',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            const allExtended = countExtended(fingers) === 5;
            if (allExtended) return 0.75;
            return 0;
        },
    },
    {
        id: 'thank_you',
        label: 'Thank You',
        description: 'Flat hand near chin area',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            const allExtended = countExtended(fingers) >= 4;
            const middleTip = hands[0][12];
            if (!middleTip) return 0;
            if (allExtended && middleTip.y < 0.35) return 0.6;
            return 0;
        },
    },
    {
        id: 'yes',
        label: 'Yes',
        description: 'Closed fist',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            const extended = countExtended(fingers);
            if (extended === 0) return 0.7;
            if (extended === 1 && fingers[0]) return 0.45;
            return 0;
        },
    },
    {
        id: 'no',
        label: 'No',
        description: 'Index and middle finger pinching together',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            if (fingers[1] && fingers[2] && !fingers[3] && !fingers[4] && !fingers[0]) return 0.65;
            return 0;
        },
    },
    {
        id: 'please',
        label: 'Please',
        description: 'Open palm on lower area',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            const allExtended = countExtended(fingers) === 5;
            const wrist = hands[0][0];
            if (!wrist) return 0;
            if (allExtended && wrist.y > 0.55) return 0.55;
            return 0;
        },
    },
    {
        id: 'good',
        label: 'Good / Thumbs Up',
        description: 'Only thumb extended upward',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            const thumb = hands[0][4];
            const wrist = hands[0][0];
            if (!thumb || !wrist) return 0;
            if (fingers[0] && !fingers[1] && !fingers[2] && !fingers[3] && !fingers[4]) {
                if (thumb.y < wrist.y) return 0.8;
                return 0.5;
            }
            return 0;
        },
    },
    {
        id: 'bad',
        label: 'Bad / Thumbs Down',
        description: 'Only thumb extended downward',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            const thumb = hands[0][4];
            const wrist = hands[0][0];
            if (!thumb || !wrist) return 0;
            if (fingers[0] && !fingers[1] && !fingers[2] && !fingers[3] && !fingers[4]) {
                if (thumb.y > wrist.y) return 0.75;
            }
            return 0;
        },
    },
    {
        id: 'help',
        label: 'Help',
        description: 'Both hands visible — one fist, one open',
        match: (hands) => {
            if (hands.length < 2) return 0;
            const fingers1 = getExtendedFingers(hands[0]);
            const fingers2 = getExtendedFingers(hands[1]);
            const ext1 = countExtended(fingers1);
            const ext2 = countExtended(fingers2);
            if ((ext1 <= 1 && ext2 >= 4) || (ext2 <= 1 && ext1 >= 4)) return 0.65;
            return 0;
        },
    },
    {
        id: 'stop',
        label: 'Stop',
        description: 'Open palm held up high',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            const allExtended = countExtended(fingers) === 5;
            const wrist = hands[0][0];
            const middleTip = hands[0][12];
            if (!wrist || !middleTip) return 0;
            const verticalSpread = Math.abs(middleTip.y - wrist.y);
            if (allExtended && verticalSpread > 0.15 && wrist.y < 0.5) return 0.6;
            return 0;
        },
    },
    {
        id: 'love',
        label: 'I Love You',
        description: 'Thumb, index, and pinky extended (ILY)',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            if (fingers[0] && fingers[1] && !fingers[2] && !fingers[3] && fingers[4]) return 0.8;
            return 0;
        },
    },
    {
        id: 'peace',
        label: 'Peace / Victory',
        description: 'Index and middle finger in V shape',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            if (fingers[1] && fingers[2] && !fingers[3] && !fingers[4]) {
                const indexTip = hands[0][8];
                const middleTip = hands[0][12];
                if (indexTip && middleTip) {
                    const spread = distance(indexTip, middleTip);
                    if (spread > 0.03) return 0.7;
                    return 0.5;
                }
            }
            return 0;
        },
    },
    {
        id: 'one',
        label: 'One',
        description: 'Only index finger extended',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            if (!fingers[0] && fingers[1] && !fingers[2] && !fingers[3] && !fingers[4]) return 0.7;
            return 0;
        },
    },
    {
        id: 'two',
        label: 'Two',
        description: 'Index and middle fingers close together',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            if (!fingers[0] && fingers[1] && fingers[2] && !fingers[3] && !fingers[4]) {
                const indexTip = hands[0][8];
                const middleTip = hands[0][12];
                if (indexTip && middleTip) {
                    const spread = distance(indexTip, middleTip);
                    if (spread <= 0.04) return 0.65;
                }
            }
            return 0;
        },
    },
    {
        id: 'three',
        label: 'Three',
        description: 'Index, middle, and ring fingers extended',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            if (!fingers[0] && fingers[1] && fingers[2] && fingers[3] && !fingers[4]) return 0.65;
            return 0;
        },
    },
    {
        id: 'four',
        label: 'Four',
        description: 'All fingers except thumb extended',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            if (!fingers[0] && fingers[1] && fingers[2] && fingers[3] && fingers[4]) return 0.65;
            return 0;
        },
    },
    {
        id: 'call',
        label: 'Call Me',
        description: 'Thumb and pinky extended (phone gesture)',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const fingers = getExtendedFingers(hands[0]);
            if (fingers[0] && !fingers[1] && !fingers[2] && !fingers[3] && fingers[4]) return 0.75;
            return 0;
        },
    },
    {
        id: 'ok',
        label: 'OK',
        description: 'Thumb and index finger forming circle, others extended',
        match: (hands) => {
            if (hands.length === 0) return 0;
            const thumbTip = hands[0][4];
            const indexTip = hands[0][8];
            const fingers = getExtendedFingers(hands[0]);
            if (!thumbTip || !indexTip) return 0;
            const pinchDist = distance(thumbTip, indexTip);
            if (pinchDist < 0.05 && fingers[2] && fingers[3] && fingers[4]) return 0.7;
            return 0;
        },
    },
];

export function getSignById(id: string): EngineSignEntry | undefined {
    return signDictionary.find((s) => s.id === id);
}

export function getAllSigns(): EngineSignEntry[] {
    return signDictionary;
}
