import { useAppStore } from '../../store/useAppStore';
import { ConfidenceScore } from './ConfidenceScore';
import { KeypointDisplay } from './KeypointDisplay';
import './TeachMe.css';

export function TeachMePanel() {
    const teachMe = useAppStore((s) => s.teachMe);
    const setTeachMeSetting = useAppStore((s) => s.setTeachMeSetting);
    const detectedSigns = useAppStore((s) => s.detectedSigns);

    if (!teachMe.enabled) return null;

    const lastSign = detectedSigns[detectedSigns.length - 1];

    return (
        <div className="teach-me-panel" role="region" aria-label="Teach Me Mode">
            <div className="teach-me-header">
                <div className="teach-me-title">
                    <span>🎓</span>
                    <span>Teach Me Mode</span>
                </div>
                <div className="teach-me-controls">
                    <button
                        className={`teach-me-ctrl-btn ${teachMe.showKeypoints ? 'active' : ''}`}
                        onClick={() => setTeachMeSetting('showKeypoints', !teachMe.showKeypoints)}
                        aria-label="Toggle keypoint display"
                    >
                        Keypoints
                    </button>
                    <button
                        className={`teach-me-ctrl-btn ${teachMe.showConfidence ? 'active' : ''}`}
                        onClick={() => setTeachMeSetting('showConfidence', !teachMe.showConfidence)}
                        aria-label="Toggle confidence display"
                    >
                        Confidence
                    </button>
                    <button
                        className={`teach-me-ctrl-btn ${teachMe.slowMotion ? 'active' : ''}`}
                        onClick={() => setTeachMeSetting('slowMotion', !teachMe.slowMotion)}
                        aria-label="Toggle slow motion"
                    >
                        Slow-Mo
                    </button>
                </div>
            </div>

            {teachMe.showConfidence && lastSign && (
                <ConfidenceScore sign={lastSign.label} confidence={lastSign.confidence} />
            )}

            {teachMe.showKeypoints && <KeypointDisplay />}
        </div>
    );
}
