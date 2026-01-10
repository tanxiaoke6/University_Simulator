import { useGameStore } from '../stores/gameStore';
import { Calendar, TrendingUp, X } from 'lucide-react';
import type { DayOfWeek, TimeSlot } from '../types';
import { initializeSchedule } from '../stores/gameData';

interface ClassScheduleProps {
    onClose?: () => void;
}

export default function ClassSchedule({ onClose }: ClassScheduleProps) {
    const { student, toggleAttendance } = useGameStore();

    if (!student) return null;

    const days: { id: DayOfWeek; label: string }[] = [
        { id: 'monday', label: '周一' },
        { id: 'tuesday', label: '周二' },
        { id: 'wednesday', label: '周三' },
        { id: 'thursday', label: '周四' },
        { id: 'friday', label: '周五' }
    ];

    const slots: { id: TimeSlot; label: string; subLabel: string }[] = [
        { id: 'morning_1', label: '上午', subLabel: '1-2节' },
        { id: 'morning_2', label: '上午', subLabel: '3-4节' },
        { id: 'afternoon_1', label: '下午', subLabel: '5-6节' },
        { id: 'afternoon_2', label: '下午', subLabel: '7-8节' },
        { id: 'evening', label: '晚上', subLabel: '晚自习' }
    ];

    const getCourseForSlot = (day: DayOfWeek, slot: TimeSlot) => {
        if (!student.weeklySchedule) return null;
        return student.weeklySchedule.find(entry => entry.day === day && entry.slot === slot);
    };

    const isPlanned = (day: DayOfWeek, slot: TimeSlot) => {
        const entryId = `${day}_${slot}`;
        return (student.plannedAttendance || []).includes(entryId);
    };

    const handleToggle = (day: DayOfWeek, slot: TimeSlot, course: any) => {
        if (!course) return;
        const entryId = `${day}_${slot}`;
        toggleAttendance(entryId, 1);
    };

    if (!student.weeklySchedule) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6 animate-fade-in">
                <div className="p-4 rounded-full bg-amber-500/10 text-amber-500">
                    <Calendar className="w-16 h-16" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-display font-bold text-white">检测到旧版本存档</h2>
                    <p className="text-dark-400">
                        由于课程表系统是新功能，您的存档中暂无排课数据。点击下方按钮为您所在的专业初始化课表。
                    </p>
                </div>
                <button
                    onClick={async () => {
                        const config = useGameStore.getState().config;
                        const newSchedule = await initializeSchedule(config, student.academic.major);
                        useGameStore.setState((state) => {
                            if (!state.student) return state;
                            return {
                                student: {
                                    ...state.student,
                                    weeklySchedule: newSchedule,
                                    plannedAttendance: [],
                                    courseRecords: {}
                                }
                            };
                        });
                    }}
                    className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-950/20"
                >
                    <TrendingUp className="w-5 h-5" />
                    立即初始化课表
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary-500/20 text-primary-400">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white">我的课表 (第{student.currentDate.semester}学期)</h2>
                        <p className="text-sm text-dark-400">
                            {student.academic.major.name} •
                            <span className="ml-2 text-primary-400 font-bold">
                                课程学分: {student.courseActionPoints}/{student.maxCourseActionPoints}
                            </span>
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                        <X className="w-6 h-6 text-dark-500" />
                    </button>
                )}
            </div>

            {/* Timetable Grid */}
            <div className="flex-1 glass-card p-6 overflow-auto scrollbar-thin">
                <div className="grid grid-cols-6 gap-2 min-w-[800px]">
                    {/* Header Row */}
                    <div className="p-3"></div>
                    {days.map(day => (
                        <div key={day.id} className="flex items-center justify-center p-3 bg-dark-800/50 rounded-lg">
                            <span className="text-sm font-bold text-primary-400">{day.label}</span>
                        </div>
                    ))}

                    {/* Time Slot Rows */}
                    {slots.map(slot => (
                        <div key={slot.id} className="contents">
                            {/* Time Label */}
                            <div className="flex flex-col items-center justify-center p-3 bg-dark-900/50 rounded-lg border border-dark-800">
                                <span className="text-sm font-bold text-white">{slot.label}</span>
                                <span className="text-[10px] text-dark-500">{slot.subLabel}</span>
                            </div>

                            {/* Course Cells */}
                            {days.map(day => {
                                const entry = getCourseForSlot(day.id, slot.id);
                                const course = entry?.course;
                                const attended = isPlanned(day.id, slot.id);

                                return (
                                    <div
                                        key={`${day.id}-${slot.id}`}
                                        onClick={() => handleToggle(day.id, slot.id, course)}
                                        className={`
                                            relative p-3 rounded-xl border transition-all h-[110px] flex flex-col justify-between group
                                            ${!course
                                                ? 'bg-dark-900/20 border-dark-800/30 border-dashed'
                                                : attended
                                                    ? 'bg-primary-900/20 border-primary-500/50 shadow-[0_0_15px_-3px_rgba(8,145,178,0.3)] cursor-pointer hover:bg-primary-900/30'
                                                    : 'bg-dark-800/50 border-dark-700/50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer'
                                            }
                                        `}
                                    >
                                        {course ? (
                                            <>
                                                <div className="space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className={`text-xs font-bold leading-tight ${attended ? 'text-white' : 'text-dark-300'}`}>
                                                            {course.name}
                                                        </h3>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${course.type === 'Required' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                                                            }`}>
                                                            {course.type === 'Required' ? '必' : '选'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Status Footer */}
                                                <div className="flex items-center justify-between mt-2">
                                                    {attended ? (
                                                        <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                            已计划
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-[10px] text-dark-500 font-medium">
                                                            <span>点击上课</span>
                                                        </div>
                                                    )}

                                                    {/* Cost Indicator on Hover */}
                                                    <div className={`
                                                        px-1.5 py-0.5 rounded text-[9px] font-mono font-bold
                                                        ${attended ? 'bg-dark-900/50 text-dark-400' : 'bg-primary-500 text-white'}
                                                        opacity-0 group-hover:opacity-100 transition-opacity
                                                    `}>
                                                        {attended ? '撤销' : '-1 AP'}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-[10px] text-dark-700">空闲</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-4 p-4 bg-dark-900/80 rounded-xl border border-dark-800 flex items-center justify-between text-xs text-dark-400">
                <p>
                    💡 <span className="font-bold text-primary-400">每周规划：</span>
                    点击课程安排上课计划。缺勤过高(&lt;40%)将导致挂科并大幅降低GPA (当前GPA: {student.academic.gpa.toFixed(2)})
                </p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary-900/20 border border-primary-500/50"></div>
                        <span>计划中</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-dark-800/50 border border-dark-700/50 grayscale"></div>
                        <span>旷课</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
