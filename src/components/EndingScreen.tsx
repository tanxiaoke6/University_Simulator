// Ending Screen Component - Game completion summary with AI Biography
import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { generateAutobiography } from '../services/aiService';
import {
    GraduationCap,
    Trophy,
    Star,
    Heart,
    Briefcase,
    RotateCcw,
    Share2,
    BookOpen,
    FastForward,
} from 'lucide-react';

export default function EndingScreen() {
    const { student, config, resetGame, setPhase } = useGameStore();

    // Phase 4: Typewriter state
    const [biography, setBiography] = useState<string>('');
    const [displayedText, setDisplayedText] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Load biography on mount
    useEffect(() => {
        if (!student) return;

        const loadBiography = async () => {
            setIsLoading(true);
            try {
                const bio = await generateAutobiography(config.llm, student);
                setBiography(bio);
                setIsTyping(true);
            } catch (error) {
                console.error('Failed to generate biography:', error);
                setBiography('四年的大学生活就这样结束了。回首往事，有欢笑也有泪水，但这一切都将成为最珍贵的回忆。');
                setIsTyping(true);
            }
            setIsLoading(false);
        };

        loadBiography();
    }, [student, config.llm]);

    // Typewriter effect
    useEffect(() => {
        if (!isTyping || !biography) return;

        if (displayedText.length < biography.length) {
            const timer = setTimeout(() => {
                setDisplayedText(biography.slice(0, displayedText.length + 1));
            }, 30); // 30ms per character
            return () => clearTimeout(timer);
        } else {
            setIsTyping(false);
        }
    }, [isTyping, displayedText, biography]);

    // Skip typewriter animation
    const handleSkip = () => {
        setDisplayedText(biography);
        setIsTyping(false);
    };

    if (!student) {
        return null;
    }

    // Calculate stats
    const { academic, money, npcs, flags, eventHistory, attributes } = student;
    const relationshipCount = npcs.filter(n => n.relationshipScore > 50).length;

    // Determine ending type
    const getEndingType = () => {
        if (academic.gpa >= 3.5 && money >= 10000) return { type: 'perfect', title: '人生赢家', color: 'from-accent-400 to-accent-500' };
        if (academic.gpa >= 3.5) return { type: 'scholar', title: '学霸毕业', color: 'from-primary-400 to-primary-500' };
        if (money >= 20000) return { type: 'rich', title: '财务自由', color: 'from-green-400 to-green-500' };
        if (flags.isDating) return { type: 'love', title: '甜蜜爱情', color: 'from-pink-400 to-pink-500' };
        if (academic.gpa >= 2.0) return { type: 'normal', title: '顺利毕业', color: 'from-blue-400 to-blue-500' };
        return { type: 'struggle', title: '艰难毕业', color: 'from-gray-400 to-gray-500' };
    };

    const ending = getEndingType();

    return (
        <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative z-10 max-w-3xl w-full">
                {/* Graduation Cap Icon */}
                <div className="text-center mb-6">
                    <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${ending.color} flex items-center justify-center shadow-2xl`}>
                        <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-display font-bold text-center mb-2">
                    <span className="text-gradient">{ending.title}</span>
                </h1>

                <p className="text-dark-400 text-center mb-6">
                    恭喜你完成了四年的大学生活！
                </p>

                {/* Stats Summary */}
                <div className="glass-card p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={<Trophy className="w-5 h-5" />}
                            label="最终GPA"
                            value={academic.gpa.toFixed(2)}
                            color="text-primary-400"
                        />
                        <StatCard
                            icon={<Star className="w-5 h-5" />}
                            label="事件数"
                            value={eventHistory.length.toString()}
                            color="text-accent-400"
                        />
                        <StatCard
                            icon={<Heart className="w-5 h-5" />}
                            label="好友数"
                            value={relationshipCount.toString()}
                            color="text-pink-400"
                        />
                        <StatCard
                            icon={<Briefcase className="w-5 h-5" />}
                            label="积蓄"
                            value={`¥${money.toLocaleString()}`}
                            color="text-green-400"
                        />
                    </div>
                </div>

                {/* Phase 4: AI Biography with Typewriter Effect */}
                <div className="glass-card p-6 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                            <h3 className="text-dark-300 font-medium">我的大学回忆录</h3>
                        </div>
                        {isTyping && (
                            <button
                                onClick={handleSkip}
                                className="flex items-center gap-1 text-dark-500 hover:text-dark-300 text-sm transition-colors"
                            >
                                <FastForward className="w-4 h-4" />
                                跳过
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-3" />
                            <p className="text-dark-500">AI正在撰写你的回忆录...</p>
                        </div>
                    ) : (
                        <div className="text-dark-300 leading-relaxed whitespace-pre-line min-h-[200px]">
                            {displayedText}
                            {isTyping && <span className="animate-pulse">|</span>}
                        </div>
                    )}
                </div>

                {/* Final Stats */}
                <div className="glass-card p-4 mb-6">
                    <h3 className="text-dark-400 text-sm mb-3">最终属性</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-blue-400">{attributes.iq}</p>
                            <p className="text-dark-500 text-xs">智力</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-pink-400">{attributes.eq}</p>
                            <p className="text-dark-500 text-xs">情商</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-400">{attributes.charm}</p>
                            <p className="text-dark-500 text-xs">魅力</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => {
                            resetGame();
                            setPhase('main_menu');
                        }}
                        className="action-btn-primary"
                    >
                        <RotateCcw className="w-5 h-5" />
                        重新开始
                    </button>

                    <button className="action-btn-secondary">
                        <Share2 className="w-5 h-5" />
                        分享结局
                    </button>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
    return (
        <div className="text-center">
            <div className={`${color} flex justify-center mb-2`}>
                {icon}
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-dark-500 text-xs">{label}</p>
        </div>
    );
}
