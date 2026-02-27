import type { HandLandmark } from '../types';

export interface EngineSignEntry {
    id: string;
    label: string;
    description: string;
    match: (hands: HandLandmark[][]) => number;
}
