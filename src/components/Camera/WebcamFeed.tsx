import { useEffect, useRef, useCallback, useState } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { useMediaPipe } from '../../hooks/useMediaPipe';
import { useTeachMe } from '../../hooks/useTeachMe';
import { useAppStore } from '../../store/useAppStore';
import { recognizeGesture, initModel } from '../../engine/GestureEngine';
import { detectEmotion, getEmotionEmoji, modifyToneByEmotion } from '../../emotion/EmotionDetector';
import { HandOverlay } from './HandOverlay';
import './WebcamFeed.css';

export function WebcamFeed() {
    const { videoRef, status, error, start, stop } = useWebcam();
    const { detect, isReady, loadError } = useMediaPipe();
    const { recordFrame } = useTeachMe();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const fpsCountRef = useRef({ frames: 0, lastTime: performance.now() });

    const [handsVisible, setHandsVisible] = useState(false);
    const [candidateSign, setCandidateSign] = useState('');
    const [candidateConfidence, setCandidateConfidence] = useState(0);
    const [usingModel, setUsingModel] = useState(false);
    const [candidateType, setCandidateType] = useState('');

    const addMessage = useAppStore((s) => s.addMessage);
    const setCurrentEmotion = useAppStore((s) => s.setCurrentEmotion);
    const setFps = useAppStore((s) => s.setFps);
    const teachMeEnabled = useAppStore((s) => s.teachMe.enabled);
    const addDetectedSign = useAppStore((s) => s.addDetectedSign);
    const currentEmotion = useAppStore((s) => s.currentEmotion);
    const detectedSigns = useAppStore((s) => s.detectedSigns);

    const lastSign = detectedSigns.length > 0 ? detectedSigns[detectedSigns.length - 1] : null;

    const processFrame = useCallback(() => {
        const video = videoRef.current;
        if (!video || video.paused || video.ended || !isReady) {
            animFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }

        const timestamp = performance.now();
        const result = detect(video, timestamp);

        if (result) {
            setHandsVisible(result.handLandmarks.length > 0);

            if (result.handLandmarks.length > 0) {
                if (teachMeEnabled) {
                    recordFrame(result.handLandmarks);
                }

                const gestureResult = recognizeGesture(result.handLandmarks);

                setCandidateSign(gestureResult.bestCandidate);
                setCandidateConfidence(gestureResult.bestCandidateConfidence);
                setUsingModel(gestureResult.usingModel);
                setCandidateType(gestureResult.type);

                if (gestureResult.sign) {
                    addDetectedSign(gestureResult.sign);
                    const emotion = useAppStore.getState().currentEmotion;
                    const toned = modifyToneByEmotion(gestureResult.sign.label, emotion);
                    addMessage({
                        id: `sign-${gestureResult.sign.timestamp}`,
                        text: toned,
                        emotion,
                        source: 'sign',
                        timestamp: gestureResult.sign.timestamp,
                    });
                }
            } else {
                setCandidateSign('');
                setCandidateConfidence(0);
            }

            if (result.faceLandmarks.length > 0) {
                const emotion = detectEmotion(result.faceLandmarks[0]);
                setCurrentEmotion(emotion.label);
            }

            if (canvasRef.current) {
                HandOverlay.draw(canvasRef.current, result.handLandmarks, video.videoWidth, video.videoHeight);
            }
        }

        fpsCountRef.current.frames++;
        const elapsed = timestamp - fpsCountRef.current.lastTime;
        if (elapsed >= 1000) {
            setFps(Math.round((fpsCountRef.current.frames * 1000) / elapsed));
            fpsCountRef.current = { frames: 0, lastTime: timestamp };
        }

        animFrameRef.current = requestAnimationFrame(processFrame);
    }, [isReady, detect, videoRef, teachMeEnabled, recordFrame, addDetectedSign, addMessage, setCurrentEmotion, setFps]);

    useEffect(() => {
        if (status === 'active' && isReady) {
            animFrameRef.current = requestAnimationFrame(processFrame);
        }
        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [status, isReady, processFrame]);

    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    // Initialize ML model on mount
    useEffect(() => {
        initModel().then((loaded) => {
            setUsingModel(loaded);
            console.log(loaded ? '🧠 ML model loaded' : '📋 Using heuristic fallback');
        });
    }, []);

    if (loadError) {
        return (
            <div className="webcam-container">
                <div className="webcam-placeholder">
                    <div className="webcam-error">⚠️ {loadError}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="webcam-container">
            <video ref={videoRef} className="webcam-video" playsInline muted aria-label="Webcam feed" style={{ display: status === 'active' ? 'block' : 'none' }} />
            <canvas ref={canvasRef} className="webcam-overlay" aria-hidden="true" style={{ display: status === 'active' ? 'block' : 'none' }} />

            {status === 'active' && (
                <div className="emotion-badge" aria-label={`Detected emotion: ${currentEmotion}`}>
                    <span>{getEmotionEmoji(currentEmotion)}</span>
                    <span>{currentEmotion}</span>
                </div>
            )}

            {status === 'active' && (
                <div className={`hand-status-bar ${handsVisible ? 'detected' : ''}`}>
                    <span className={`hand-status-dot ${handsVisible ? 'active' : ''}`} />
                    <span className="hand-status-text">
                        {handsVisible
                            ? candidateSign
                                ? `${candidateType === 'model' ? '🧠' : '📋'} ${candidateSign} (${Math.round(candidateConfidence * 100)}%)`
                                : 'Hands detected — analyzing...'
                            : 'Show your hands to the camera'}
                    </span>
                    {usingModel && <span className="model-badge">AI</span>}
                </div>
            )}

            {lastSign && Date.now() - lastSign.timestamp < 3000 && (
                <div className="detected-sign-badge" aria-live="polite">
                    ✅ {lastSign.label} ({Math.round(lastSign.confidence * 100)}%)
                </div>
            )}

            {status === 'idle' && (
                <div className="webcam-placeholder">
                    <span className="webcam-placeholder-icon">📷</span>
                    <p className="webcam-placeholder-text">
                        {isReady ? 'Camera ready. Click to start.' : 'Loading AI models...'}
                    </p>
                    <button
                        className="webcam-start-btn"
                        onClick={start}
                        disabled={!isReady}
                        aria-label="Start camera"
                    >
                        {isReady ? 'Start Camera' : 'Loading Models...'}
                    </button>
                    {!isReady && (
                        <p className="webcam-loading-hint">
                            Downloading MediaPipe models (~5MB)...
                        </p>
                    )}
                </div>
            )}

            {status === 'requesting' && (
                <div className="webcam-loading">
                    <div className="webcam-spinner" />
                    <span className="webcam-loading-text">Requesting camera access...</span>
                </div>
            )}

            {status === 'error' && (
                <div className="webcam-placeholder">
                    <div className="webcam-error">❌ {error || 'Could not access camera'}</div>
                    <button className="webcam-start-btn" onClick={start} aria-label="Retry camera">
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
