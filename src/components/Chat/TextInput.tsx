import { useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { textToSignSequence } from '../../translation/TextToSign';
import { VoiceInput } from './VoiceInput';
import './TextInput.css';

export function TextInput() {
    const [text, setText] = useState('');
    const addMessage = useAppStore((s) => s.addMessage);
    const setCurrentSignAnimation = useAppStore((s) => s.setCurrentSignAnimation);

    const handleSend = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed) return;

        addMessage({
            id: `text-${Date.now()}`,
            text: trimmed,
            source: 'text',
            timestamp: Date.now(),
        });

        const signs = textToSignSequence(trimmed);
        if (signs.length > 0) {
            let delay = 0;
            signs.forEach((sign) => {
                setTimeout(() => {
                    setCurrentSignAnimation(sign.signId);
                }, delay);
                delay += 1500;
            });
            setTimeout(() => setCurrentSignAnimation(null), delay);
        }

        setText('');
    }, [text, addMessage, setCurrentSignAnimation]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleVoiceResult = useCallback((transcript: string) => {
        setText(transcript);
    }, []);

    return (
        <div className="text-input-container">
            <div className="text-input-wrapper">
                <textarea
                    className="text-input-field"
                    placeholder="Type a message to translate to ISL..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    aria-label="Text input for sign language translation"
                />
                <VoiceInput onResult={handleVoiceResult} />
                <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!text.trim()}
                    aria-label="Send message"
                    title="Send"
                >
                    →
                </button>
            </div>
        </div>
    );
}
