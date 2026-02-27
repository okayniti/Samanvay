import { useRef, useCallback, useEffect, useState } from 'react';
import { FilesetResolver, HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';
import type { HandLandmark } from '../types';

interface MediaPipeResult {
    handLandmarks: HandLandmark[][];
    faceLandmarks: Array<{ x: number; y: number; z: number }>[];
}

interface UseMediaPipeOptions {
    maxHands?: number;
    detectFace?: boolean;
}

export function useMediaPipe(options: UseMediaPipeOptions = {}) {
    const { maxHands = 2, detectFace = true } = options;

    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );

                const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numHands: maxHands,
                });

                if (cancelled) return;
                handLandmarkerRef.current = handLandmarker;

                if (detectFace) {
                    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath:
                                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                            delegate: 'GPU',
                        },
                        runningMode: 'VIDEO',
                        numFaces: 1,
                        outputFaceBlendshapes: false,
                    });

                    if (cancelled) return;
                    faceLandmarkerRef.current = faceLandmarker;
                }

                setIsReady(true);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load MediaPipe models');
                }
            }
        }

        init();

        return () => {
            cancelled = true;
        };
    }, [maxHands, detectFace]);

    const detect = useCallback(
        (video: HTMLVideoElement, timestamp: number): MediaPipeResult | null => {
            if (!handLandmarkerRef.current) return null;

            const handResult = handLandmarkerRef.current.detectForVideo(video, timestamp);

            const handLandmarks: HandLandmark[][] = (handResult.landmarks || []).map((hand) =>
                hand.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }))
            );

            let faceLandmarks: Array<{ x: number; y: number; z: number }>[] = [];

            if (faceLandmarkerRef.current) {
                try {
                    const faceResult = faceLandmarkerRef.current.detectForVideo(video, timestamp);
                    faceLandmarks = (faceResult.faceLandmarks || []).map((face) =>
                        face.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }))
                    );
                } catch {
                    // Face detection can fail occasionally, ignore
                }
            }

            return { handLandmarks, faceLandmarks };
        },
        []
    );

    return { detect, isReady, loadError };
}
