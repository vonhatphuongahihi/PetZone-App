import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(
            'show_order_notification',
            (data: ModalData) => {
                setModalData(data);
                setModalVisible(true);
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
        handleClose();
        if (modalData?.isSeller) {
            router.push('/seller/orders');
        } else {
            router.push('/purchase-history');
        }
    };

    return {
        modalVisible,
        modalData,
        handleClose,
        handleViewOrder,
    };
}

