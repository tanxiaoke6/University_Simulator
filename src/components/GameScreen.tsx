// Main Game Screen Component - Iteration 3
import { useGameStore } from '../stores/gameStore';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import StoryFeed from './StoryFeed';
import ActionPanel from './ActionPanel';
import TutorialOverlay, { useTutorial } from './TutorialOverlay';
import CampusMap from './CampusMap';
import { Settings, Loader2, Target, MessageSquare, Map as MapIcon } from 'lucide-react';
import { useState } from 'react';
import GoalTrackerModal from './GoalTrackerModal';

interface GameScreenProps {
    onOpenSettings: () => void;
}

type GameTab = 'feed' | 'campus';

export default function GameScreen({ onOpenSettings }: GameScreenProps) {
    const { student, isLoading, error } = useGameStore();
    const { showTutorial, completeTutorial } = useTutorial();
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [activeTab, setActiveTab] = useState<GameTab>('feed');

    if (!student) return null;

    return (
        <div className="h-screen flex flex-col bg-dark-950 overflow-hidden font-sans">
            {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}
            {showGoalModal && <GoalTrackerModal onClose={() => setShowGoalModal(false)} />}

            {/* Top Bar */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-sm z-30 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-primary-400 font-bold tracking-tight">第{student.currentDate.year}学年</span>
                        <span className="text-dark-500">/</span>
                        <span className="text-accent-400 font-bold tracking-tight">第{student.currentDate.week}周</span>
                    </div>

                    {/* Tab Switcher */}
                    <nav className="flex bg-dark-900/50 p-1 rounded-xl border border-dark-800">
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'feed' ? 'bg-primary-600 text-white shadow-lg' : 'text-dark-500 hover:text-dark-300'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            动态
                        </button>
                        <button
                            onClick={() => setActiveTab('campus')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'campus' ? 'bg-primary-600 text-white shadow-lg' : 'text-dark-500 hover:text-dark-300'
                                }`}
                        >
                            <MapIcon className="w-4 h-4" />
                            校园地图
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowGoalModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors border border-dark-700 cursor-pointer"
                    >
                        <Target className="w-4 h-4 text-accent-400" />
                        <span className="text-xs font-medium text-dark-200">目标</span>
                    </button>
                    {isLoading && <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />}
                    <button onClick={onOpenSettings} className="p-2 rounded-lg hover:bg-dark-800 transition-colors border border-transparent hover:border-dark-700">
                        <Settings className="w-5 h-5 text-dark-400" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <aside className="w-80 h-full border-r border-dark-800/50 overflow-y-auto scrollbar-hide shrink-0 bg-dark-950">
                    <LeftSidebar student={student} />
                </aside>

                <main className="flex-1 flex flex-col min-w-0 bg-dark-900/30">
                    {error && (
                        <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-fade-in shrink-0">
                            {error}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        {activeTab === 'feed' ? (
                            <StoryFeed events={student.eventHistory.slice(-50)} />
                        ) : (
                            <CampusMap />
                        )}
                    </div>

                    <div className="p-6 border-t border-dark-800/50 bg-dark-950/80 backdrop-blur-md shrink-0">
                        <ActionPanel />
                    </div>
                </main>


                {/* Right Sidebar - Fixed width, no page scroll */}
                <aside className="w-80 h-full border-l border-dark-800/50 overflow-y-auto scrollbar-hide shrink-0 bg-dark-950">
                    <RightSidebar student={student} />
                </aside>

                {/* --- Emergency Recovery & Debug --- */}
                <div className="absolute bottom-4 left-4 z-[100] flex flex-col items-start gap-2">
                    <div className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold tracking-tighter ${isLoading ? 'bg-amber-500 text-dark-950 animate-pulse' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                        STATUS: {isLoading ? 'LOADING' : 'IDLE'}
                    </div>

                    {isLoading && (
                        <button
                            onClick={() => useGameStore.getState().forceUnlock()}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-red-500/20 border border-red-400/30 animate-bounce flex items-center gap-2 cursor-pointer"
                        >
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            强制解锁 (FIX FREEZE)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Global Tailwind Utilities (add to src/index.css if needed, or use inline)
// .scrollbar-hide::-webkit-scrollbar { display: none; }
// .scrollbar-thin::-webkit-scrollbar { width: 4px; }
