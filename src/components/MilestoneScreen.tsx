import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Trophy, AlertTriangle, ChevronRight, Sparkles, X } from 'lucide-react';

interface MilestoneResult {
    passed: boolean;
    message: string;
}

export default function MilestoneScreen() {
    const { student, checkFateNode, addNotification } = useGameStore();
    const [result, setResult] = useState<MilestoneResult | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasChecked, setHasChecked] = useState<number | null>(null);

    const currentWeek = student?.currentDate.week || 0;

    const doCheck = useCallback(() => {
        const fateResult = checkFateNode();
        if (fateResult) {
            setResult(fateResult);
            setIsVisible(true);
            setHasChecked(currentWeek);
            if (!fateResult.passed) {
                addNotification(fateResult.message, 'error');
            }
        }
    }, [checkFateNode, currentWeek, addNotification]);

    useEffect(() => {
        // Only check once per milestone week
        if ([20, 40, 60].includes(currentWeek) && hasChecked !== currentWeek) {
            doCheck();
        }
    }, [currentWeek, hasChecked, doCheck]);

    if (!isVisible || !result) return null;

    const milestoneLabels: Record<number, string> = {
        20: '大一学年结束',
        40: '大二学年结束',
        60: '大三学年结束',
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="relative w-full max-w-md mx-4 bg-dark-900 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-dark-700 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-dark-400" />
                </button>

                {/* Header */}
                <div className={`p-6 text-center ${result.passed ? 'bg-gradient-to-br from-green-600/20 to-emerald-700/20' : 'bg-gradient-to-br from-red-600/20 to-rose-700/20'}`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${result.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {result.passed ? (
                            <Trophy className="w-10 h-10" />
                        ) : (
                            <AlertTriangle className="w-10 h-10" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {milestoneLabels[currentWeek] || '学期考核'}
                    </h2>
                    <p className={`text-sm ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {result.passed ? '✓ 考核通过' : '✗ 考核未通过'}
                    </p>
                </div>

                {/* Stats Summary */}
                <div className="p-6 space-y-4">
                    {student && (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-dark-800 rounded-xl">
                                <div className="text-2xl font-bold text-primary-400">
                                    {student.academic.gpa.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-dark-400 uppercase tracking-wider">GPA</div>
                            </div>
                            <div className="text-center p-3 bg-dark-800 rounded-xl">
                                <div className="text-2xl font-bold text-accent-400">
                                    {Math.round((student.attributes.iq + student.attributes.eq + student.attributes.charm) / 3)}
                                </div>
                                <div className="text-[10px] text-dark-400 uppercase tracking-wider">平均属性</div>
                            </div>
                            <div className="text-center p-3 bg-dark-800 rounded-xl">
                                <div className="text-2xl font-bold text-green-400">
                                    ¥{student.money}
                                </div>
                                <div className="text-[10px] text-dark-400 uppercase tracking-wider">资金</div>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-dark-300 text-center leading-relaxed">
                        {result.message}
                    </p>

                    <button
                        onClick={() => setIsVisible(false)}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${result.passed
                                ? 'bg-green-600 hover:bg-green-500 text-white'
                                : 'bg-red-600 hover:bg-red-500 text-white'
                            }`}
                    >
                        {result.passed ? (
                            <>
                                <Sparkles className="w-5 h-5" />
                                继续前进
                            </>
                        ) : (
                            <>
                                继续努力
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
