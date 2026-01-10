import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function NotificationOverlay() {
    const { student, dismissNotification } = useGameStore();

    useEffect(() => {
        if (!student || student.notifications.length === 0) return;

        // Auto-dismiss the oldest notification after 3 seconds
        const timer = setTimeout(() => {
            const oldest = student.notifications[0];
            if (oldest) {
                dismissNotification(oldest.id);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [student?.notifications, dismissNotification]);

    if (!student || student.notifications.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 w-80 pointer-events-none">
            {student.notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="pointer-events-auto animate-slide-in-right glass-card-light overflow-hidden border-dark-700 shadow-2xl"
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
            ))}
        </div>
    );
}
