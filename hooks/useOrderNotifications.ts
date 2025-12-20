import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { notificationService } from '../services/notificationService';
import { getSocket } from '../services/socket';
import { SocketEventEmitter } from '../services/socketEventEmitter';

export function useOrderNotifications() {
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

        // Listen for order:created (customer notification)
        const orderCreatedSubscription = SocketEventEmitter.addListener(
            'order:created',
            async (data: any) => {
                try {
                    await notificationService.addNotification({
                        type: 'order',
                        title: 'Đặt hàng thành công!',
                        message: `Đơn hàng ${data.orders?.[0]?.orderNumber || ''} của bạn đã được đặt thành công. Tổng tiền: ${(data.orders?.[0]?.total || 0).toLocaleString('vi-VN')}đ`,
                        data: {
                            orderId: data.orders?.[0]?.orderId,
                            orderNumber: data.orders?.[0]?.orderNumber
                        }
                    });
                    await loadUnreadCount();
                } catch (error) {
                    console.error('Error adding order created notification:', error);
                }
            }
        );

        // Listen for order:status_changed (customer notification)
        const orderStatusChangedSubscription = SocketEventEmitter.addListener(
            'order:status_changed',
            async (data: any) => {
                try {
                    const statusMessages: { [key: string]: string } = {
                        'pending': 'đang chờ xác nhận',
                        'confirmed': 'đã được xác nhận và đang giao hàng',
                        'shipped': 'đã được giao hàng',
                        'cancelled': 'đã bị hủy'
                    };

                    const title = data.newStatus === 'cancelled'
                        ? 'Đơn hàng đã bị hủy'
                        : `Đơn hàng ${data.statusMessage}`;

                    await notificationService.addNotification({
                        type: 'order',
                        title: title,
                        message: `Đơn hàng ${data.orderNumber} từ ${data.storeName} ${data.statusMessage}. Tổng tiền: ${(data.total || 0).toLocaleString('vi-VN')}đ`,
                        data: {
                            orderId: data.orderId,
                            orderNumber: data.orderNumber,
                            status: data.newStatus
                        }
                    });
                    await loadUnreadCount();

                    // Show alert for important status changes
                    if (data.newStatus === 'shipped' || data.newStatus === 'cancelled') {
                        Alert.alert(
                            title,
                            `Đơn hàng ${data.orderNumber} ${data.statusMessage}`,
                            [{ text: 'OK' }]
                        );
                    }
                } catch (error) {
                    console.error('Error adding order status changed notification:', error);
                }
            }
        );

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
                        [{
                            text: 'Xem ngay', onPress: () => {
                                // Navigate to orders screen if needed
                            }
                        }, { text: 'Đóng' }]
                    );
                } catch (error) {
                    console.error('Error adding new order notification:', error);
                }
            }
        );

        // Refresh unread count periodically
        const interval = setInterval(async () => {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        }, 5000);

        return () => {
            orderCreatedSubscription.remove();
            orderStatusChangedSubscription.remove();
            orderNewSubscription.remove();
            clearInterval(interval);
        };
    }, []);

    return { unreadCount };
}

