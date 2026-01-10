import { useGameStore } from '../stores/gameStore';
import {
    Target,
    Award,
    Briefcase,
    CheckCircle2,
    Clock,
    Lock,
} from 'lucide-react';

export default function AcademicPlanner() {
    const { student, quitJob } = useGameStore();

    if (!student) return null;

    const goals = student.goals || [];
    const activeBuffs = student.activeBuffs || [];

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in p-2">
            {/* Goals Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Target className="w-4 h-4 text-accent-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400">人生愿景 (Life Goals)</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {goals.map((goal) => (
                        <div key={goal.id} className="glass-card-light p-4 border-dark-700/50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-sm font-bold text-white">{goal.name}</h4>
                                    <p className="text-[10px] text-dark-500 mt-0.5">{goal.description}</p>
                                </div>
                                <span className="text-xs font-mono font-bold text-accent-400">{goal.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-all duration-1000"
                                    style={{ width: `${goal.progress}%` }}
                                />
                            </div>
                            <div className="mt-2 flex items-center gap-4">
                                {goal.requirements.map((req, ridx) => (
                                    <div key={ridx} className="flex items-center gap-1.5">
                                        <CheckCircle2 className={`w-3 h-3 ${student.attributes.iq >= req.value ? 'text-green-500' : 'text-dark-600'}`} />
                                        <span className="text-[9px] text-dark-400">IQ {req.value}+</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Certificates / Buffs */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Award className="w-4 h-4 text-primary-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400">荣誉与证件 (Certificates)</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${activeBuffs.includes('cet4') ? 'bg-primary-500/10 border-primary-500/30' : 'bg-dark-800/40 border-dark-700 opacity-60'}`}>
                        <div className="flex justify-between items-center">
                            <Lock className="w-4 h-4 text-dark-500" />
                            <span className="text-[10px] font-bold text-dark-400">已考取</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-white">英语四级 (CET-4)</h4>
                        <p className="text-[9px] text-dark-500">提升未来求职竞争力。</p>
                    </div>
                    <div className="p-3 rounded-xl border border-dark-700 bg-dark-800/40 opacity-60 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-dark-500 text-[10px] font-bold">
                            <span>未解锁</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-dark-300">驾照 (Driver's License)</h4>
                        <p className="text-[9px] text-dark-600">解锁更多兼职岗位。</p>
                    </div>
                </div>
            </div>

            {/* Jobs Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Briefcase className="w-4 h-4 text-green-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400">兼职管理 (Part-Time Job)</h3>
                </div>
                <div className="glass-card p-4 border-green-500/20">
                    {student.flags.hasJob ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">正在进行的兼职</h4>
                                    <p className="text-xs text-dark-500 mt-1">周薪: ¥300 | 消耗: 体力 ++</p>
                                </div>
                            </div>
                            <button
                                onClick={() => quitJob()}
                                className="w-full py-2 bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-600/30 transition-all"
                            >
                                辞职
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4 space-y-3">
                            <p className="text-xs text-dark-500">目前没有任何兼职工作。</p>
                            <p className="text-[10px] text-dark-600">前往 [图书馆] 或 [超市] 寻找机会吧！</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
