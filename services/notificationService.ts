// Notification Service
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
    id: string;
    type: 'order' | 'message' | 'system';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: string;
}

const NOTIFICATIONS_KEY = 'user_notifications';

export const notificationService = {
    // Lấy tất cả notifications
    getAllNotifications: async (): Promise<Notification[]> => {
        try {
            const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
            if (!data) return [];
            return JSON.parse(data);
        } catch (error) {
            console.error('Error getting notifications:', error);
            return [];
        }
    },

    // Lưu notifications
    saveNotifications: async (notifications: Notification[]): Promise<void> => {
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    },

    // Thêm notification mới
    addNotification: async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> => {
        try {
            const notifications = await notificationService.getAllNotifications();
            const newNotification: Notification = {
                ...notification,
                id: Date.now().toString(),
                read: false,
                createdAt: new Date().toISOString()
            };
            notifications.unshift(newNotification); // Thêm vào đầu mảng
            // Giới hạn số lượng notifications (giữ 100 notifications gần nhất)
            const limitedNotifications = notifications.slice(0, 100);
            await notificationService.saveNotifications(limitedNotifications);
            return newNotification;
        } catch (error) {
            console.error('Error adding notification:', error);
            throw error;
        }
    },

    // Đánh dấu notification là đã đọc
    markAsRead: async (notificationId: string): Promise<void> => {
        try {
            const notifications = await notificationService.getAllNotifications();
            const index = notifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                notifications[index].read = true;
                await notificationService.saveNotifications(notifications);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    // Đánh dấu tất cả là đã đọc
    markAllAsRead: async (): Promise<void> => {
        try {
            const notifications = await notificationService.getAllNotifications();
            notifications.forEach(n => n.read = true);
            await notificationService.saveNotifications(notifications);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    },

    // Đếm số notifications chưa đọc
    getUnreadCount: async (): Promise<number> => {
        try {
            const notifications = await notificationService.getAllNotifications();
            return notifications.filter(n => !n.read).length;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    },

    // Xóa notification
    deleteNotification: async (notificationId: string): Promise<void> => {
        try {
            const notifications = await notificationService.getAllNotifications();
            const filtered = notifications.filter(n => n.id !== notificationId);
            await notificationService.saveNotifications(filtered);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    },

    // Xóa tất cả notifications
    clearAll: async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }
};

