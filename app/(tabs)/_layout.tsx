import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoriesIcon } from '../../assets/svg/CategoriesIcon';
import { HomeIcon } from '../../assets/svg/HomeIcon';
import { MessagesIcon } from '../../assets/svg/MessagesIcon';
import { ProfileUserIcon } from '../../assets/svg/ProfileUserIcon';
import { SocketEventEmitter } from '../../services/socketEventEmitter';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const [unreadCount, setUnreadCount] = useState<number>(0);

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
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FBBC05',
                tabBarInactiveTintColor: '#8D93A5',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5E5',
                    height: 70 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    paddingTop: 6,
                    marginTop: -23,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color }) => <HomeIcon color={color} size={28} />,
                }}
            />
            <Tabs.Screen
                name="categories"
                options={{
                    title: 'Danh mục',
                    tabBarIcon: ({ color }) => <CategoriesIcon color={color} size={22} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Nhắn tin',
                    tabBarIcon: ({ color }) => (
                        <View style={{ position: 'relative' }}>
                            <MessagesIcon color={color} size={28} />
                            {unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -2,
                                    backgroundColor: '#FF3B30',
                                    borderRadius: 10,
                                    minWidth: 20,
                                    height: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingHorizontal: 6,
                                    borderWidth: 2,
                                    borderColor: '#FFFFFF',
                                }}>
                                    <Text style={{
                                        color: '#FFFFFF',
                                        fontSize: 10,
                                        fontWeight: 'bold',
                                    }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Tôi',
                    tabBarIcon: ({ color }) => <ProfileUserIcon color={color} size={28} />,
                }}
            />
        </Tabs>
    );
}
