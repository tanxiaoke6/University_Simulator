// TaskBoard - Displays LLM-generated game tasks
import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { generateGameTasks, GameTask } from '../services/aiService';
import { ClipboardList, Loader2, RefreshCw, Star, Clock, BookOpen } from 'lucide-react';

export default function TaskBoard() {
    const { student, config } = useGameStore();
    const [tasks, setTasks] = useState<GameTask[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student) {
            const weekKey = `${student.currentDate.year}_${student.currentDate.semester}_${student.currentDate.week}`;

            // Check cache first
            if (student.taskCache && student.taskCache[weekKey]) {
                setTasks(student.taskCache[weekKey]);
                return;
            }

            // Generate new tasks if not cached
            loadTasks();
        }
    }, [student?.currentDate.week]);

    const loadTasks = async () => {
        if (!student) return;
        setLoading(true);
        try {
            const generatedTasks = await generateGameTasks(config.llm, student);
            setTasks(generatedTasks);

            // Cache the tasks
            const weekKey = `${student.currentDate.year}_${student.currentDate.semester}_${student.currentDate.week}`;
            useGameStore.setState((state) => {
                if (!state.student) return state;
                return {
                    student: {
                        ...state.student,
                        taskCache: {
                            ...(state.student.taskCache || {}),
                            [weekKey]: generatedTasks
                        }
                    }
                };
            });
        } finally {
            setLoading(false);
        }
    };

    if (!student) return null;

    const getPriorityColor = (priority: string) => {
        if (priority === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (priority === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    };

    const getTypeIcon = (type: string) => {
        if (type === 'story') return <Star className="w-4 h-4" />;
        if (type === 'weekly') return <Clock className="w-4 h-4" />;
        return <BookOpen className="w-4 h-4" />;
    };

    const getTypeLabel = (type: string) => {
        if (type === 'story') return '剧情';
        if (type === 'weekly') return '本周';
        return '日常';
    };

    return (
        <div className="h-full bg-dark-950 overflow-hidden flex flex-col animate-fade-in font-sans">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between shrink-0">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <ClipboardList className="w-7 h-7 text-primary-500" />
                    任务面板
                </h2>
                <button
                    onClick={loadTasks}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 disabled:opacity-50 rounded-lg text-xs text-dark-300 transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    刷新任务
                </button>
            </header>

            <div className="flex-1 overflow-y-auto">
                {loading && tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-dark-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-sm">正在生成任务...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-dark-800 rounded-xl bg-dark-900/30 text-center">
                        <ClipboardList className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                        <p className="text-sm text-dark-500">暂无任务</p>
                        <p className="text-[10px] text-dark-600 mt-1">点击刷新按钮生成任务</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map(task => (
                            <div key={task.id} className="p-5 bg-dark-800/40 rounded-xl border border-dark-700/50 hover:border-primary-500/30 transition-colors">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`p-1.5 rounded-lg ${getPriorityColor(task.priority)}`}>
                                            {getTypeIcon(task.type)}
                                        </span>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{task.title}</h4>
                                            <span className="text-[9px] text-dark-500 uppercase">{getTypeLabel(task.type)}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                                        {task.priority === 'high' ? '高优先' : task.priority === 'medium' ? '中优先' : '低优先'}
                                    </span>
                                </div>

                                <p className="text-[11px] text-dark-400 leading-relaxed mb-3">{task.description}</p>

                                {/* Reward */}
                                {task.reward && (
                                    <div className="flex items-center gap-2 pt-3 border-t border-dark-700/30">
                                        <span className="text-[9px] text-dark-500 uppercase font-bold">奖励:</span>
                                        <span className="text-[10px] text-green-400">{task.reward}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
