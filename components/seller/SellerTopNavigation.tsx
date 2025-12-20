import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSellerOrderNotifications } from '../../hooks/useSellerOrderNotifications';
import { SocketEventEmitter } from '../../services/socketEventEmitter';
import { sellerTopNavStyles } from './sellerTopNavStyles';

export const SellerTopNavigation: React.FC = () => {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const { unreadCount: orderNotificationCount } = useSellerOrderNotifications();

    useEffect(() => {
        // Listen for unread conversation notifications
        const handleUnreadNotification = (data: { conversationId: number }) => {
            setUnreadCount(prev => prev + 1);
        };

        const handleMarkAsRead = (data: { conversationId: number }) => {
            setUnreadCount(prev => Math.max(0, prev - 1));
        };

        SocketEventEmitter.addListener('conversation:unread', handleUnreadNotification);
        SocketEventEmitter.addListener('conversation:read', handleMarkAsRead);

        return () => {
            SocketEventEmitter.removeAllListeners('conversation:unread');
            SocketEventEmitter.removeAllListeners('conversation:read');
        };
    }, []);

    return (
        <View style={sellerTopNavStyles.container}>
            {/* Left side - Logo and Title */}
            <View style={sellerTopNavStyles.leftSection}>
                <View style={sellerTopNavStyles.storeIcon}>
                    <Image
                        source={require('@/assets/images/seller-home-icon.png')}
                        style={sellerTopNavStyles.homeIconImage}
                        contentFit="contain"
                    />
                </View>
                <View style={sellerTopNavStyles.titleContainer}>
                    <Text style={sellerTopNavStyles.petZoneText}>PetZone</Text>
                    <Text style={sellerTopNavStyles.sellerText}>Seller</Text>
                </View>
            </View>

            {/* Right side - Icons */}
            <View style={sellerTopNavStyles.rightSection}>
                <TouchableOpacity
                    style={sellerTopNavStyles.iconButton}
                    onPress={() => router.push('/notifications')}
                >
                    <View style={sellerTopNavStyles.messageIconContainer}>
                        <Image
                            source={require('@/assets/images/seller-bell-icon.png')}
                            style={sellerTopNavStyles.iconImage}
                            contentFit="contain"
                        />
                        {orderNotificationCount > 0 && (
                            <View style={sellerTopNavStyles.badge}>
                                <Text style={sellerTopNavStyles.badgeText}>
                                    {orderNotificationCount > 99 ? '99+' : orderNotificationCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={sellerTopNavStyles.iconButton} onPress={() => router.push('/seller/messages')}>
                    <View style={sellerTopNavStyles.messageIconContainer}>
                        <Image
                            source={require('@/assets/images/seller-mess-icon.png')}
                            style={sellerTopNavStyles.iconImage}
                            contentFit="contain"
                        />
                        {unreadCount > 0 && (
                            <View style={sellerTopNavStyles.badge}>
                                <Text style={sellerTopNavStyles.badgeText}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};
