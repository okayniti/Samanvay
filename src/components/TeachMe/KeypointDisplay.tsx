const FINGER_NAMES = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
const TIP_INDICES = [4, 8, 12, 16, 20];

import { useAppStore } from '../../store/useAppStore';

export function KeypointDisplay() {
    const detectedSigns = useAppStore((s) => s.detectedSigns);
    const isEmpty = detectedSigns.length === 0;

    return (
        <div>
            <div className="keypoint-grid">
                {FINGER_NAMES.map((name, i) => (
                    <div key={name} className="keypoint-item">
                        <span className="keypoint-label">{name}</span>
                        <span className="keypoint-value">
                            {isEmpty ? '—' : `tip:${TIP_INDICES[i]}`}
                        </span>
                    </div>
                ))}
                <div className="keypoint-item">
                    <span className="keypoint-label">Wrist</span>
                    <span className="keypoint-value">{isEmpty ? '—' : 'idx:0'}</span>
                </div>
            </div>
        </div>
    );
}
