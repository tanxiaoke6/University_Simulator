import { useGameStore } from '../stores/gameStore';
import { JOBS } from '../data/jobs';
import {
    X,
    Briefcase,
    TrendingUp,
    Clock,
    Lock,
    Brain,
    CircleSlash
} from 'lucide-react';
import type { Job } from '../types';

interface JobBoardModalProps {
    onClose: () => void;
}

export default function JobBoardModal({ onClose }: JobBoardModalProps) {
    const { student, applyEffects, addNotification } = useGameStore();

    if (!student) return null;

    const handleWork = (job: Job) => {
        // Simple validation: Can only work if you have AP (managed by store)
        if (student.actionPoints <= 0) {
            addNotification('已经没有体力继续打工了，先去休息吧。', 'error');
            return;
        }

        // Apply effects (Money gain and Stamina loss) - this already creates an aggregated notification
        applyEffects([
            { type: 'money', target: 'money', value: job.salary },
            { type: 'attribute', target: 'stamina', value: -job.energyCost }
        ]);

        // Consume AP via student update
        useGameStore.getState().updateStudent({
            actionPoints: student.actionPoints - 1
        });
    };

    const isRequirementsMet = (job: Job) => {
        return job.requirements.every(req => {
            if (req.type === 'attribute') {
                const attrVal = (student.attributes as any)[req.target];
                return attrVal >= req.value;
            }
            return true;
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-dark-950/60 animate-fade-in overflow-y-auto">
            <div className="max-w-3xl w-full glass-card h-auto max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden border-green-500/30 my-auto animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-dark-800 flex items-center justify-between bg-dark-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white tracking-tight">兼职告示板</h2>
                            <p className="text-xs text-dark-400">自力更生，丰衣足食。</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-dark-400" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-4">
                    {JOBS.map((job) => {
                        const met = isRequirementsMet(job);
                        return (
                            <div
                                key={job.id}
                                className={`group relative glass-card-light p-5 border-dark-700 flex items-center justify-between transition-all ${met ? 'hover:bg-dark-800/40 hover:border-green-500/30' : 'opacity-60 saturate-50'
                                    }`}
                            >
                                <div className="flex gap-4 items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${met ? 'bg-green-500/10 text-green-400' : 'bg-dark-800 text-dark-500'}`}>
                                        {met ? <TrendingUp className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-dark-100 group-hover:text-white">{job.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1 text-[10px] text-dark-400">
                                                <Clock className="w-3 h-3" />
                                                <span>消耗 {job.energyCost} 体力</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-dark-400">
                                                <Brain className="w-3 h-3" />
                                                <span>要求: {job.requirements.map(r => `${r.target}${r.value}`).join(', ') || '无'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="text-lg font-mono font-bold text-green-400">¥{job.salary}</span>
                                        <p className="text-[10px] text-dark-500">报酬/次</p>
                                    </div>

                                    {met ? (
                                        <button
                                            onClick={() => handleWork(job)}
                                            className="action-btn-primary bg-green-600 hover:bg-green-500 py-2 px-6"
                                        >
                                            开工
                                        </button>
                                    ) : (
                                        <div className="px-4 py-2 bg-dark-800 rounded-lg text-xs text-dark-500 font-bold flex items-center gap-2">
                                            <CircleSlash className="w-4 h-4" />
                                            条件不足
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Stats Summary */}
                <div className="p-4 border-t border-dark-800 bg-dark-950/80 backdrop-blur-md flex items-center justify-end gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">当前体力</span>
                        <span className="text-sm font-bold text-red-400">{student.attributes.stamina}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">剩余行动力</span>
                        <div className="flex gap-1">
                            {Array.from({ length: student.maxActionPoints }).map((_, i) => (
                                <div key={i} className={`w-4 h-1 rounded-full ${i < student.actionPoints ? 'bg-primary-500' : 'bg-dark-800'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
