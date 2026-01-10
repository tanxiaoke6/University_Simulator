// Left Sidebar - Character Profile & Stats
import type { StudentState } from '../types';
import {
    User,
    Brain,
    Heart,
    Zap,
    AlertTriangle,
    Sparkles,
    Wallet,
    GraduationCap,
    Star,
} from 'lucide-react';

interface LeftSidebarProps {
    student: StudentState;
}

export default function LeftSidebar({ student }: LeftSidebarProps) {
    const { attributes, academic, money, name, gender } = student;

    return (
        <aside className="sidebar animate-slide-in-left">
            {/* Avatar & Name */}
            <div className="glass-card-light p-4 text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-display font-bold text-lg">{name}</h2>
                <p className="text-dark-400 text-sm">{academic.universityName}</p>
                <p className="text-dark-500 text-xs mt-1">{academic.major.name}</p>
            </div>

            {/* Money */}
            <div className="glass-card-light p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-accent-400" />
                        <span className="text-dark-300">余额</span>
                    </div>
                    <span className={`font-bold ${money < 500 ? 'text-red-400' : 'text-accent-400'}`}>
                        ¥{money.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* GPA */}
            <div className="glass-card-light p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary-400" />
                        <span className="text-dark-300">GPA</span>
                    </div>
                    <span className="font-bold text-primary-400">{academic.gpa.toFixed(2)}</span>
                </div>
                <div className="stat-bar">
                    <div
                        className="stat-bar-fill bg-gradient-to-r from-primary-600 to-primary-400"
                        style={{ width: `${(academic.gpa / 4) * 100}%` }}
                    />
                </div>
            </div>

            {/* Attributes */}
            <div className="glass-card-light p-4 space-y-4">
                <h3 className="text-dark-300 text-sm font-medium mb-3">属性</h3>

                <StatBar
                    icon={<Brain className="w-4 h-4" />}
                    label="智力"
                    value={attributes.iq}
                    color="from-blue-500 to-blue-400"
                />

                <StatBar
                    icon={<Heart className="w-4 h-4" />}
                    label="情商"
                    value={attributes.eq}
                    color="from-pink-500 to-pink-400"
                />

                <StatBar
                    icon={<Zap className="w-4 h-4" />}
                    label="体力"
                    value={attributes.stamina}
                    color="from-green-500 to-green-400"
                />

                <StatBar
                    icon={<AlertTriangle className="w-4 h-4" />}
                    label="压力"
                    value={attributes.stress}
                    color="from-red-500 to-red-400"
                    invert
                />

                <StatBar
                    icon={<Sparkles className="w-4 h-4" />}
                    label="魅力"
                    value={attributes.charm}
                    color="from-purple-500 to-purple-400"
                />

                <StatBar
                    icon={<Star className="w-4 h-4" />}
                    label="运气"
                    value={attributes.luck}
                    color="from-accent-500 to-accent-400"
                />
            </div>

            {/* Status Tags */}
            <div className="flex flex-wrap gap-2 mt-auto">
                {student.flags.isDating && (
                    <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs">
                        💕 恋爱中
                    </span>
                )}
                {student.flags.hasJob && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        💼 有兼职
                    </span>
                )}
                {student.flags.hasScholarship && (
                    <span className="px-2 py-1 bg-accent-500/20 text-accent-400 rounded-full text-xs">
                        🏆 奖学金
                    </span>
                )}
                {student.flags.isOnProbation && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                        ⚠️ 学业预警
                    </span>
                )}
            </div>
        </aside>
    );
}

// Stat Bar Component
interface StatBarProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    invert?: boolean;
}

function StatBar({ icon, label, value, color, invert }: StatBarProps) {
    const displayValue = Math.min(100, Math.max(0, value));
    const isWarning = invert ? value > 70 : value < 30;

    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-1">
                <div className={`flex items-center gap-2 ${isWarning ? 'text-red-400' : 'text-dark-400'}`}>
                    {icon}
                    <span>{label}</span>
                </div>
                <span className={isWarning ? 'text-red-400' : 'text-dark-300'}>{displayValue}</span>
            </div>
            <div className="stat-bar">
                <div
                    className={`stat-bar-fill bg-gradient-to-r ${color}`}
                    style={{ width: `${displayValue}%` }}
                />
            </div>
        </div>
    );
}
