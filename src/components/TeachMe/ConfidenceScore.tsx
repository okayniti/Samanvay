interface ConfidenceScoreProps {
    sign: string;
    confidence: number;
}

export function ConfidenceScore({ sign, confidence }: ConfidenceScoreProps) {
    const percent = Math.round(confidence * 100);
    const level = percent >= 70 ? 'high' : percent >= 50 ? 'medium' : 'low';

    return (
        <div className="confidence-container" aria-label={`Confidence for ${sign}: ${percent}%`}>
            <div className="confidence-label">
                <span>Confidence: <strong>{sign}</strong></span>
                <span className={`confidence-value ${level}`}>{percent}%</span>
            </div>
            <div className="confidence-bar-track">
                <div
                    className={`confidence-bar-fill ${level}`}
                    style={{ width: `${percent}%` }}
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
}
