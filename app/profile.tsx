import ProfileScreen from '@/components/user/profile/ProfileScreen';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoriesIcon } from '../assets/svg/CategoriesIcon';
import { HomeIcon } from '../assets/svg/HomeIcon';
import { MessagesIcon } from '../assets/svg/MessagesIcon';
import { ProfileUserIcon } from '../assets/svg/ProfileUserIcon';

export default function ProfilePage() {
    const insets = useSafeAreaInsets();

    const navigateToTab = (tabName: string) => {
        router.push(`/${tabName}` as any);
    };

    return (
        <View style={{ flex: 1 }}>
            <ProfileScreen />
            
            {/* Bottom Navigation Bar */}
            <View style={{
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#E5E5E5',
                height: 70 + insets.bottom,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                paddingTop: 6,
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
            }}>
                {/* Trang chủ */}
                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => router.push('/')}
                >
                    <HomeIcon color="#8D93A5" size={28} />
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: '#8D93A5',
                        marginTop: 2,
                    }}>
                        Trang chủ
                    </Text>
                </TouchableOpacity>

                {/* Danh mục */}
                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => navigateToTab('categories')}
                >
                    <CategoriesIcon color="#8D93A5" size={22} />
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: '#8D93A5',
                        marginTop: 2,
                    }}>
                        Danh mục
                    </Text>
                </TouchableOpacity>

                {/* Nhắn tin */}
                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => navigateToTab('messages')}
                >
                    <MessagesIcon color="#8D93A5" size={28} />
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: '#8D93A5',
                        marginTop: 2,
                    }}>
                        Nhắn tin
                    </Text>
                </TouchableOpacity>

                {/* Tôi - Active */}
                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ProfileUserIcon color="#FBBC05" size={28} />
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: '#FBBC05',
                        marginTop: 2,
                    }}>
                        Tôi
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}