import { useAppStore } from '../store/useAppStore';
import { Header } from '../components/Layout/Header';
import { SplitScreen } from '../components/Layout/SplitScreen';
import { WebcamFeed } from '../components/Camera/WebcamFeed';
import { OutputPanel } from '../components/Chat/OutputPanel';
import { TextInput } from '../components/Chat/TextInput';
import { SignAvatar } from '../components/Avatar/SignAvatar';
import { TeachMePanel } from '../components/TeachMe/TeachMePanel';
import { SentenceDisplay } from '../components/Chat/SentenceDisplay';
import './App.css';

export default function App() {
    const mode = useAppStore((s) => s.mode);
    const webcam = useAppStore((s) => s.webcam);

    const webcamStatusLabel =
        webcam.status === 'active'
            ? 'Live'
            : webcam.status === 'requesting'
                ? 'Connecting...'
                : webcam.status === 'error'
                    ? 'Error'
                    : 'Offline';

    const webcamStatusType =
        webcam.status === 'active'
            ? 'active' as const
            : webcam.status === 'error'
                ? 'error' as const
                : 'inactive' as const;

    if (mode === 'isl-to-english') {
        return (
            <div className="app">
                <Header />
                <SplitScreen
                    leftPanel={{
                        title: 'Sign Input',
                        icon: '🤟',
                        status: webcamStatusLabel,
                        statusType: webcamStatusType,
                        children: (
                            <div className="isl-panel-content">
                                <WebcamFeed />
                                <TeachMePanel />
                            </div>
                        ),
                    }}
                    rightPanel={{
                        title: 'English Output',
                        icon: '💬',
                        status: 'Ready',
                        statusType: 'active',
                        children: (
                            <div className="isl-panel-content">
                                <SentenceDisplay />
                                <OutputPanel />
                            </div>
                        ),
                    }}
                />
                <footer className="app-footer">
                    <span>Samanvay — Bridging the gap between signed and spoken language</span>
                </footer>
            </div>
        );
    }

    return (
        <div className="app">
            <Header />
            <SplitScreen
                leftPanel={{
                    title: 'English Input',
                    icon: '⌨️',
                    status: 'Ready',
                    statusType: 'active',
                    children: (
                        <div className="isl-panel-content">
                            <TextInput />
                            <OutputPanel />
                        </div>
                    ),
                }}
                rightPanel={{
                    title: 'ISL Output',
                    icon: '🤟',
                    status: 'Ready',
                    statusType: 'active',
                    children: <SignAvatar />,
                }}
            />
            <footer className="app-footer">
                <span>Samanvay — Bridging the gap between signed and spoken language</span>
            </footer>
        </div>
    );
}
