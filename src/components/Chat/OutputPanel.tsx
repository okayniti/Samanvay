import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { speak } from '../../speech/TextToSpeech';
import { getEmotionEmoji } from '../../emotion/EmotionDetector';
import './OutputPanel.css';

export function OutputPanel() {
    const messages = useAppStore((s) => s.messages);
    const clearMessages = useAppStore((s) => s.clearMessages);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="output-panel">
                <div className="output-empty">
                    <span className="output-empty-icon">💬</span>
                    <p className="output-empty-text">
                        Recognized signs will appear here. Start the camera and begin signing to see translations.
                    </p>
                </div>
            </div>
        );
    }

    const sourceIcon = (source: string) => {
        switch (source) {
            case 'sign': return '🤟';
            case 'voice': return '🎙';
            case 'text': return '⌨️';
            default: return '💬';
        }
    };

    return (
        <div className="output-panel">
            <div className="message-list" ref={listRef} role="log" aria-label="Conversation messages">
                {messages.map((msg) => (
                    <div key={msg.id} className="message-item">
                        <span className="message-source" aria-hidden="true">{sourceIcon(msg.source)}</span>
                        <div className="message-body">
                            <p className="message-text">{msg.text}</p>
                            <div className="message-meta">
                                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                {msg.emotion && (
                                    <span className="message-emotion">
                                        {getEmotionEmoji(msg.emotion)} {msg.emotion}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="message-actions">
                            <button
                                className="speak-btn"
                                onClick={() => speak(msg.text)}
                                aria-label={`Speak: ${msg.text}`}
                                title="Speak aloud"
                            >
                                🔊
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="output-actions">
                <button
                    className="clear-btn"
                    onClick={clearMessages}
                    aria-label="Clear all messages"
                >
                    Clear All
                </button>
            </div>
        </div>
    );
}
