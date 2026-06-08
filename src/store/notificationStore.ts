import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface InAppNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  toasts: Toast[];
  liveNotifications: InAppNotification[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  addLiveNotification: (notification: InAppNotification) => void;
  setLiveNotifications: (notifications: InAppNotification[]) => void;
  clearLiveNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],
  liveNotifications: [],
  
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
    
  addLiveNotification: (notification) =>
    set((state) => ({
      liveNotifications: [notification, ...state.liveNotifications],
    })),
    
  setLiveNotifications: (liveNotifications) => set({ liveNotifications }),
  clearLiveNotifications: () => set({ liveNotifications: [] }),
}));
