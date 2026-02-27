import type { EmotionLabel } from '../types';

interface FacePoint {
    x: number;
    y: number;
    z: number;
}

export function detectEmotion(faceLandmarks: FacePoint[]): { label: EmotionLabel; confidence: number } {
    if (faceLandmarks.length < 468) {
        return { label: 'Neutral', confidence: 0.5 };
    }

    const leftMouth = faceLandmarks[61];
    const rightMouth = faceLandmarks[291];
    const topLip = faceLandmarks[13];
    const bottomLip = faceLandmarks[14];
    const leftEyebrow = faceLandmarks[70];
    const rightEyebrow = faceLandmarks[300];
    const leftEye = faceLandmarks[159];
    const rightEye = faceLandmarks[386];
    const noseTip = faceLandmarks[1];

    if (!leftMouth || !rightMouth || !topLip || !bottomLip || !leftEyebrow || !rightEyebrow || !leftEye || !rightEye || !noseTip) {
        return { label: 'Neutral', confidence: 0.4 };
    }

    const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
    const mouthHeight = Math.abs(bottomLip.y - topLip.y);
    const mouthRatio = mouthHeight / (mouthWidth || 0.001);

    const eyebrowLift = ((leftEyebrow.y + rightEyebrow.y) / 2 - (leftEye.y + rightEye.y) / 2);
    const mouthCornerLift = ((leftMouth.y + rightMouth.y) / 2) - noseTip.y;

    if (mouthRatio > 0.5 && eyebrowLift < -0.02) {
        return { label: 'Surprised', confidence: 0.72 };
    }

    if (mouthCornerLift > 0.06 && mouthRatio > 0.15) {
        return { label: 'Happy', confidence: 0.75 };
    }

    if (eyebrowLift > 0.01 && mouthCornerLift < 0.02) {
        return { label: 'Angry', confidence: 0.65 };
    }

    if (mouthCornerLift < 0.03 && eyebrowLift < -0.005) {
        return { label: 'Sad', confidence: 0.6 };
    }

    return { label: 'Neutral', confidence: 0.7 };
}

export function getEmotionEmoji(emotion: EmotionLabel): string {
    const map: Record<EmotionLabel, string> = {
        Happy: '😊',
        Sad: '😢',
        Neutral: '😐',
        Angry: '😠',
        Surprised: '😮',
    };
    return map[emotion];
}

export function modifyToneByEmotion(text: string, emotion: EmotionLabel): string {
    switch (emotion) {
        case 'Happy':
            return text.endsWith('!') ? text : `${text}!`;
        case 'Sad':
            return text.endsWith('...') ? text : `${text}...`;
        case 'Angry':
            return text.toUpperCase();
        case 'Surprised':
            return text.endsWith('!') ? text : `${text}!`;
        default:
            return text.endsWith('.') ? text : `${text}.`;
    }
}
