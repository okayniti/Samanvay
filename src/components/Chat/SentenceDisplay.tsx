import { useState, useEffect } from 'react';
import { onSentenceUpdate, clearSentence, backspace, addSpace, getSentenceState } from '../../engine/SentenceBuilder';
import type { SentenceState } from '../../engine/SentenceBuilder';
import { speak } from '../../speech/TextToSpeech';
import { useAppStore } from '../../store/useAppStore';
import './SentenceDisplay.css';

export function SentenceDisplay() {
    const [sentence, setSentence] = useState<SentenceState>(getSentenceState());
    const addMessage = useAppStore((s) => s.addMessage);

    useEffect(() => {
        onSentenceUpdate((state) => {
            setSentence(state);
        });
    }, []);

    const handleSubmit = () => {
        if (!sentence.fullSentence.trim()) return;
        addMessage({
            id: `sentence-${Date.now()}`,
            text: sentence.fullSentence.trim(),
            source: 'sign',
            timestamp: Date.now(),
        });
        speak(sentence.fullSentence.trim());
        clearSentence();
    };

    const handleSpeak = () => {
        if (sentence.fullSentence.trim()) {
            speak(sentence.fullSentence.trim());
        }
    };

    const hasContent = sentence.fullSentence.trim().length > 0;

    return (
        <div className="sentence-display">
            <div className="sentence-header">
                <span className="sentence-label">
                    <span>📝</span>
                    <span>Live Sentence</span>
                </span>
                {hasContent && (
                    <span className={`sentence-mode-badge ${sentence.mode}`}>
                        {sentence.mode === 'letter' ? '🔤 Fingerspelling' : '✋ Word Signs'}
                    </span>
                )}
            </div>

            <div className={`sentence-text-area ${hasContent ? 'active' : ''}`}>
                {hasContent ? (
                    <p className="sentence-text">
                        {sentence.words.length > 0 && (
                            <span className="sentence-completed-words">
                                {sentence.words.join(' ')}{' '}
                            </span>
                        )}
                        {sentence.currentWord && (
                            <span className="sentence-current-word">{sentence.currentWord}</span>
                        )}
                        <span className="sentence-cursor" />
                    </p>
                ) : (
                    <p className="sentence-placeholder">
                        Sign letters to spell words, or use word signs for quick input...
                    </p>
                )}
            </div>

            <div className="sentence-actions">
                <button
                    className="sentence-action-btn"
                    onClick={backspace}
                    disabled={!hasContent}
                    aria-label="Backspace"
                    title="Delete last character"
                >
                    ← Back
                </button>
                <button
                    className="sentence-action-btn"
                    onClick={addSpace}
                    disabled={!sentence.currentWord}
                    aria-label="Add space"
                    title="Add space between words"
                >
                    ⎵ Space
                </button>
                <button
                    className="sentence-action-btn clear"
                    onClick={clearSentence}
                    disabled={!hasContent}
                    aria-label="Clear sentence"
                    title="Clear all"
                >
                    ✕ Clear
                </button>

                <div style={{ flex: 1 }} />

                <button
                    className="sentence-action-btn speak"
                    onClick={handleSpeak}
                    disabled={!hasContent}
                    aria-label="Speak sentence"
                    title="Read aloud"
                >
                    🔊 Speak
                </button>
                <button
                    className="sentence-action-btn submit"
                    onClick={handleSubmit}
                    disabled={!hasContent}
                    aria-label="Submit sentence"
                    title="Submit to conversation"
                >
                    Send →
                </button>
            </div>
        </div>
    );
}
