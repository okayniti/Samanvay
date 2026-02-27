import { useAppStore } from '../../store/useAppStore';
import { ModeSelector } from './ModeSelector';
import './Header.css';

export function Header() {
    const fps = useAppStore((s) => s.fps);
    const teachMe = useAppStore((s) => s.teachMe);
    const toggleTeachMe = useAppStore((s) => s.toggleTeachMe);

    const fpsClass = fps >= 25 ? 'good' : fps >= 15 ? 'ok' : 'bad';

    return (
        <header className="header" role="banner">
            <div className="header-brand">
                <span className="header-logo" aria-hidden="true">🤝</span>
                <div>
                    <h1 className="header-title">Samanvay</h1>
                    <p className="header-tagline">Two-Way Indian Sign Language Interpreter</p>
                </div>
            </div>

            <div className="header-controls">
                <ModeSelector />

                <button
                    className={`teach-me-toggle ${teachMe.enabled ? 'active' : ''}`}
                    onClick={toggleTeachMe}
                    aria-label="Toggle Teach Me Mode"
                    aria-pressed={teachMe.enabled}
                    title="Teach Me Mode"
                >
                    <span className="teach-me-icon">🎓</span>
                    <span className="teach-me-label">Teach Me</span>
                </button>

                {fps > 0 && (
                    <span className={`header-fps ${fpsClass}`} aria-label={`${fps} frames per second`}>
                        {fps} FPS
                    </span>
                )}
            </div>
        </header>
    );
}
