import { LucideIcon } from 'lucide-react';

interface AppIconProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    notificationCount?: number;
    color?: string;
}

export default function AppIcon({ icon: Icon, label, onClick, notificationCount = 0, color = 'bg-blue-500' }: AppIconProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 group p-2 relative"
        >
            <div className={`relative w-12 h-12 ${color} rounded-2xl shadow-lg border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95`}>
                <Icon className="w-6 h-6 text-white" />

                {/* Notification Badge */}
                {notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-dark-900 shadow-sm px-1 z-10 animate-bounce">
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </div>
                )}
            </div>
            <span className="text-[10px] font-medium text-white/90 drop-shadow-md text-nowrap group-hover:text-white transition-colors">
                {label}
            </span>
        </button>
    );
}
