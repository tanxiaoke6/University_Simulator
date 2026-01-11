import { useGameStore } from '../stores/gameStore';
import NotificationItem from './NotificationItem';

export default function NotificationOverlay() {
    const { student } = useGameStore();

    if (!student || student.notifications.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 w-80 pointer-events-none">
            {student.notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
            ))}
        </div>
    );
}
