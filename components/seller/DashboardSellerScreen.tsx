import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dashboardSellerStyles } from './dashboardSellerStyles';
import { SellerBottomNavigation } from './SellerBottomNavigation';

export default function DashboardSellerScreen() {
    const handleLogout = () => {
        router.replace('/login');
    };

    return (
        <SafeAreaView style={dashboardSellerStyles.container}>
            <View style={dashboardSellerStyles.header}>
                <View style={dashboardSellerStyles.headerContent}>
                    <View style={dashboardSellerStyles.iconContainer}>
                        <Image
                            source={require('@/assets/images/dog-feet.png')}
                            style={dashboardSellerStyles.headerIcon}
                            contentFit="contain"
                        />
                    </View>
                    <Text style={dashboardSellerStyles.headerTitle}>Dashboard Seller</Text>
                    <Text style={dashboardSellerStyles.headerSubtitle}>Quản lý cửa hàng của bạn</Text>
                </View>
            </View>

            <View style={dashboardSellerStyles.content}>
                <View style={dashboardSellerStyles.emptyState}>
                    <View style={dashboardSellerStyles.emptyIconContainer}>
                        <Text style={dashboardSellerStyles.emptyIcon}>🏪</Text>
                    </View>
                    <Text style={dashboardSellerStyles.emptyTitle}>Chào mừng đến với Dashboard!</Text>
                    <Text style={dashboardSellerStyles.emptyDescription}>
                        Cửa hàng của bạn đã được tạo thành công.{'\n'}
                        Tính năng quản lý cửa hàng đang được phát triển.
                    </Text>
                </View>

                <View style={dashboardSellerStyles.actions}>
                    <TouchableOpacity
                        style={dashboardSellerStyles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={dashboardSellerStyles.logoutButtonText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <SellerBottomNavigation />
        </SafeAreaView>
    );
}
