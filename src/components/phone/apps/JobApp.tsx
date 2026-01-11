import { useGameStore } from '../../../stores/gameStore';
import { usePhoneStore } from '../../../stores/phoneStore';
import { JOBS } from '../../../data/jobs';
import {
    ChevronLeft,
    Briefcase,
    TrendingUp,
    Clock,
    Lock,
    Brain,
    CircleSlash,
    Zap
} from 'lucide-react';
import type { Job } from '../../../types';

export default function JobApp() {
    const { student, applyEffects, addNotification, updateStudent } = useGameStore();
    const { closeApp } = usePhoneStore();

    if (!student) return null;

    const handleWork = (job: Job) => {
        if (student.actionPoints <= 0) {
            addNotification('已经没有体力继续打工了，先去休息吧。', 'error');
            return;
        }

        applyEffects([
            { type: 'money', target: 'money', value: job.salary },
            { type: 'attribute', target: 'stamina', value: -job.energyCost }
        ]);

        updateStudent({
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
        <div className="flex flex-col h-full bg-dark-950 text-white animate-fade-in pb-12">
            {/* Header */}
            <header className="p-4 border-b border-dark-800 flex items-center gap-3 bg-dark-900/50 sticky top-0 z-10 backdrop-blur-md">
                <button onClick={closeApp} className="p-1 -ml-1 hover:bg-dark-800 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-dark-400" />
                </button>
                <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-500" />
                    <h2 className="font-bold text-sm">校园兼职</h2>
                </div>
            </header>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {JOBS.map((job) => {
                    const met = isRequirementsMet(job);
                    return (
                        <div
                            key={job.id}
                            className={`p-3 bg-dark-900/50 border border-dark-800 rounded-xl flex items-center justify-between gap-3 ${!met ? 'opacity-50 grayscale shadow-none' : 'shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${met ? 'bg-green-500/10 text-green-400' : 'bg-dark-800 text-dark-500'
                                    }`}>
                                    {met ? <TrendingUp className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[13px] font-bold truncate">{job.title}</h3>
                                    <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap overflow-hidden">
                                        <div className="flex items-center gap-0.5 text-[9px] text-dark-400">
                                            <Zap className="w-3 h-3 text-amber-500" />
                                            <span>-{job.energyCost}</span>
                                        </div>
                                        <span className="text-[9px] text-green-400 font-bold">¥{job.salary}/次</span>
                                    </div>
                                </div>
                            </div>

                            {met ? (
                                <button
                                    onClick={() => handleWork(job)}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 shrink-0"
                                >
                                    开工
                                </button>
                            ) : (
                                <CircleSlash className="w-4 h-4 text-dark-600 shrink-0 mx-2" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Status */}
            <div className="p-3 border-t border-dark-800 bg-dark-900/80 backdrop-blur-md flex items-center justify-between text-[10px] text-dark-400">
                <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>当前体力: <span className="text-white font-bold">{student.attributes.stamina}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>行动力: <span className="text-primary-400 font-bold">{student.actionPoints}</span></span>
                </div>
            </div>
        </div>
    );
}
