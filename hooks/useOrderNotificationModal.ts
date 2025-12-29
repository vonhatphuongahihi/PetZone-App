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
    const isModalVisibleRef = useRef(false);
    const pendingNotificationRef = useRef<ModalData | null>(null);

    useEffect(() => {
        isModalVisibleRef.current = modalVisible;
    }, [modalVisible]);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(
            'show_order_notification',
            (data: ModalData) => {
                // If modal is already visible, close it first then show new one
                if (isModalVisibleRef.current) {
                    // Store pending notification
                    pendingNotificationRef.current = data;
                    // Close current modal
                    setModalVisible(false);
                    setModalData(null);
                    // Wait for animation to complete, then show new modal
                    setTimeout(() => {
                        if (pendingNotificationRef.current) {
                            setModalData(pendingNotificationRef.current);
                            setModalVisible(true);
                            pendingNotificationRef.current = null;
                        }
                    }, 200); // Wait for close animation
                } else {
                    // No modal visible, show immediately
                    setModalData(data);
                    setModalVisible(true);
                }
            }
        );

        return () => {
            subscription.remove();
        };
    }, []);

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

