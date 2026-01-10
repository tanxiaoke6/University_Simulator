// Goal Tracker Modal - Progress tracking for various career paths
import { X, Target, Trophy, Briefcase, Globe, Landmark } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import type { GoalType } from '../types';

interface GoalTrackerModalProps {
    onClose: () => void;
}

export default function GoalTrackerModal({ onClose }: GoalTrackerModalProps) {
    const { student } = useGameStore();

    if (!student) return null;

    // Calculate progress for each goal (mock logic for now, using thresholds)
    // In a real game, this would be computed from attributes, GPA, and hidden milestones
    const calculateProgress = (id: GoalType): number => {
        const { attributes, academic, money } = student;

        switch (id) {
            case 'baoyan': // Academic Pro: GPA > 3.8, IQ > 80
                return Math.min(100, (academic.gpa / 4.0) * 60 + (attributes.iq / 100) * 40);
            case 'kaoyan': // Exam Warrior: IQ > 70, Knowledge > 500
                return Math.min(100, (attributes.iq / 100) * 30 + (academic.knowledgePoints / 1000) * 70);
            case 'employment': // Job Ready: EQ > 70, Charm > 60
                return Math.min(100, (attributes.eq / 100) * 50 + (attributes.charm / 100) * 50);
            case 'abroad': // Global Student: Money > 200k, GPA > 3.5
                return Math.min(100, (money / 300000) * 60 + (academic.gpa / 4.0) * 40);
            case 'inheritance': // Family Business: Wealth / Money
                return student.family.wealth === 'wealthy' ? 90 : (money / 1000000) * 100;
            default:
                return 0;
        }
    };

    const goals: { id: GoalType; name: string; icon: React.ReactNode; color: string; desc: string }[] = [
        { id: 'baoyan', name: '学术保研', icon: <Trophy />, color: 'text-primary-400', desc: '凭借卓越的GPA和科研能力获得免试入读研究生名额。' },
        { id: 'kaoyan', name: '考研奋斗', icon: <BookOpen />, color: 'text-accent-400', desc: '备战全国硕士研究生统一入学考试，目标顶尖名校。' },
        { id: 'employment', name: '名企就业', icon: <Briefcase />, color: 'text-green-400', desc: '积极参与实习，打磨简历，在校招中斩获心仪大厂Offer。' },
        { id: 'abroad', name: '出国留学', icon: <Globe />, color: 'text-purple-400', desc: '准备语言考试和申请材料，目标QS世界排名前50名校。' },
        { id: 'inheritance', name: '继承家业', icon: <Landmark />, color: 'text-orange-400', desc: '利用家庭资源创业或回归家族企业，开启接班人之路。' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div className="relative glass-card w-full max-w-2xl p-8 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center text-accent-400">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold">人生目标</h2>
                            <p className="text-dark-400 text-sm">当前的规划与未来可能性</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-dark-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6 text-dark-500" />
                    </button>
                </div>

                {/* Goals List */}
                <div className="space-y-6">
                    {goals.map((goal) => {
                        const progress = calculateProgress(goal.id);
                        return (
                            <div key={goal.id} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-dark-800 ${goal.color}`}>
                                            {goal.icon}
                                        </div>
                                        <span className="font-bold text-dark-100">{goal.name}</span>
                                    </div>
                                    <span className={`text-sm font-mono ${goal.color}`}>
                                        {progress.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden">
                                    <div
                                        className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out`}
                                        style={{
                                            width: `${progress}%`,
                                            background: `linear-gradient(90deg, transparent, currentColor)`,
                                            backgroundColor: 'currentColor',
                                            color: goal.color.replace('text-', '') === 'primary-400' ? '#60a5fa' :
                                                goal.color.replace('text-', '') === 'accent-400' ? '#FACC15' :
                                                    goal.color.replace('text-', '') === 'green-400' ? '#4ade80' :
                                                        goal.color.replace('text-', '') === 'purple-400' ? '#c084fc' : '#fb923c'
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-dark-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {goal.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="mt-10 pt-6 border-t border-dark-800/50 text-center">
                    <p className="text-dark-500 text-xs italic">
                        目标进度取决于你的 GPA、IQ、EQ、金钱以及社团活跃度等综合表现。
                    </p>
                </div>
            </div>
        </div>
    );
}

function BookOpen() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
    );
}
