import { useState } from 'react';
import type { StudentState } from '../types';
import { Calendar as CalendarIcon } from 'lucide-react';

interface SchoolCalendarProps {
    student: StudentState;
}

// Fixed start date for each year (e.g., September 1st)
const GET_YEAR_START = (year: number, gaokaoYear: number) => {
    return new Date(gaokaoYear + (year - 1), 8, 1); // 8 is September (0-indexed)
};

const SCHOOL_EVENTS: Record<string, { name: string; type: 'holiday' | 'exam' | 'activity' | 'honor' }> = {
    '10-01': { name: '国庆节', type: 'holiday' },
    '10-02': { name: '国庆假期', type: 'holiday' },
    '10-03': { name: '国庆假期', type: 'holiday' },
    '10-04': { name: '国庆假期', type: 'holiday' },
    '10-05': { name: '国庆假期', type: 'holiday' },
    '10-06': { name: '国庆假期', type: 'holiday' },
    '10-07': { name: '国庆假期', type: 'holiday' },
    '01-01': { name: '元旦', type: 'holiday' },
    '05-01': { name: '劳动节', type: 'holiday' },
};

export default function SchoolCalendar({ student }: SchoolCalendarProps) {
    const [viewYear, setViewYear] = useState(student.currentDate.year);
    const months = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7]; // Sept to Aug
    const monthNames = ['九月', '十月', '十一月', '十二月', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月'];

    // Calculate current date based on game week and day
    const getGameCurrentDate = () => {
        const start = GET_YEAR_START(student.currentDate.year, student.gaokaoYear);
        const daysToAdd = (student.currentDate.week - 1) * 7 + (student.currentDate.day - 1);
        const current = new Date(start);
        current.setDate(start.getDate() + daysToAdd);
        return current;
    };

    const gameDate = getGameCurrentDate();

    const renderMonth = (monthIndex: number, realMonth: number) => {
        // Adjust year for Jan-Aug months
        const yearOffset = realMonth < 8 ? 1 : 0;
        const baseYear = student.gaokaoYear + (viewYear - 1);
        const year = baseYear + yearOffset;

        const firstDay = new Date(year, realMonth, 1);
        const lastDay = new Date(year, realMonth + 1, 0);
        const startDay = firstDay.getDay(); // 0 is Sunday
        const totalDays = lastDay.getDate();

        const cells = [];
        // Empty cells for the start of the month
        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateKey = `${String(realMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const event = SCHOOL_EVENTS[dateKey];

            const isToday = gameDate.getFullYear() === year &&
                gameDate.getMonth() === realMonth &&
                gameDate.getDate() === day;

            const isWeekend = new Date(year, realMonth, day).getDay() === 0 ||
                new Date(year, realMonth, day).getDay() === 6;

            cells.push(
                <div
                    key={day}
                    className={`h-10 border flex flex-col items-center justify-center relative rounded group hover:bg-dark-800/60 transition-colors
                        ${isToday ? 'bg-blue-500/10 border-blue-500/50 z-10 ring-1 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-dark-900/40 border-dark-800/40'}
                        ${isWeekend ? 'bg-dark-950/40 text-dark-500' : ''}
                    `}
                >
                    <span className={`text-[10px] font-bold ${isToday ? 'text-blue-400' : 'text-dark-400'}`}>{day}</span>
                    {event && (
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${event.type === 'holiday' ? 'bg-green-500/50' : 'bg-blue-500/50'}`} title={event.name} />
                    )}
                    {/* Hover Tooltip */}
                    {event && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-dark-700">
                            {event.name}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div key={realMonth} className="bg-dark-900/20 rounded-xl p-4 border border-dark-800/30 shadow-inner">
                <h4 className="text-sm font-bold text-dark-300 mb-3 flex items-center justify-between">
                    {monthNames[monthIndex]}
                    <span className="text-[10px] text-dark-600 font-mono">{year}</span>
                </h4>
                <div className="grid grid-cols-7 gap-1 text-[9px] text-dark-600 mb-2 font-bold uppercase tracking-wider">
                    {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="text-center">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {cells}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-dark-950 overflow-hidden flex flex-col p-8 animate-fade-in font-sans">
            <header className="mb-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <h2 className="text-3xl font-display font-bold text-white flex items-center gap-4">
                        <CalendarIcon className="w-8 h-8 text-primary-500" />
                        学年校历
                    </h2>

                    <div className="flex items-center bg-dark-900 rounded-xl p-1.5 border border-dark-800 shadow-xl">
                        {[1, 2, 3, 4].map(y => (
                            <button
                                key={y}
                                onClick={() => setViewYear(y)}
                                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${viewYear === y ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' : 'text-dark-500 hover:text-dark-300'} `}
                            >
                                第{y}学年
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-dark-900 rounded-xl border border-dark-800 flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                        <span className="text-xs font-bold text-dark-200">
                            当前进度：第{student.currentDate.year}学年 第{student.currentDate.week}周
                        </span>
                    </div>
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {months.map((m, i) => renderMonth(i, m))}
                </div>
            </div>

            <footer className="shrink-0 mt-6 pt-6 border-t border-dark-800/50 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* Footer content relocated to Sidebar Legend or simplified here */}
                </div>
                <p className="text-xs text-dark-500 italic">注：校历根据标准学时计算，实际进度请以任务面板为准。</p>
            </footer>
        </div>
    );
}
