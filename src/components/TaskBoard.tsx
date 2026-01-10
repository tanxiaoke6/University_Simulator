import { Calendar as CalendarIcon, ClipboardList } from 'lucide-react';

export default function TaskBoard() {
    return (
        <div className="h-full bg-dark-950 overflow-hidden flex flex-col p-8 animate-fade-in font-sans">
            <header className="mb-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <h2 className="text-3xl font-display font-bold text-white flex items-center gap-4">
                        <ClipboardList className="w-8 h-8 text-primary-500" />
                        任务列表
                    </h2>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-dark-800 rounded-2xl bg-dark-900/50">
                <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mb-6">
                    <CalendarIcon className="w-10 h-10 text-dark-500" />
                </div>
                <h3 className="text-xl font-bold text-dark-300 mb-2">任务系统开发中</h3>
                <p className="text-sm text-dark-500 leading-relaxed max-w-md">
                    正在构建包含主线剧情、随机事件和日常挑战的任务系统。
                    <br />
                    任务将与校历日程紧密联动，敬请期待...
                </p>
            </div>
        </div>
    );
}
