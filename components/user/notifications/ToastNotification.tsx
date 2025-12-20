import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ToastNotificationProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
    visible,
    title,
    message,
    onClose,
    duration = 3000
}) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Slide in from top
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            handleClose();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    if (!visible) return null;

    return (
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [{ translateY: slideAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        <Text style={styles.message} numberOfLines={2}>{message}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
    container: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A202C',
        marginBottom: 2,
    },
    message: {
        fontSize: 12,
        color: '#4A5568',
        lineHeight: 16,
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
});

