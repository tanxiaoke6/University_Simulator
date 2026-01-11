import { useState } from 'react';
import { usePhoneStore } from '../../../stores/phoneStore';
import { useGameStore } from '../../../stores/gameStore';
import {
    ChevronLeft,
    Bell,
    Volume2,
    Shield,
    Info,
    Moon,
    User,
    LogOut,
    ChevronRight,
    CircleHelp
} from 'lucide-react';

export default function SettingsApp() {
    const { closeApp } = usePhoneStore();
    const { student } = useGameStore();

    const [sound, setSound] = useState(true);
    const [notifs, setNotifs] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    if (!student) return null;

    return (
        <div className="flex flex-col h-full bg-dark-950 text-white animate-fade-in pb-12">
            {/* Header */}
            <header className="p-4 border-b border-dark-800 flex items-center gap-3 bg-dark-900/50 sticky top-0 z-10 backdrop-blur-md">
                <button onClick={closeApp} className="p-1 -ml-1 hover:bg-dark-800 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-dark-400" />
                </button>
                <h2 className="font-bold text-sm">系统设置</h2>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
                {/* User Profile Hook */}
                <div className="flex items-center gap-4 p-4 bg-dark-900/50 rounded-2xl border border-dark-800">
                    <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-xl font-bold">
                        {student.name[0]}
                    </div>
                    <div>
                        <h3 className="font-bold text-base">{student.name}</h3>
                        <p className="text-[10px] text-dark-500 uppercase tracking-widest">{student.academic.universityName}</p>
                    </div>
                </div>

                {/* General Settings */}
                <section className="space-y-2">
                    <h4 className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-2">常用设置</h4>
                    <div className="bg-dark-900/50 rounded-2xl border border-dark-800 divide-y divide-dark-800/50">
                        <SettingToggle
                            icon={Bell}
                            label="通知提示"
                            active={notifs}
                            onToggle={() => setNotifs(!notifs)}
                        />
                        <SettingToggle
                            icon={Volume2}
                            label="声音效"
                            active={sound}
                            onToggle={() => setSound(!sound)}
                        />
                        <SettingToggle
                            icon={Moon}
                            label="深色模式"
                            active={darkMode}
                            onToggle={() => setDarkMode(!darkMode)}
                        />
                    </div>
                </section>

                {/* Accountability settings */}
                <section className="space-y-2">
                    <h4 className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-2">账号与安全</h4>
                    <div className="bg-dark-900/50 rounded-2xl border border-dark-800 divide-y divide-dark-800/50">
                        <SettingLink icon={User} label="个人信息" />
                        <SettingLink icon={Shield} label="隐私设置" />
                    </div>
                </section>

                {/* About settings */}
                <section className="space-y-2">
                    <h4 className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-2">关于</h4>
                    <div className="bg-dark-900/50 rounded-2xl border border-dark-800 divide-y divide-dark-800/50">
                        <SettingLink icon={CircleHelp} label="帮助与反馈" />
                        <SettingLink icon={Info} label="版本信息" sublabel="v2.0-Alpha" />
                    </div>
                </section>

                {/* Dangerous items */}
                <button className="w-full flex items-center justify-center gap-2 p-4 text-red-400 hover:bg-red-400/5 rounded-2xl transition-all border border-transparent hover:border-red-400/20 active:scale-95">
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-sm">退出登录</span>
                </button>
            </div>
        </div>
    );
}

function SettingToggle({ icon: Icon, label, active, onToggle }: any) {
    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-dark-800 text-dark-300">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{label}</span>
            </div>
            <button
                onClick={onToggle}
                className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-primary-600' : 'bg-dark-700'}`}
            >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`} />
            </button>
        </div>
    );
}

function SettingLink({ icon: Icon, label, sublabel }: any) {
    return (
        <button className="w-full flex items-center justify-between p-4 hover:bg-dark-800/30 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-dark-800 text-dark-300">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {sublabel && <span className="text-[10px] text-dark-500">{sublabel}</span>}
                <ChevronRight className="w-4 h-4 text-dark-600" />
            </div>
        </button>
    );
}
