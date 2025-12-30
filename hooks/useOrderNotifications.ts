import { useEffect, useState } from 'react';
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
                        title: 'Đơn hàng đang chờ xác nhận',
                        message: `Đơn hàng ${data.orders?.[0]?.orderNumber || ''} của bạn đang chờ xác nhận từ cửa hàng. Tổng tiền: ${(data.orders?.[0]?.total || 0).toLocaleString('vi-VN')}đ`,
                        data: {
                            orderId: data.orders?.[0]?.orderId,
                            orderNumber: data.orders?.[0]?.orderNumber,
                            status: 'pending'
                        }
                    });
                    await loadUnreadCount();

                    // Show toast notification
                    const { DeviceEventEmitter } = await import('react-native');
                    const orderNumber = data.orders?.[0]?.orderNumber || '';
                    const shortOrderNumber = orderNumber.length > 12
                        ? `${orderNumber.substring(0, 4)}...${orderNumber.slice(-4)}`
                        : orderNumber;

                    DeviceEventEmitter.emit('show_toast_notification', {
                        title: 'Đơn hàng đang chờ xác nhận',
                        message: `Đơn ${shortOrderNumber} đang chờ xác nhận`
                    });
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
                        : data.newStatus === 'confirmed'
                            ? 'Đơn hàng đã được xác nhận!'
                            : data.newStatus === 'shipped'
                                ? 'Đơn hàng đã được giao!'
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

                    // Show toast notification for all status changes
                    const { DeviceEventEmitter } = await import('react-native');

                    // Shorten order number for toast
                    const shortOrderNumber = data.orderNumber?.length > 12
                        ? `${data.orderNumber.substring(0, 4)}...${data.orderNumber.slice(-4)}`
                        : data.orderNumber;

                    console.log('[useOrderNotifications] Emitting toast notification:', title);
                    // Show toast for all status changes
                    DeviceEventEmitter.emit('show_toast_notification', {
                        title: title,
                        message: `Đơn ${shortOrderNumber} ${data.statusMessage}`
                    });
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
            orderCreatedSubscription.remove();
            orderStatusChangedSubscription.remove();
            clearInterval(interval);
        };
    }, []);

    return { unreadCount };
}

