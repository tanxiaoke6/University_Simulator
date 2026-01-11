import { create } from 'zustand';

export type AppName = 'Forum' | 'JobBoard' | 'Shop' | 'Social' | 'Bank' | 'Inventory' | 'Settings' | 'Certificates';

interface PhoneState {
    isPhoneOpen: boolean;
    currentApp: AppName | null;
    notifications: Record<string, number>;
}

interface PhoneActions {
    togglePhone: () => void;
    openPhone: () => void;
    closePhone: () => void;
    openApp: (app: AppName) => void;
    closeApp: () => void;
    addNotification: (app: AppName) => void;
    clearNotifications: (app: AppName) => void;
}

export const usePhoneStore = create<PhoneState & PhoneActions>((set) => ({
    isPhoneOpen: false,
    currentApp: null,
    notifications: {
        JobBoard: 0,
        Shop: 0,
        Social: 0,
        Bank: 0,
        Inventory: 0,
    },

    togglePhone: () => set((state) => ({ isPhoneOpen: !state.isPhoneOpen })),
    openPhone: () => set({ isPhoneOpen: true }),
    closePhone: () => set({ isPhoneOpen: false, currentApp: null }),

    openApp: (app) => set((state) => ({
        currentApp: app,
        notifications: { ...state.notifications, [app]: 0 }
    })),

    closeApp: () => set({ currentApp: null }),

    addNotification: (app) => set((state) => ({
        notifications: {
            ...state.notifications,
            [app]: (state.notifications[app] || 0) + 1
        }
    })),

    clearNotifications: (app) => set((state) => ({
        notifications: { ...state.notifications, [app]: 0 }
    })),
}));
