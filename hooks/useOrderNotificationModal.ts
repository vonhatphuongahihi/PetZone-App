import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

interface ModalData {
    title: string;
    message: string;
    orderNumber?: string;
    total?: number;
    isSeller?: boolean;
}

export function useOrderNotificationModal() {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const notificationQueueRef = useRef<ModalData[]>([]);
    const isProcessingRef = useRef(false);
    const modalVisibleRef = useRef(false);

    // Keep ref in sync with state
    useEffect(() => {
        modalVisibleRef.current = modalVisible;
    }, [modalVisible]);

    // Function to process next notification in queue
    const processNextNotification = useRef(() => {
        // If already processing or queue is empty, return
        if (isProcessingRef.current || notificationQueueRef.current.length === 0) {
            return;
        }

        // If modal is visible, wait for it to close
        if (modalVisibleRef.current) {
            return;
        }

        // Get next notification from queue
        const nextNotification = notificationQueueRef.current.shift();
        if (!nextNotification) {
            return;
        }

        // Mark as processing
        isProcessingRef.current = true;

        // Show the notification
        setModalData(nextNotification);
        setModalVisible(true);
    }).current;

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(
            'show_order_notification',
            (data: ModalData) => {
                // Add notification to queue
                notificationQueueRef.current.push(data);

                // Try to process if modal is not visible
                if (!modalVisibleRef.current) {
                    processNextNotification();
                }
            }
        );

        return () => {
            subscription.remove();
        };
    }, [processNextNotification]);

    // Process next notification when modal closes
    useEffect(() => {
        if (!modalVisible) {
            // Reset processing flag when modal closes
            isProcessingRef.current = false;

            // Process next notification after a short delay (for animation)
            // This ensures smooth transition between notifications
            setTimeout(() => {
                processNextNotification();
            }, 300);
        }
    }, [modalVisible, processNextNotification]);

    const handleClose = () => {
        setModalVisible(false);
        setModalData(null);
    };

    const handleViewOrder = () => {
        // Save modalData before closing modal
        const currentModalData = modalData;
        if (!currentModalData) return;

        handleClose();
        // Use setTimeout to ensure modal closes before navigation
        setTimeout(() => {
            if (currentModalData.isSeller) {
                // For seller, navigate to orders with appropriate filter
                if (currentModalData.title === 'Đơn hàng mới!' || currentModalData.title.includes('đơn hàng mới')) {
                    router.push({
                        pathname: '/seller/orders',
                        params: { filter: 'pending' }
                    });
                } else if (currentModalData.title.includes('đã nhận hàng') || currentModalData.title.includes('Khách hàng đã nhận hàng')) {
                    router.push({
                        pathname: '/seller/orders',
                        params: { filter: 'shipped' }
                    });
                } else {
                    router.push('/seller/orders');
                }
            } else {
                // For user, navigate based on notification title/status
                if (currentModalData.title === 'Đơn hàng đã được xác nhận!' ||
                    currentModalData.title.includes('đã được xác nhận') ||
                    currentModalData.title.includes('đang giao')) {
                    // Navigate to delivery screen for confirmed orders
                    router.push('/delivery');
                } else if (currentModalData.title === 'Đơn hàng đã được giao!' ||
                    currentModalData.title.includes('đã được giao')) {
                    // Navigate to purchase history for shipped orders
                    router.push('/purchase-history');
                } else if (currentModalData.title === 'Đơn hàng đã bị hủy' ||
                    currentModalData.title.includes('đã bị hủy')) {
                    // Navigate to purchase history for cancelled orders
                    router.push('/purchase-history');
                } else {
                    // Default: navigate to purchase history
                    router.push('/purchase-history');
                }
            }
        }, 200); // Wait for modal close animation
    };

    return {
        modalVisible,
        modalData,
        handleClose,
        handleViewOrder,
    };
}

