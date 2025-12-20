import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

interface ToastData {
    title: string;
    message: string;
}

export function useToastNotification() {
    const [visible, setVisible] = useState(false);
    const [toastData, setToastData] = useState<ToastData | null>(null);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(
            'show_toast_notification',
            (data: ToastData) => {
                setToastData(data);
                setVisible(true);
            }
        );

        return () => {
            subscription.remove();
        };
    }, []);

    const handleClose = () => {
        setVisible(false);
        setToastData(null);
    };

    return {
        visible,
        toastData,
        handleClose,
    };
}

