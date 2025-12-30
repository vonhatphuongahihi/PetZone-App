import { useEffect, useState } from 'react';
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
        const initSocket = async () => {
            try {
                const socket = await getSocket();
                console.log('[useSellerOrderNotifications] Socket initialized:', socket.connected);
                if (socket.connected) {
                    console.log('[useSellerOrderNotifications] Socket ID:', socket.id);
                }
            } catch (error) {
                console.error('[useSellerOrderNotifications] Error initializing socket:', error);
            }
        };
        initSocket();

        // Listen for order:new (seller notification)
        const orderNewSubscription = SocketEventEmitter.addListener(
            'order:new',
            async (data: any) => {
                console.log('[useSellerOrderNotifications] Received order:new event:', data);
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

                    // Show toast notification for new order
                    const { DeviceEventEmitter } = await import('react-native');
                    const shortOrderNumber = data.orderNumber?.length > 12
                        ? `${data.orderNumber.substring(0, 4)}...${data.orderNumber.slice(-4)}`
                        : data.orderNumber;

                    console.log('[useSellerOrderNotifications] Emitting toast notification: Đơn hàng mới!');
                    DeviceEventEmitter.emit('show_toast_notification', {
                        title: 'Đơn hàng mới!',
                        message: `Đơn ${shortOrderNumber} từ ${data.customerName}`
                    });
                } catch (error) {
                    console.error('Error adding new order notification:', error);
                }
            }
        );

        // Listen for order:delivered (seller notification when customer confirms received)
        const orderDeliveredSubscription = SocketEventEmitter.addListener(
            'order:delivered',
            async (data: any) => {
                console.log('[useSellerOrderNotifications] Received order:delivered event:', data);
                try {
                    await notificationService.addNotification({
                        type: 'order',
                        title: 'Khách hàng đã nhận hàng!',
                        message: `Đơn hàng ${data.orderNumber} từ ${data.customerName} đã được khách hàng xác nhận đã nhận. Tổng tiền: ${(data.total || 0).toLocaleString('vi-VN')}đ`,
                        data: {
                            orderId: data.orderId,
                            orderNumber: data.orderNumber,
                            status: 'shipped'
                        }
                    });
                    await loadUnreadCount();

                    // Show toast notification for delivered order
                    const { DeviceEventEmitter } = await import('react-native');
                    const shortOrderNumber = data.orderNumber?.length > 12
                        ? `${data.orderNumber.substring(0, 4)}...${data.orderNumber.slice(-4)}`
                        : data.orderNumber;

                    console.log('[useSellerOrderNotifications] Emitting toast notification: Khách hàng đã nhận hàng!');
                    DeviceEventEmitter.emit('show_toast_notification', {
                        title: 'Khách hàng đã nhận hàng!',
                        message: `Đơn ${shortOrderNumber} từ ${data.customerName}`
                    });
                } catch (error) {
                    console.error('Error adding order delivered notification:', error);
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

                        // Show toast notification
                        const { DeviceEventEmitter } = await import('react-native');
                        const shortOrderNumber = data.orderNumber?.length > 12
                            ? `${data.orderNumber.substring(0, 4)}...${data.orderNumber.slice(-4)}`
                            : data.orderNumber;

                        DeviceEventEmitter.emit('show_toast_notification', {
                            title: 'Đơn hàng bị hủy',
                            message: `Đơn ${shortOrderNumber} đã bị khách hàng hủy`
                        });
                    }
                } catch (error) {
                    console.error('Error adding order status changed notification:', error);
                }
            }
        );

        // Listen for review:new (seller notification when customer reviews product)
        const reviewNewSubscription = SocketEventEmitter.addListener(
            'review:new',
            async (data: any) => {
                console.log('[useSellerOrderNotifications] Received review:new event:', data);
                try {
                    await notificationService.addNotification({
                        type: 'review',
                        title: 'Có đánh giá mới!',
                        message: `${data.customerName} đã đánh giá sản phẩm "${data.productTitle}" với ${data.rating} sao`,
                        data: {
                            reviewId: data.reviewId,
                            productId: data.productId,
                            productTitle: data.productTitle,
                            customerName: data.customerName,
                            rating: data.rating
                        }
                    });
                    await loadUnreadCount();

                    // Show toast notification
                    const { DeviceEventEmitter } = await import('react-native');

                    DeviceEventEmitter.emit('show_toast_notification', {
                        title: 'Có đánh giá mới!',
                        message: `${data.customerName} đã đánh giá "${data.productTitle}"`
                    });
                } catch (error) {
                    console.error('Error adding review notification:', error);
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
            orderDeliveredSubscription.remove();
            orderStatusChangedSubscription.remove();
            reviewNewSubscription.remove();
            clearInterval(interval);
        };
    }, []);

    return { unreadCount };
}

