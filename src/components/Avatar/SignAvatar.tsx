import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getSignById } from '../../engine/SignDictionary';
import { textToSignSequence } from '../../translation/TextToSign';
import type { SignAnimation } from '../../translation/TextToSign';
import './SignAvatar.css';

const HAND_EMOJIS: Record<string, string> = {
    hello: '🖐️',
    thank_you: '🙏',
    yes: '✊',
    no: '✌️',
    please: '🤲',
    sorry: '✊',
    good: '👍',
    bad: '👎',
    help: '🤝',
    stop: '✋',
    love: '🤟',
    peace: '✌️',
    one: '☝️',
    two: '✌️',
    three: '🤟',
    four: '🖐️',
    call: '🤙',
    ok: '👌',
};

export function SignAvatar() {
    const currentSignId = useAppStore((s) => s.currentSignAnimation);
    const messages = useAppStore((s) => s.messages);
    const [sequence, setSequence] = useState<SignAnimation[]>([]);

    const lastTextMessage = messages
        .filter((m) => m.source === 'text' || m.source === 'voice')
        .slice(-1)[0];

    useEffect(() => {
        if (lastTextMessage) {
            setSequence(textToSignSequence(lastTextMessage.text));
        }
    }, [lastTextMessage]);

    const currentSign = currentSignId ? getSignById(currentSignId) : null;
    const handEmoji = currentSignId ? (HAND_EMOJIS[currentSignId] || '🤚') : null;

    return (
        <div className="avatar-container">
            {!currentSignId && !lastTextMessage && (
                <div className="avatar-idle">
                    <span className="avatar-idle-icon">🧏</span>
                    <p className="avatar-idle-text">
                        Type or speak a message to see the ISL sign translation
                    </p>
                </div>
            )}

            {currentSignId && (
                <div className="avatar-signing">
                    <span className="avatar-hand" aria-hidden="true">{handEmoji}</span>
                    <div className="avatar-sign-label">
                        {currentSign?.label || currentSignId}
                    </div>
                    <p className="avatar-sign-desc">
                        {currentSign?.description || `Fingerspell: ${currentSignId.toUpperCase()}`}
                    </p>
                </div>
            )}

            {!currentSignId && lastTextMessage && (
                <div className="avatar-signing">
                    <span className="avatar-hand" aria-hidden="true">🧏</span>
                    <p className="avatar-sign-desc">Completed</p>
                </div>
            )}

            {sequence.length > 0 && (
                <div className="avatar-sequence" aria-label="Sign sequence">
                    {sequence.map((item, i) => (
                        <span
                            key={`${item.signId}-${i}`}
                            className={`avatar-seq-item ${currentSignId === item.signId ? 'active' : ''
                                } ${item.found ? 'found' : 'not-found'}`}
                        >
                            {item.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
