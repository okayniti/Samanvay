import type { HandLandmark } from '../../types';

const CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17],
];

const FINGER_COLORS = [
    '#ff6b6b',
    '#ffd93d',
    '#6bcb77',
    '#4d96ff',
    '#9b59b6',
];

function getFingerColor(landmarkIdx: number): string {
    if (landmarkIdx <= 4) return FINGER_COLORS[0];
    if (landmarkIdx <= 8) return FINGER_COLORS[1];
    if (landmarkIdx <= 12) return FINGER_COLORS[2];
    if (landmarkIdx <= 16) return FINGER_COLORS[3];
    return FINGER_COLORS[4];
}

function draw(
    canvas: HTMLCanvasElement,
    hands: HandLandmark[][],
    videoWidth: number,
    videoHeight: number
): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const landmarks of hands) {
        for (const [startIdx, endIdx] of CONNECTIONS) {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];
            if (!start || !end) continue;

            ctx.beginPath();
            ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
            ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        landmarks.forEach((lm, idx) => {
            const x = lm.x * canvas.width;
            const y = lm.y * canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, idx === 0 ? 5 : 3, 0, Math.PI * 2);
            ctx.fillStyle = getFingerColor(idx);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, idx === 0 ? 8 : 5, 0, Math.PI * 2);
            ctx.strokeStyle = `${getFingerColor(idx)}44`;
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }
}

export const HandOverlay = { draw };
