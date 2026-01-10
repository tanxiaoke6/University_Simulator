// Ending Screen Component - Game completion summary
import { useGameStore } from '../stores/gameStore';
import {
    GraduationCap,
    Trophy,
    Star,
    Heart,
    Briefcase,
    RotateCcw,
    Share2,
} from 'lucide-react';

export default function EndingScreen() {
    const { student, resetGame, setPhase } = useGameStore();

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

    // Generate summary text
    const getSummaryText = () => {
        const texts = [];

        if (academic.gpa >= 3.5) {
            texts.push('你以优异的成绩完成了学业，老师们都对你赞不绝口。');
        } else if (academic.gpa >= 3.0) {
            texts.push('你的学业表现良好，顺利拿到了毕业证书。');
        } else if (academic.gpa >= 2.0) {
            texts.push('虽然学业上有些波折，但你最终还是完成了学业。');
        } else {
            texts.push('学业上的困难让你历尽艰辛，但你没有放弃。');
        }

        if (flags.isDating) {
            texts.push('更重要的是，你在大学里遇到了人生的另一半。');
        }

        if (money >= 10000) {
            texts.push(`毕业时你已经积攒了¥${money.toLocaleString()}的存款，为未来打下了良好的经济基础。`);
        }

        if (relationshipCount >= 5) {
            texts.push('你结交了许多朋友，人脉广阔，未来充满可能。');
        }

        return texts.join('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative z-10 max-w-2xl w-full">
                {/* Graduation Cap Icon */}
                <div className="text-center mb-8">
                    <div className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${ending.color} flex items-center justify-center shadow-2xl`}>
                        <GraduationCap className="w-12 h-12 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-4">
                    <span className="text-gradient">{ending.title}</span>
                </h1>

                <p className="text-dark-400 text-center mb-8">
                    恭喜你完成了四年的大学生活！
                </p>

                {/* Stats Summary */}
                <div className="glass-card p-6 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

                    <p className="text-dark-300 leading-relaxed">
                        {getSummaryText()}
                    </p>
                </div>

                {/* Final Stats */}
                <div className="glass-card p-4 mb-8">
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
