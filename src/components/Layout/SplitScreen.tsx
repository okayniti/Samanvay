import type { ReactNode } from 'react';
import './SplitScreen.css';

interface PanelProps {
    title: string;
    icon: string;
    status?: string;
    statusType?: 'active' | 'inactive' | 'error';
    children: ReactNode;
}

function Panel({ title, icon, status, statusType = 'inactive', children }: PanelProps) {
    return (
        <div className="split-panel glass-panel">
            <div className="panel-header">
                <div className="panel-title">
                    <span className="panel-title-icon" aria-hidden="true">{icon}</span>
                    <span>{title}</span>
                </div>
                {status && (
                    <div className="panel-status">
                        <span className={`status-dot ${statusType}`} />
                        <span>{status}</span>
                    </div>
                )}
            </div>
            <div className="panel-content">{children}</div>
        </div>
    );
}

interface SplitScreenProps {
    leftPanel: PanelProps;
    rightPanel: PanelProps;
}

export function SplitScreen({ leftPanel, rightPanel }: SplitScreenProps) {
    return (
        <main className="split-screen" role="main">
            <Panel {...leftPanel} />
            <Panel {...rightPanel} />
        </main>
    );
}
