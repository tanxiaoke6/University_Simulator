// Goal Tracker Modal - Progress tracking for various career paths
import { useState } from 'react';
import { X, Target, Trophy, Briefcase, Globe, Landmark, ChevronRight, CheckCircle2, Circle, Rocket } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { INITIAL_GOALS } from '../stores/gameData';
import type { LifeGoal } from '../types';

interface GoalTrackerModalProps {
    onClose: () => void;
}

export default function GoalTrackerModal({ onClose }: GoalTrackerModalProps) {
    const { student } = useGameStore();
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(INITIAL_GOALS[0]?.id || null);

    if (!student) return null;

    const selectedGoal = INITIAL_GOALS.find(g => g.id === selectedGoalId);

    const calculateGoalProgress = (goal: LifeGoal): number => {
        if (!goal.requirements || goal.requirements.length === 0) return 100;

        let totalMet = 0;
        goal.requirements.forEach(req => {
            if (req.type === 'attribute') {
                const current = (student.attributes as any)[req.target] || (student.academic as any)[req.target] || 0;
                if (current >= req.value) totalMet++;
            } else if (req.type === 'cet6') {
                if (student.academic.cet6Score >= req.value) totalMet++;
            } else if (req.type === 'honors') {
                if (student.academic.honors.length >= req.value) totalMet++;
            } else if (req.type === 'research') {
                if (student.academic.researchPoints >= req.value) totalMet++;
            } else if (req.type === 'wealth') {
                const wealthMap: Record<string, number> = { poor: 1, middle: 2, wealthy: 3 };
                if (wealthMap[student.family.wealth] >= req.value) totalMet++;
            } else if (req.target === 'money') {
                if (student.money >= req.value) totalMet++;
            }
        });

        return (totalMet / goal.requirements.length) * 100;
    };

    const isRequirementMet = (req: any) => {
        if (req.type === 'attribute') {
            const current = (student.attributes as any)[req.target] || (student.academic as any)[req.target] || 0;
            return current >= req.value;
        } else if (req.type === 'cet6') {
            return student.academic.cet6Score >= req.value;
        } else if (req.type === 'honors') {
            return student.academic.honors.length >= req.value;
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
            cet6Score: '英语六级',
            honorsCount: '竞赛奖项',
            researchPoints: '科研成果',
            wealth: '家庭背景',
            money: '存款',
            employability: '就业力'
        };
        return labels[req.target] || req.target;
    };

    const getGoalIconAndColor = (goalId: string) => {
        let icon = <Trophy />;
        let color = 'text-primary-400';
        if (goalId === 'kaoyan') { icon = <BookOpen />; color = 'text-accent-400'; }
        if (goalId === 'employment') { icon = <Briefcase />; color = 'text-green-400'; }
        if (goalId === 'abroad') { icon = <Globe />; color = 'text-purple-400'; }
        if (goalId === 'inheritance') { icon = <Landmark />; color = 'text-orange-400'; }
        if (goalId === 'startup') { icon = <Rocket />; color = 'text-blue-400'; }
        return { icon, color };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md animate-fade-in" onClick={onClose} />

            <div className="relative glass-card w-full max-w-4xl max-h-[85vh] flex overflow-hidden animate-scale-in">
                {/* Sidebar - Goal List */}
                <div className="w-1/3 border-r border-dark-800 bg-dark-900/40 p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-8">
                        <Target className="w-6 h-6 text-accent-500" />
                        <h2 className="text-xl font-display font-bold text-white">人生目标</h2>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {INITIAL_GOALS.map(goal => {
                            const progress = calculateGoalProgress(goal);
                            const isSelected = selectedGoalId === goal.id;
                            const { icon, color } = getGoalIconAndColor(goal.id);
                            return (
                                <button
                                    key={goal.id}
                                    onClick={() => setSelectedGoalId(goal.id)}
                                    className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between group ${isSelected
                                        ? 'bg-dark-800 border-accent-500/50 shadow-lg shadow-accent-950/20'
                                        : 'bg-dark-800/40 border-dark-700 hover:border-dark-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-accent-500/20 ' + color : 'bg-dark-700 text-dark-400'}`}>
                                            {icon}
                                        </div>
                                        <div>
                                            <p className={`font-bold transition-colors ${isSelected ? 'text-white' : 'text-dark-300'}`}>{goal.name}</p>
                                            <div className="w-24 h-1 bg-dark-700 rounded-full mt-1.5 overflow-hidden">
                                                <div
                                                    className="h-full bg-accent-500 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-accent-400 translate-x-1' : 'text-dark-600'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content - Detailed Requirements */}
                <div className="flex-1 p-8 flex flex-col h-full bg-dark-950/20 overflow-y-auto">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-dark-800">
                        {selectedGoal ? (
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl bg-dark-800 border border-dark-700`}>
                                    {getGoalIconAndColor(selectedGoal.id).icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-display font-bold text-white mb-1">{selectedGoal.name}</h3>
                                    <p className="text-dark-400 text-sm">{selectedGoal.description}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-dark-500 italic">请选择一个目标以查看详情</div>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-lg text-dark-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {selectedGoal && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h4 className="text-sm font-bold text-dark-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-accent-500 rounded-full" />
                                    达成要求
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedGoal.requirements.map((req, idx) => {
                                        const met = isRequirementMet(req);
                                        const current = req.target === 'money' ? student.money :
                                            ((student.attributes as any)[req.target] || (student.academic as any)[req.target] ||
                                                (req.type === 'honors' ? student.academic.honors.length :
                                                    req.type === 'research' ? student.academic.researchPoints : 0));

                                        return (
                                            <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${met ? 'bg-green-500/5 border-green-500/20' : 'bg-dark-800/40 border-dark-700'}`}>
                                                <div className="flex items-center gap-4">
                                                    {met ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5 text-dark-600" />}
                                                    <div>
                                                        <p className={`font-bold ${met ? 'text-green-100' : 'text-dark-200'}`}>
                                                            {getRequirementLabel(req)}
                                                        </p>
                                                        <p className="text-xs text-dark-500 mt-0.5">
                                                            目标: {req.value}{req.type === 'attribute' && req.target === 'gpa' ? '' : '+'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-mono font-bold ${met ? 'text-green-400' : 'text-dark-400'}`}>
                                                        {req.type === 'wealth' ? (student.family.wealth === 'wealthy' ? '富裕' : student.family.wealth === 'middle' ? '中产' : '贫困') : current}
                                                    </p>
                                                    <p className="text-[10px] text-dark-600 uppercase tracking-tighter">当前值</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-accent-500/5 border border-accent-500/10">
                                <h4 className="text-sm font-bold text-accent-400 mb-2">规划师建议</h4>
                                <p className="text-xs text-dark-300 leading-relaxed">
                                    实现「{selectedGoal.name}」需要持续的精力和长期的投入。建议你在本周合理分配行动力，优先补齐
                                    {selectedGoal.requirements.filter(r => !isRequirementMet(r)).map(r => `【${getRequirementLabel(r)}】`).join('、') || '所有关键指标'}。
                                </p>
                            </div>
                        </div>
                    )}
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
