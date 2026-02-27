import { useRef, useEffect, useCallback, useState } from 'react';

interface UseWebcamOptions {
    width?: number;
    height?: number;
    facingMode?: 'user' | 'environment';
}

export function useWebcam(options: UseWebcamOptions = {}) {
    const { width = 640, height = 480, facingMode = 'user' } = options;
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle');
    const [error, setError] = useState<string | undefined>();

    const start = useCallback(async () => {
        if (streamRef.current) return;

        setStatus('requesting');
        setError(undefined);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width, height, facingMode },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setStatus('active');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Camera access denied';
            setError(message);
            setStatus('error');
        }
    }, [width, height, facingMode]);

    const stop = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setStatus('idle');
    }, []);

    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return { videoRef, status, error, start, stop };
}
