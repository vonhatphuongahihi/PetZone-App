import { DashboardIcon } from '@/assets/svg/seller/DashboardIcon';
import { OrderIcon } from '@/assets/svg/seller/OrderIcon';
import { ProductIcon } from '@/assets/svg/seller/ProductIcon';
import { ProfileIcon } from '@/assets/svg/seller/ProfileIcon';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { sellerBottomNavStyles } from './sellerBottomNavStyles';

interface NavigationItem {
    id: string;
    label: string;
    route: string;
    icon: React.ComponentType<{ color: string; size: number }>;
}

const navigationItems: NavigationItem[] = [
    {
        id: 'dashboard',
        label: 'Tổng quan',
        route: '/seller/dashboard',
        icon: DashboardIcon,
    },
    {
        id: 'store',
        label: 'Cửa hàng',
        route: '/seller/store',
        icon: ProductIcon,
    },
    {
        id: 'orders',
        label: 'Đơn hàng',
        route: '/seller/orders',
        icon: OrderIcon,
    },
    {
        id: 'profile',
        label: 'Tôi',
        route: '/seller/profile',
        icon: ProfileIcon,
    },
];

export const SellerBottomNavigation: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = (route: string) => {
        router.push(route as any);
    };

    return (
        <View style={sellerBottomNavStyles.container}>
            {navigationItems.map((item) => {
                // Check if current pathname matches the route or contains the route segment
                const routeSegment = item.route.split('/').pop() || '';
                const isActive = pathname === item.route ||
                    pathname.includes(routeSegment) ||
                    pathname.includes(`/seller/${routeSegment}`) ||
                    pathname.includes(`/${routeSegment}`);
                const IconComponent = item.icon;

                return (
                    <TouchableOpacity
                        key={item.id}
                        style={sellerBottomNavStyles.navItem}
                        onPress={() => handleNavigation(item.route)}
                        activeOpacity={0.7}
                    >
                        <IconComponent
                            color={isActive ? '#FBBC05' : '#7F8C8D'}
                            size={24}
                        />
                        <Text
                            style={[
                                sellerBottomNavStyles.navLabel,
                                isActive && sellerBottomNavStyles.navLabelActive
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
