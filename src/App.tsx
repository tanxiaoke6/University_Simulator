// University Life Simulator - Main App
import { useGameStore } from './stores/gameStore';
import MainMenu from './components/MainMenu';
import CharacterCreation from './components/CharacterCreation';
import GameScreen from './components/GameScreen';
import EventModal from './components/EventModal';
import EndingScreen from './components/EndingScreen';
import SettingsModal from './components/SettingsModal';
import NotificationOverlay from './components/NotificationOverlay';
import { useState, useEffect } from 'react';

function App() {
    const { phase, loadConfigFromFile } = useGameStore();
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        loadConfigFromFile();
    }, [loadConfigFromFile]);

    return (
        <div className="min-h-screen bg-dark-950 text-dark-100">
            {/* Main Content */}
            {phase === 'main_menu' && (
                <MainMenu onOpenSettings={() => setShowSettings(true)} />
            )}

            {(phase === 'character_creation' || phase === 'gaokao' || phase === 'university_selection') && (
                <CharacterCreation />
            )}

            {phase === 'playing' && (
                <GameScreen onOpenSettings={() => setShowSettings(true)} />
            )}

            {phase === 'event' && <EventModal />}

            {phase === 'ending' && <EndingScreen />}

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}

            <NotificationOverlay />
        </div>
    );
}

export default App;
