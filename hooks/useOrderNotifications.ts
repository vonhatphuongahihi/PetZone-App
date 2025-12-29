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

                    // Show toast notification for shipped orders (sliding from top)
                    if (data.newStatus === 'shipped') {
                        const { DeviceEventEmitter } = await import('react-native');
                        // Shorten order number (e.g., "ORD-1234567890-1234" -> "ORD-...1234")
                        const shortOrderNumber = data.orderNumber?.length > 12
                            ? `${data.orderNumber.substring(0, 4)}...${data.orderNumber.slice(-4)}`
                            : data.orderNumber;
                        DeviceEventEmitter.emit('show_toast_notification', {
                            title: 'Đơn hàng đã được giao!',
                            message: `Đơn ${shortOrderNumber} đã được giao thành công`
                        });
                    }
                    // Show modal for confirmed and cancelled orders
                    else if (data.newStatus === 'confirmed' || data.newStatus === 'cancelled') {
                        const { DeviceEventEmitter } = await import('react-native');
                        DeviceEventEmitter.emit('show_order_notification', {
                            title: title,
                            message: `Đơn hàng ${data.orderNumber} từ ${data.storeName} ${data.statusMessage}`,
                            orderNumber: data.orderNumber,
                            total: data.total,
                            isSeller: false
                        });
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
            orderCreatedSubscription.remove();
            orderStatusChangedSubscription.remove();
            clearInterval(interval);
        };
    }, []);

    return { unreadCount };
}

