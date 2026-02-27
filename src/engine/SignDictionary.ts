import { getExtendedFingers, distance } from './LandmarkProcessor';
import type { EngineSignEntry } from './types';

function countExtended(fingers: boolean[]): number {
    return fingers.filter(Boolean).length;
}

export const signDictionary: EngineSignEntry[] = [
    // === GREETINGS ===
    {
        id: 'hello', label: 'Hello', description: 'Open palm, all fingers spread',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (countExtended(f) === 5) return 0.7;
            return 0;
        },
    },
    {
        id: 'goodbye', label: 'Goodbye', description: 'Open palm waving',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (countExtended(f) === 5 && hands[0][0].y < 0.4) return 0.55;
            return 0;
        },
    },
    {
        id: 'good_morning', label: 'Good Morning', description: 'Flat hand rising from chin',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (countExtended(f) >= 4 && hands[0][12].y < 0.3) return 0.45;
            return 0;
        },
    },

    // === RESPONSES ===
    {
        id: 'yes', label: 'Yes', description: 'Closed fist nodding',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (countExtended(f) === 0) return 0.6;
            return 0;
        },
    },
    {
        id: 'no', label: 'No', description: 'Index and middle pinching',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (f[1] && f[2] && !f[3] && !f[4] && !f[0]) return 0.6;
            return 0;
        },
    },
    {
        id: 'thank_you', label: 'Thank You', description: 'Flat hand from chin forward',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (countExtended(f) >= 4 && hands[0][12].y < 0.35) return 0.55;
            return 0;
        },
    },
    {
        id: 'sorry', label: 'Sorry', description: 'Fist circling on chest',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (countExtended(f) <= 1 && hands[0][0].y > 0.5) return 0.45;
            return 0;
        },
    },
    {
        id: 'please', label: 'Please', description: 'Open palm on chest',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (countExtended(f) === 5 && hands[0][0].y > 0.55) return 0.5;
            return 0;
        },
    },
    {
        id: 'ok', label: 'OK', description: 'Thumb-index pinch, others extended',
        match: (hands) => {
            if (!hands[0]) return 0;
            const d = distance(hands[0][4], hands[0][8]);
            const f = getExtendedFingers(hands[0]);
            if (d < 0.05 && f[2] && f[3] && f[4]) return 0.65;
            return 0;
        },
    },

    // === COMMON GESTURES ===
    {
        id: 'good', label: 'Good', description: 'Thumbs up',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (f[0] && !f[1] && !f[2] && !f[3] && !f[4] && hands[0][4].y < hands[0][0].y) return 0.75;
            return 0;
        },
    },
    {
        id: 'bad', label: 'Bad', description: 'Thumbs down',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (f[0] && !f[1] && !f[2] && !f[3] && !f[4] && hands[0][4].y > hands[0][0].y) return 0.7;
            return 0;
        },
    },
    {
        id: 'stop', label: 'Stop', description: 'Open palm held up firm',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            const spread = Math.abs(hands[0][12].y - hands[0][0].y);
            if (countExtended(f) === 5 && spread > 0.15 && hands[0][0].y < 0.5) return 0.55;
            return 0;
        },
    },
    {
        id: 'help', label: 'Help', description: 'Fist on open palm',
        match: (hands) => {
            if (hands.length < 2) return 0;
            const e1 = countExtended(getExtendedFingers(hands[0]));
            const e2 = countExtended(getExtendedFingers(hands[1]));
            if ((e1 <= 1 && e2 >= 4) || (e2 <= 1 && e1 >= 4)) return 0.6;
            return 0;
        },
    },
    {
        id: 'love', label: 'I Love You', description: 'ILY sign — thumb, index, pinky',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (f[0] && f[1] && !f[2] && !f[3] && f[4]) return 0.75;
            return 0;
        },
    },
    {
        id: 'peace', label: 'Peace', description: 'V sign — index and middle spread',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (f[1] && f[2] && !f[3] && !f[4]) {
                const spread = distance(hands[0][8], hands[0][12]);
                if (spread > 0.03) return 0.65;
            }
            return 0;
        },
    },
    {
        id: 'call', label: 'Call Me', description: 'Thumb + pinky extended',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (f[0] && !f[1] && !f[2] && !f[3] && f[4]) return 0.7;
            return 0;
        },
    },

    // === PRONOUNS ===
    {
        id: 'me', label: 'Me / I', description: 'Point to self',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (f[1] && !f[2] && !f[3] && !f[4] && hands[0][8].y > 0.5) return 0.5;
            return 0;
        },
    },
    {
        id: 'you', label: 'You', description: 'Point forward',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (f[1] && !f[2] && !f[3] && !f[4] && hands[0][8].y < 0.4) return 0.5;
            return 0;
        },
    },

    // === QUESTIONS ===
    {
        id: 'what', label: 'What', description: 'Open hands palms up, shrug',
        match: (hands) => {
            if (hands.length < 2) return 0;
            const f1 = countExtended(getExtendedFingers(hands[0]));
            const f2 = countExtended(getExtendedFingers(hands[1]));
            if (f1 >= 4 && f2 >= 4 && hands[0][0].y > 0.5 && hands[1][0].y > 0.5) return 0.5;
            return 0;
        },
    },

    // === ACTIONS ===
    {
        id: 'eat', label: 'Eat', description: 'Fingers bunched to mouth',
        match: (hands) => {
            if (!hands[0]) return 0;
            const d = distance(hands[0][4], hands[0][8]);
            if (d < 0.04 && hands[0][8].y < 0.3) return 0.5;
            return 0;
        },
    },
    {
        id: 'drink', label: 'Drink', description: 'C-hand tilting to mouth',
        match: (hands) => {
            if (!hands[0]) return 0;
            const curve = distance(hands[0][4], hands[0][8]);
            if (curve > 0.05 && curve < 0.12 && hands[0][4].y < 0.35) return 0.45;
            return 0;
        },
    },

    // === NUMBERS (as words) ===
    {
        id: 'one', label: 'One', description: 'Index finger only',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (!f[0] && f[1] && !f[2] && !f[3] && !f[4]) return 0.65;
            return 0;
        },
    },
    {
        id: 'two', label: 'Two', description: 'Index + middle close',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (!f[0] && f[1] && f[2] && !f[3] && !f[4]) {
                if (distance(hands[0][8], hands[0][12]) <= 0.035) return 0.6;
            }
            return 0;
        },
    },
    {
        id: 'three', label: 'Three', description: 'Index + middle + ring',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (!f[0] && f[1] && f[2] && f[3] && !f[4]) return 0.6;
            return 0;
        },
    },
    {
        id: 'four', label: 'Four', description: 'All except thumb',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (!f[0] && f[1] && f[2] && f[3] && f[4]) return 0.6;
            return 0;
        },
    },
    {
        id: 'five', label: 'Five', description: 'All fingers + thumb',
        match: (hands) => {
            if (!hands[0]) return 0;
            const f = getExtendedFingers(hands[0]);
            if (f[0] && f[1] && f[2] && f[3] && f[4]) return 0.55;
            return 0;
        },
    },

    // === EMOTIONS ===
    {
        id: 'happy', label: 'Happy', description: 'Both hands open moving up from chest',
        match: (hands) => {
            if (hands.length < 2) return 0;
            const f1 = countExtended(getExtendedFingers(hands[0]));
            const f2 = countExtended(getExtendedFingers(hands[1]));
            if (f1 >= 4 && f2 >= 4 && hands[0][0].y < 0.45 && hands[1][0].y < 0.45) return 0.45;
            return 0;
        },
    },

    // === FAMILY / PEOPLE ===
    {
        id: 'friend', label: 'Friend', description: 'Interlocked index fingers',
        match: (hands) => {
            if (hands.length < 2) return 0;
            const d = distance(hands[0][8], hands[1][8]);
            const f1 = getExtendedFingers(hands[0]);
            const f2 = getExtendedFingers(hands[1]);
            if (d < 0.06 && f1[1] && f2[1]) return 0.5;
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
