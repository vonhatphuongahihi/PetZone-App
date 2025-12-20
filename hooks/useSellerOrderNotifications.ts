import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { notificationService } from '../services/notificationService';
import { getSocket } from '../services/socket';
import { SocketEventEmitter } from '../services/socketEventEmitter';

export function useSellerOrderNotifications() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Load initial unread count
        const loadUnreadCount = async () => {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        };
        loadUnreadCount();

        // Ensure socket is connected
        getSocket();

        // Listen for order:new (seller notification)
        const orderNewSubscription = SocketEventEmitter.addListener(
            'order:new',
            async (data: any) => {
                try {
                    await notificationService.addNotification({
                        type: 'order',
                        title: 'Đơn hàng mới!',
                        message: `Bạn có đơn hàng mới từ ${data.customerName}. Mã đơn: ${data.orderNumber}. Tổng tiền: ${(data.total || 0).toLocaleString('vi-VN')}đ`,
                        data: {
                            orderId: data.orderId,
                            orderNumber: data.orderNumber,
                            storeId: data.storeId
                        }
                    });
                    await loadUnreadCount();

                    // Show alert for new order
                    Alert.alert(
                        'Đơn hàng mới!',
                        `Bạn có đơn hàng mới từ ${data.customerName}. Mã đơn: ${data.orderNumber}`,
                        [{ text: 'Xem ngay' }, { text: 'Đóng' }]
                    );
                } catch (error) {
                    console.error('Error adding new order notification:', error);
                }
            }
        );

        // Listen for order:status_changed (seller notification when customer cancels)
        const orderStatusChangedSubscription = SocketEventEmitter.addListener(
            'order:status_changed',
            async (data: any) => {
                try {
                    // Only show notification if order was cancelled by customer
                    if (data.newStatus === 'cancelled' && data.oldStatus === 'pending') {
                        await notificationService.addNotification({
                            type: 'order',
                            title: 'Đơn hàng bị hủy',
                            message: `Đơn hàng ${data.orderNumber} đã bị khách hàng hủy. Tổng tiền: ${(data.total || 0).toLocaleString('vi-VN')}đ`,
                            data: {
                                orderId: data.orderId,
                                orderNumber: data.orderNumber,
                                status: data.newStatus
                            }
                        });
                        await loadUnreadCount();
                    }
                } catch (error) {
                    console.error('Error adding order status changed notification:', error);
                }
            }
        );

        // Refresh unread count periodically
        const interval = setInterval(async () => {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        }, 5000);

        return () => {
            orderNewSubscription.remove();
            orderStatusChangedSubscription.remove();
            clearInterval(interval);
        };
    }, []);

    return { unreadCount };
}

