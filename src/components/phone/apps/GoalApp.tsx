import { useState } from 'react';
import { Target, Trophy, Briefcase, Globe, Landmark, CheckCircle2, Circle, Rocket, ChevronLeft, BookOpen } from 'lucide-react';
import { useGameStore } from '../../../stores/gameStore';
import { usePhoneStore } from '../../../stores/phoneStore';
import { INITIAL_GOALS } from '../../../stores/gameData';
import type { LifeGoal } from '../../../types';

export default function GoalApp() {
    const { student } = useGameStore();
    const { closeApp } = usePhoneStore();
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

    if (!student) return null;

    const selectedGoal = INITIAL_GOALS.find(g => g.id === selectedGoalId);

    const calculateGoalProgress = (goal: LifeGoal): number => {
        if (!goal.requirements || goal.requirements.length === 0) return 100;

        let totalMet = 0;
        goal.requirements.forEach(req => {
            if (isRequirementMet(req)) totalMet++;
        });

        return Math.round((totalMet / goal.requirements.length) * 100);
    };

    const isRequirementMet = (req: any) => {
        if (req.type === 'attribute') {
            const current = (student.attributes as any)[req.target] || (student.academic as any)[req.target] || 0;
            return current >= req.value;
        } else if (req.type === 'cet6') {
            return student.academic.cet6Score >= req.value;
        } else if (req.type === 'honors') {
            return (student.academic.honors || []).length >= req.value;
        } else if (req.type === 'research') {
            return student.academic.researchPoints >= req.value;
        } else if (req.type === 'wealth') {
            const wealthMap: Record<string, number> = { poor: 1, middle: 2, wealthy: 3 };
            return wealthMap[student.family.wealth] >= req.value;
        } else if (req.target === 'money') {
            return student.money >= req.value;
        }
        return false;
    };

    const getRequirementLabel = (req: any) => {
        const labels: Record<string, string> = {
            gpa: 'GPA',
            iq: '智力',
            eq: '情商',
            knowledge: '知识储备',
            knowledgePoints: '知识储备',
            cet6Score: '英语六级',
            honorsCount: '竞赛奖项',
            researchPoints: '科研成果',
            wealth: '家庭背景',
            money: '存款',
            employability: '就业力'
        };
        return labels[req.target] || req.target;
    };

    const GoalIcon = ({ id, className }: { id: string, className?: string }) => {
        switch (id) {
            case 'baoyan': return <Trophy className={className} />;
            case 'kaoyan': return <BookOpen className={className} />;
            case 'employment': return <Briefcase className={className} />;
            case 'abroad': return <Globe className={className} />;
            case 'inheritance': return <Landmark className={className} />;
            case 'startup': return <Rocket className={className} />;
            default: return <Target className={className} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-dark-950 text-white animate-fade-in pb-12">
            {/* Header */}
            <header className="p-4 border-b border-dark-800 flex items-center gap-3 bg-dark-900/50 sticky top-0 z-10 backdrop-blur-md">
                <button
                    onClick={selectedGoalId ? () => setSelectedGoalId(null) : closeApp}
                    className="p-1 -ml-1 hover:bg-dark-800 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-dark-400" />
                </button>
                <h2 className="font-bold text-sm">{selectedGoalId ? '目标详情' : '人生目标'}</h2>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {!selectedGoalId ? (
                    <div className="p-4 space-y-3">
                        {INITIAL_GOALS.map(goal => {
                            const progress = calculateGoalProgress(goal);
                            return (
                                <button
                                    key={goal.id}
                                    onClick={() => setSelectedGoalId(goal.id)}
                                    className="w-full bg-dark-900/40 border border-dark-800 rounded-2xl p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all active:scale-[0.98]"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center text-primary-400">
                                        <GoalIcon id={goal.id} className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-bold text-sm text-white">{goal.name}</h3>
                                        <div className="mt-2 h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-500 transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-mono text-primary-400 font-bold">{progress}%</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-4 space-y-6 animate-fade-in">
                        <div className="bg-dark-900/40 border border-dark-800 rounded-2xl p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-dark-800 text-primary-400">
                                    <GoalIcon id={selectedGoal!.id} className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">{selectedGoal!.name}</h3>
                                    <p className="text-xs text-dark-400 mt-1 leading-relaxed">{selectedGoal!.description}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mt-6">
                                <h4 className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-1">达成要求</h4>
                                {selectedGoal!.requirements.map((req, idx) => {
                                    const met = isRequirementMet(req);
                                    const current = req.target === 'money' ? student.money :
                                        ((student.attributes as any)[req.target] || (student.academic as any)[req.target] ||
                                            (req.type === 'honors' ? (student.academic.honors || []).length :
                                                req.type === 'research' ? student.academic.researchPoints : 0));

                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${met ? 'bg-green-500/5 border-green-500/20' : 'bg-dark-800/40 border-dark-800'}`}>
                                            <div className="flex items-center gap-3">
                                                {met ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Circle className="w-4 h-4 text-dark-600" />}
                                                <div>
                                                    <p className={`text-xs font-bold ${met ? 'text-green-100' : 'text-dark-200'}`}>
                                                        {getRequirementLabel(req)}
                                                    </p>
                                                    <p className="text-[10px] text-dark-500">
                                                        目标: {req.value}{req.type === 'attribute' && req.target === 'gpa' ? '' : '+'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xs font-mono font-bold ${met ? 'text-green-400' : 'text-dark-400'}`}>
                                                    {req.type === 'wealth' ? (student.family.wealth === 'wealthy' ? '富裕' : student.family.wealth === 'middle' ? '中产' : '贫困') :
                                                        (typeof current === 'number' && !Number.isInteger(current) ? current.toFixed(2) : current)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-primary-500/5 border border-primary-500/10">
                            <h4 className="text-xs font-bold text-primary-400 mb-2">职业规划建议</h4>
                            <p className="text-xs text-dark-300 leading-relaxed italic">
                                "{selectedGoal!.requirements.some(r => !isRequirementMet(r))
                                    ? `建议优先提升：${selectedGoal!.requirements.filter(r => !isRequirementMet(r)).map(r => getRequirementLabel(r)).join('、')}。`
                                    : '你已经满足了该目标的所有基础要求，继续保持现状，等待毕业结算。'}"
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
