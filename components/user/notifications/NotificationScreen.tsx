import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Notification, notificationService } from '../../../services/notificationService';
import { notificationStyles } from './notificationStyles';

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getAllNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadNotifications();
    }, [loadNotifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        await notificationService.markAsRead(notificationId);
        await loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead();
        await loadNotifications();
    };

    const handleDelete = async (notificationId: string) => {
        await notificationService.deleteNotification(notificationId);
        await loadNotifications();
    };

    const handleClearAll = async () => {
        await notificationService.clearAll();
        await loadNotifications();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order':
                return 'shopping-cart';
            case 'message':
                return 'message';
            default:
                return 'notifications';
        }
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                notificationStyles.notificationItem,
                !item.read && notificationStyles.notificationItemUnread
            ]}
            onPress={() => {
                if (!item.read) {
                    handleMarkAsRead(item.id);
                }
                // Navigate based on notification type and content
                if (item.type === 'order' && item.data?.orderId) {
                    // Check if it's a new order notification (for seller)
                    if (item.title === 'Đơn hàng mới!' || item.title.includes('đơn hàng mới')) {
                        // Navigate to seller orders screen with pending filter
                        router.push({
                            pathname: '/seller/orders',
                            params: { filter: 'pending' }
                        });
                    }
                    // Check if it's a confirmed/delivery notification (for user)
                    else if (item.title.includes('đã được xác nhận') ||
                        item.title.includes('đang giao') ||
                        (item.data?.status === 'confirmed' && !item.title.includes('đã nhận hàng'))) {
                        // Navigate to delivery screen
                        router.push('/delivery');
                    }
                    // Check if it's a delivered notification (for user - shipped)
                    else if (item.title.includes('đã được giao') ||
                        (item.data?.status === 'shipped' && !item.title.includes('đã nhận hàng'))) {
                        // Navigate to purchase history screen
                        router.push('/purchase-history');
                    }
                    // Check if it's a delivered notification (for seller - customer received)
                    else if (item.title.includes('đã nhận hàng') ||
                        item.title.includes('Khách hàng đã nhận hàng')) {
                        // Navigate to seller orders screen with shipped filter
                        router.push({
                            pathname: '/seller/orders',
                            params: { filter: 'shipped' }
                        });
                    }
                    // Default: navigate to seller orders
                    else {
                        router.push('/seller/orders');
                    }
                } else if (item.type === 'message' && item.data?.conversationId) {
                    router.push(`/messages`);
                }
            }}
        >
            <View style={notificationStyles.notificationIconContainer}>
                <MaterialIcons
                    name={getNotificationIcon(item.type) as any}
                    size={24}
                    color={item.read ? '#999' : '#FBBC05'}
                />
            </View>
            <View style={notificationStyles.notificationContent}>
                <Text style={[
                    notificationStyles.notificationTitle,
                    !item.read && notificationStyles.notificationTitleUnread
                ]}>
                    {item.title}
                </Text>
                <Text style={notificationStyles.notificationMessage}>
                    {item.message}
                </Text>
                <Text style={notificationStyles.notificationTime}>
                    {formatDate(item.createdAt)}
                </Text>
            </View>
            {!item.read && (
                <View style={notificationStyles.unreadDot} />
            )}
            <TouchableOpacity
                style={notificationStyles.deleteButton}
                onPress={() => handleDelete(item.id)}
            >
                <MaterialIcons name="close" size={18} color="#999" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={notificationStyles.container}>
                <View style={notificationStyles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={notificationStyles.backButton}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
                    </TouchableOpacity>
                    <Text style={notificationStyles.headerTitle}>Thông báo</Text>
                    <View style={{ flex: 1 }} />
                </View>
                <View style={[notificationStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#FBBC05" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={notificationStyles.container}>
            <View style={notificationStyles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={notificationStyles.backButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
                </TouchableOpacity>
                <Text style={notificationStyles.headerTitle}>Thông báo</Text>
                <View style={notificationStyles.headerActions}>
                    {notifications.length > 0 && (
                        <TouchableOpacity
                            onPress={handleClearAll}
                            style={notificationStyles.actionButton}
                            activeOpacity={0.7}
                        >
                            <Text style={notificationStyles.clearAllText}>Xóa tất cả</Text>
                        </TouchableOpacity>
                    )}
                    {notifications.some(n => !n.read) && (
                        <TouchableOpacity
                            onPress={handleMarkAllAsRead}
                            style={notificationStyles.actionButton}
                            activeOpacity={0.7}
                        >
                            <Text style={notificationStyles.markAllReadText}>Đọc tất cả</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {notifications.length === 0 ? (
                <View style={notificationStyles.emptyContainer}>
                    <MaterialIcons name="notifications-off" size={64} color="#CCC" />
                    <Text style={notificationStyles.emptyText}>Chưa có thông báo nào</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#FBBC05"
                        />
                    }
                    contentContainerStyle={notificationStyles.listContainer}
                />
            )}
        </SafeAreaView>
    );
}

