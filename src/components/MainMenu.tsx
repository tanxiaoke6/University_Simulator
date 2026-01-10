// Main Menu Component
import { useGameStore } from '../stores/gameStore';
import { GraduationCap, Play, Settings, Trash2 } from 'lucide-react';

interface MainMenuProps {
    onOpenSettings: () => void;
}

export default function MainMenu({ onOpenSettings }: MainMenuProps) {
    const { setPhase, student, resetGame } = useGameStore();
    const hasSave = student !== null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-2xl">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-2xl glow-primary">
                        <GraduationCap className="w-14 h-14 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
                    <span className="text-gradient">大学生活</span>
                    <span className="text-dark-200">模拟器</span>
                </h1>

                <p className="text-dark-400 text-lg mb-12 max-w-md mx-auto">
                    从高考到毕业，体验独一无二的校园人生。
                    <br />
                    <span className="text-primary-400">AI驱动</span>，每次都是全新故事。
                </p>

                {/* Menu Buttons */}
                <div className="space-y-4 max-w-xs mx-auto">
                    {hasSave ? (
                        <>
                            <button
                                onClick={() => setPhase('playing')}
                                className="action-btn-primary w-full text-lg"
                            >
                                <Play className="w-5 h-5" />
                                继续游戏
                            </button>

                            <button
                                onClick={() => setPhase('character_creation')}
                                className="action-btn-secondary w-full"
                            >
                                开始新游戏
                            </button>

                            <button
                                onClick={resetGame}
                                className="action-btn-danger w-full opacity-70 hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                                删除存档
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setPhase('character_creation')}
                            className="action-btn-primary w-full text-lg"
                        >
                            <Play className="w-5 h-5" />
                            开始游戏
                        </button>
                    )}

                    <button
                        onClick={onOpenSettings}
                        className="action-btn-secondary w-full"
                    >
                        <Settings className="w-5 h-5" />
                        设置
                    </button>
                </div>

                {/* Version */}
                <p className="mt-12 text-dark-600 text-sm">
                    Version 0.1.0 • Powered by LLM
                </p>
            </div>
        </div>
    );
}
