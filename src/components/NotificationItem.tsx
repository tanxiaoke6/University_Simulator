import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { GameNotification } from '../types';

interface NotificationItemProps {
    notification: GameNotification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
    const { dismissNotification } = useGameStore();
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Auto-dismiss after 2 seconds
        const timer = setTimeout(() => {
            setIsExiting(true);
            // Wait for exit animation (e.g. 300ms) then actual dismiss
            setTimeout(() => {
                dismissNotification(notification.id);
            }, 300);
        }, 2000);

        return () => clearTimeout(timer);
    }, [notification.id, dismissNotification]);

    return (
        <div
            className={`pointer-events-auto glass-card-light overflow-hidden border-dark-700 shadow-2xl transition-all duration-300 ${isExiting ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'}`}
        >
            <div className="flex">
                <div className={`w-1 shrink-0 ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-primary-500'}`} />
                <div className="p-4 flex gap-3 flex-1 bg-dark-900/90 backdrop-blur-md">
                    <div className="mt-0.5">
                        {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                        {notification.type === 'info' && <Info className="w-5 h-5 text-primary-400" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-dark-100 leading-relaxed">
                            {notification.message}
                        </p>
                    </div>
                    <button
                        onClick={() => dismissNotification(notification.id)}
                        className="p-1 hover:bg-dark-800 rounded-md transition-colors h-fit"
                    >
                        <X className="w-4 h-4 text-dark-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}
