import { useGameStore } from '../stores/gameStore';
import {
    Calendar,
    Sparkles,
    ChevronRight,
} from 'lucide-react';

export default function ActionPanel() {
    const { student, nextTurn, isLoading } = useGameStore();

    if (!student) return null;

    const actionPoints = student.actionPoints || 0;
    const maxActionPoints = student.maxActionPoints || 7;

    return (
        <div className="space-y-4">
            {/* Header: AP Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-dark-800/50">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">本周行动力</span>
                    <div className="flex gap-1 mt-1">
                        {Array.from({ length: maxActionPoints }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-5 h-2 rounded-full transition-all duration-500 ${i < actionPoints
                                    ? 'bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                    : 'bg-dark-800'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {actionPoints <= 0 && (
                    <div className="flex items-center gap-2 text-primary-400 animate-pulse px-3 py-1 bg-primary-500/10 rounded-full border border-primary-500/20">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">已耗尽，请结束本周</span>
                    </div>
                )}
            </div>

            {/* Next Turn Button */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-800/50">
                <div className="flex items-center gap-2 text-dark-500 text-xs text-balance">
                    <Calendar className="w-4 h-4" />
                    <span>第 {student.currentDate.week} 周 / {student.currentDate.semester === 1 ? '上学期' : '下学期'}</span>
                </div>

                <button
                    onClick={nextTurn}
                    disabled={isLoading}
                    className={`group relative flex items-center gap-3 px-10 py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg cursor-pointer ${actionPoints <= 0
                        ? 'bg-accent-600 hover:bg-accent-500 shadow-accent-500/20 scale-105 animate-glow'
                        : 'bg-primary-600 hover:bg-primary-500 shadow-primary-500/20'
                        }`}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    )}
                    <span>结束本周 (NEXT WEEK)</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    )
}
