import { useAppStore } from '../../store/useAppStore';
import type { AppMode } from '../../types';
import './ModeSelector.css';

export function ModeSelector() {
    const mode = useAppStore((s) => s.mode);
    const setMode = useAppStore((s) => s.setMode);

    const modes: { key: AppMode; label: string; icon: string }[] = [
        { key: 'isl-to-english', label: 'ISL → EN', icon: '🤟' },
        { key: 'english-to-isl', label: 'EN → ISL', icon: '💬' },
    ];

    return (
        <div className="mode-selector" role="tablist" aria-label="Communication mode">
            {modes.map(({ key, label, icon }) => (
                <button
                    key={key}
                    className={`mode-btn ${mode === key ? 'active' : ''}`}
                    onClick={() => setMode(key)}
                    role="tab"
                    aria-selected={mode === key}
                    aria-label={`Switch to ${label} mode`}
                >
                    <span aria-hidden="true">{icon}</span>
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}
