import { useState, useCallback } from 'react';
import { startListening, stopListening, isSupported } from '../../speech/SpeechToText';

interface VoiceInputProps {
    onResult: (transcript: string) => void;
}

export function VoiceInput({ onResult }: VoiceInputProps) {
    const [listening, setListening] = useState(false);
    const [interim, setInterim] = useState('');

    const toggle = useCallback(() => {
        if (listening) {
            stopListening();
            setListening(false);
            setInterim('');
        } else {
            setListening(true);
            startListening((transcript, isFinal) => {
                if (isFinal) {
                    onResult(transcript);
                    setInterim('');
                    stopListening();
                    setListening(false);
                } else {
                    setInterim(transcript);
                }
            });
        }
    }, [listening, onResult]);

    if (!isSupported()) return null;

    return (
        <>
            <button
                className={`voice-btn ${listening ? 'listening' : ''}`}
                onClick={toggle}
                aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                title={listening ? 'Stop listening' : 'Voice input'}
            >
                🎙
            </button>
            {interim && <span className="interim-text">{interim}</span>}
        </>
    );
}
