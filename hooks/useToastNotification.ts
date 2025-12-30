import { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

interface ToastData {
    title: string;
    message: string;
}

export function useToastNotification() {
    const [visible, setVisible] = useState(false);
    const [toastData, setToastData] = useState<ToastData | null>(null);
    const toastQueueRef = useRef<ToastData[]>([]);
    const isProcessingRef = useRef(false);
    const lastToastRef = useRef<{ data: ToastData; timestamp: number } | null>(null);
    const shownToastsRef = useRef<Map<string, number>>(new Map()); // Track shown toasts by key
    const DEBOUNCE_TIME = 3000; // 3 seconds debounce to prevent duplicates

    const processNextToast = () => {
        if (isProcessingRef.current || toastQueueRef.current.length === 0) {
            return;
        }

        const nextToast = toastQueueRef.current.shift();
        if (!nextToast) return;

        // Create a unique key for this toast (title + message)
        const toastKey = `${nextToast.title}|${nextToast.message}`;
        
        // Check if this toast was shown recently (within debounce time)
        const now = Date.now();
        const lastShownTime = shownToastsRef.current.get(toastKey);
        
        if (lastShownTime && (now - lastShownTime) < DEBOUNCE_TIME) {
            // Skip duplicate, process next
            console.log('[useToastNotification] Skipping duplicate toast (shown', (now - lastShownTime), 'ms ago)');
            processNextToast();
            return;
        }

        // Clean up old entries (older than debounce time)
        shownToastsRef.current.forEach((timestamp, key) => {
            if (now - timestamp >= DEBOUNCE_TIME) {
                shownToastsRef.current.delete(key);
            }
        });

        // Save as shown
        shownToastsRef.current.set(toastKey, now);
        lastToastRef.current = {
            data: nextToast,
            timestamp: now
        };

        isProcessingRef.current = true;
        setToastData(nextToast);
        setVisible(true);
    };

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(
            'show_toast_notification',
            (data: ToastData) => {
                console.log('[useToastNotification] Received toast notification:', data.title);
                
                // Create a unique key for this toast
                const toastKey = `${data.title}|${data.message}`;
                
                // Check if this toast was shown recently (within debounce time)
                const now = Date.now();
                const lastShownTime = shownToastsRef.current.get(toastKey);
                
                if (lastShownTime && (now - lastShownTime) < DEBOUNCE_TIME) {
                    // Skip duplicate
                    console.log('[useToastNotification] Skipping duplicate toast notification (shown', (now - lastShownTime), 'ms ago)');
                    return;
                }

                // Clean up old entries (older than debounce time)
                shownToastsRef.current.forEach((timestamp, key) => {
                    if (now - timestamp >= DEBOUNCE_TIME) {
                        shownToastsRef.current.delete(key);
                    }
                });

                // Add to queue
                toastQueueRef.current.push(data);
                console.log('[useToastNotification] Added to queue, queue length:', toastQueueRef.current.length);
                
                // Process if not currently showing
                if (!isProcessingRef.current) {
                    processNextToast();
                }
            }
        );

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (!visible && isProcessingRef.current) {
            // Reset and process next after delay
            isProcessingRef.current = false;
            setTimeout(() => {
                processNextToast();
            }, 500); // Wait for animation to complete
        }
    }, [visible]);

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

