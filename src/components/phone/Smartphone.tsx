import { useGameStore } from '../../stores/gameStore';
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
    X
} from 'lucide-react';
import AppIcon from './AppIcon';
import InventoryApp from './apps/InventoryApp';
import SocialApp from './apps/SocialApp';
import BankApp from './apps/BankApp';
import ForumApp from './apps/ForumApp';
import ShopApp from './apps/ShopApp';
import JobApp from './apps/JobApp';
import SettingsApp from './apps/SettingsApp';

export default function Smartphone() {
    const { student } = useGameStore();
    const {
        isPhoneOpen,
        currentApp,
        notifications,
        openApp,
        closeApp,
        togglePhone
    } = usePhoneStore();

    if (!student) return null;

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
            default: return null;
        }
    };

    // If an app is open that is "Fullscreen" (like existing Modals), we might want to hide the phone frame or render differently.
    // For this iteration, let's make the phone frame act as a launcher for existing modals if they are too big, 
    // or render simple apps inside.
    // Given existing modals are designed for desktop, let's keep them as "Apps" that might overlay.
    // However, the PhoneOS goal is to *contain* them. 
    // Let's try to render them inside the phone screen container.

    return (
        <div className={`fixed bottom-6 right-8 z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isPhoneOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'}`}>
            {/* Phone Frame */}
            <div className="relative w-[360px] h-[720px] bg-dark-950 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[8px] border-dark-800 overflow-hidden ring-1 ring-white/10">

                {/* Notch & StatusBar */}
                <div className="absolute top-0 left-0 right-0 h-8 z-20 flex items-center justify-between px-6 pt-2 text-[10px] font-bold text-white/90">
                    <span>{timeString}</span>
                    <div className="flex items-center gap-1.5">
                        <Signal className="w-3 h-3" />
                        <Wifi className="w-3 h-3" />
                        <Battery className="w-3 h-3" />
                    </div>
                </div>

                {/* Notch Area (Visual interaction) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-dark-900 rounded-b-2xl z-20" />

                {/* Screen Content */}
                <div className="w-full h-full bg-cover bg-center pt-8 bg-dark-900 overflow-hidden relative"
                    style={{ backgroundImage: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}
                >
                    {/* App Content or Home Screen */}
                    {currentApp ? (
                        <div className="w-full h-full flex flex-col bg-dark-950 animate-fade-in relative z-10">
                            {/* App Header (Fake Navigation) */}
                            {/* Note: Most apps might want full screen. We provide a 'Home' handle at bottom. */}

                            {/* Render Active App */}
                            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                                {renderAppContent()}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 pt-12 grid grid-cols-4 gap-x-4 gap-y-8 animate-fade-in">
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
                        </div>
                    )}

                    {/* Home Indicator / Navigation Bar */}
                    <div className="absolute bottom-2 left-0 right-0 h-10 flex items-center justify-center z-50 pointer-events-none">
                        <div
                            className="w-32 h-1.5 bg-white/20 rounded-full cursor-pointer pointer-events-auto hover:bg-white/40 active:scale-95 transition-all backdrop-blur-md"
                            onClick={closeApp} // Acts as Home Button
                        />
                    </div>
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
