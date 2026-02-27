import { getSignById, getAllSigns } from '../engine/SignDictionary';

export interface SignAnimation {
    signId: string;
    label: string;
    description: string;
    found: boolean;
}

export function textToSignSequence(text: string): SignAnimation[] {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const allSigns = getAllSigns();

    return words.map((word) => {
        const sign = getSignById(word) || allSigns.find((s) => s.label.toLowerCase() === word);
        if (sign) {
            return {
                signId: sign.id,
                label: sign.label,
                description: sign.description,
                found: true,
            };
        }
        return {
            signId: word,
            label: word.charAt(0).toUpperCase() + word.slice(1),
            description: `Fingerspell: ${word.toUpperCase()}`,
            found: false,
        };
    });
}
