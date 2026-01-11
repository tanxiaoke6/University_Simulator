import { useState, useEffect } from 'react';
import { usePhoneStore } from '../../stores/phoneStore';
import {
    Signal,
    Battery,
    Wifi,
    Store,
    Briefcase,
    MessageCircle,
    PiggyBank,
    Package,
    Settings as SettingsIcon,
    Globe,
    Smartphone as SmartphoneIcon,
    Award,
    Target,
    X,
    GripHorizontal
} from 'lucide-react';
import AppIcon from './AppIcon';
import InventoryApp from './apps/InventoryApp';
import SocialApp from './apps/SocialApp';
import BankApp from './apps/BankApp';
import ForumApp from './apps/ForumApp';
import ShopApp from './apps/ShopApp';
import JobApp from './apps/JobApp';
import CertApp from './apps/CertApp';
import SettingsApp from './apps/SettingsApp';
import GoalApp from './apps/GoalApp';

export default function Smartphone() {
    const {
        isPhoneOpen,
        currentApp,
        notifications,
        openApp,
        closeApp,
        togglePhone
    } = usePhoneStore();

    // Dragging Logic
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    // Reset position when phone closes/opens? Optional. keeping position is better UX.

    // Time from game state
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const renderAppContent = () => {
        switch (currentApp) {
            case 'Shop': return <ShopApp />;
            case 'JobBoard': return <JobApp />;
            case 'Social': return <SocialApp />;
            case 'Bank': return <BankApp />;
            case 'Inventory': return <InventoryApp />;
            case 'Forum': return <ForumApp />;
            case 'Settings': return <SettingsApp />;
            case 'Certificates': return <CertApp />;
            case 'Goals': return <GoalApp />;
            default: return null;
        }
    };

    return (
        <div
            className={`fixed bottom-6 right-8 z-50 transition-all duration-300 ease-out ${isPhoneOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none translate-y-20'}`}
            style={{
                transform: isPhoneOpen ? `translate(${position.x}px, ${position.y}px)` : undefined,
            }}
        >
            {/* Phone Frame */}
            <div className="relative w-[360px] h-[720px] bg-dark-950 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[8px] border-dark-800 overflow-hidden ring-1 ring-white/10 flex flex-col">

                {/* Top Drag Handle Area */}
                <div
                    className="h-6 w-full bg-dark-900 flex items-center justify-center cursor-move hover:bg-dark-800 transition-colors z-50 shrink-0"
                    onMouseDown={handleMouseDown}
                    title="按住拖动手机"
                >
                    <div className="w-16 h-1 rounded-full bg-slate-600/50" />
                </div>

                {/* Notch & StatusBar */}
                <div className="absolute top-6 left-0 right-0 h-8 z-20 flex items-center justify-between px-6 pt-2 text-[10px] font-bold text-white/90 pointer-events-none">
                    <span>{timeString}</span>
                    <div className="flex items-center gap-1.5">
                        <Signal className="w-3 h-3" />
                        <Wifi className="w-3 h-3" />
                        <Battery className="w-3 h-3" />
                    </div>
                </div>

                {/* Notch Area (Visual interaction) */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-dark-900 rounded-b-2xl z-20 pointer-events-none" />

                {/* Screen Content */}
                <div className="w-full flex-1 bg-cover bg-center pt-8 bg-dark-900 overflow-hidden relative flex flex-col"
                    style={{ backgroundImage: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}
                >
                    {/* App Content or Home Screen */}
                    {currentApp ? (
                        <div className="w-full h-full flex flex-col bg-dark-950 animate-fade-in relative z-10">
                            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                                {renderAppContent()}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 pt-12 grid grid-cols-4 gap-x-4 gap-y-8 animate-fade-in content-start">
                            <AppIcon
                                icon={Briefcase}
                                label="兼职"
                                color="bg-amber-500"
                                onClick={() => openApp('JobBoard')}
                                notificationCount={notifications.JobBoard}
                            />
                            <AppIcon
                                icon={Store}
                                label="购物"
                                color="bg-sky-500"
                                onClick={() => openApp('Shop')}
                                notificationCount={notifications.Shop}
                            />
                            <AppIcon
                                icon={MessageCircle}
                                label="微信"
                                color="bg-green-500"
                                onClick={() => openApp('Social')}
                                notificationCount={notifications.Social}
                            />
                            <AppIcon
                                icon={Globe}
                                label="帖吧"
                                color="bg-blue-600"
                                onClick={() => openApp('Forum')}
                                notificationCount={notifications.Forum}
                            />
                            <AppIcon
                                icon={PiggyBank}
                                label="银行"
                                color="bg-red-500"
                                onClick={() => openApp('Bank')}
                                notificationCount={notifications.Bank}
                            />
                            <AppIcon
                                icon={Package}
                                label="背包"
                                color="bg-indigo-500"
                                onClick={() => openApp('Inventory')}
                                notificationCount={notifications.Inventory}
                            />
                            <AppIcon
                                icon={SettingsIcon}
                                label="设置"
                                color="bg-slate-500"
                                onClick={() => openApp('Settings')}
                            />
                            <AppIcon
                                icon={Award}
                                label="荣誉"
                                color="bg-primary-500"
                                onClick={() => openApp('Certificates')}
                            />
                            <AppIcon
                                icon={Target}
                                label="目标"
                                color="bg-accent-500"
                                onClick={() => openApp('Goals')}
                            />
                        </div>
                    )}

                    {/* Home Button replaced with Bottom Area standard padding, or rely on App's internal back button */}
                    {/* Removed the large white bar as requested. */}
                    {/* If user needs to go home, they usually close app via app's own back button or we can add a smaller home area? */}
                    {/* Existing apps have 'Close' or 'Back' buttons. */}
                    {/* Let's double check if we need a global "Home" button. */}
                    {/* The prompt said: "手机界面那个白色的条（点击回到桌面）不需要，帮我删除" implies removing the global home bar. */}
                    {/* So reliance is on in-app navigation. */}
                </div>
            </div>

            {/* Close Phone Button (Floating outside) */}
            <button
                onClick={togglePhone}
                className="absolute -top-4 -right-4 w-8 h-8 bg-dark-800 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg border border-white/10"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Helper trigger button to be placed in the UI
export function PhoneTrigger() {
    const { togglePhone, notifications } = usePhoneStore();
    const totalNotifs = Object.values(notifications).reduce((a, b) => a + b, 0);

    return (
        <button
            onClick={togglePhone}
            className="fixed bottom-6 right-6 w-14 h-14 bg-dark-800 rounded-2xl flex items-center justify-center shadow-2xl hover:-translate-y-1 hover:shadow-primary-500/20 transition-all border border-dark-700 group z-40 active:scale-95"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <SmartphoneIcon className="w-6 h-6 text-dark-300 group-hover:text-primary-400 transition-colors" />

            {totalNotifs > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce border-2 border-dark-900">
                    {totalNotifs}
                </div>
            )}
        </button>
    );
}
