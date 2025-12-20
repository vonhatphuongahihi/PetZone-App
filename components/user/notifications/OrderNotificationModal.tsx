import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface OrderNotificationModalProps {
    visible: boolean;
    title: string;
    message: string;
    orderNumber?: string;
    total?: number;
    onClose: () => void;
    onViewOrder?: () => void;
}

export const OrderNotificationModal: React.FC<OrderNotificationModalProps> = ({
    visible,
    title,
    message,
    orderNumber,
    total,
    onClose,
    onViewOrder
}) => {
    const scaleAnim = React.useRef(new Animated.Value(0)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleViewOrder = () => {
        onClose();
        if (onViewOrder) {
            onViewOrder();
        } else if (orderNumber) {
            router.push('/purchase-history');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Icon Container */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="shopping-cart" size={40} color="#FBBC05" />
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Order Details */}
                    {orderNumber && (
                        <View style={styles.orderDetails}>
                            <Text style={styles.orderLabel}>Mã đơn hàng:</Text>
                            <Text style={styles.orderNumber}>{orderNumber}</Text>
                        </View>
                    )}

                    {total && (
                        <View style={styles.orderDetails}>
                            <Text style={styles.orderLabel}>Tổng tiền:</Text>
                            <Text style={styles.totalAmount}>
                                {total.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    )}

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>Đóng</Text>
                        </TouchableOpacity>
                        {orderNumber && (
                            <TouchableOpacity
                                style={styles.viewButton}
                                onPress={handleViewOrder}
                            >
                                <Text style={styles.viewButtonText}>Xem đơn hàng</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 380,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 16,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF9E6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FBBC05',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#4A5568',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    orderDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        width: '100%',
    },
    orderLabel: {
        fontSize: 14,
        color: '#718096',
        marginRight: 8,
    },
    orderNumber: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2D3748',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FBBC05',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        width: '100%',
    },
    closeButton: {
        flex: 1,
        backgroundColor: '#EDF2F7',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A5568',
    },
    viewButton: {
        flex: 1,
        backgroundColor: '#FBBC05',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#FBBC05',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    viewButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
});

