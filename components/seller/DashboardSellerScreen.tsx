import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { storeService } from '../../services/storeService';
import { tokenService } from '../../services/tokenService';
import { userInfoService } from '../../services/userInfoService';
import { dashboardSellerStyles } from './dashboardSellerStyles';
import { SellerBottomNavigation } from './SellerBottomNavigation';
import { SellerTopNavigation } from './SellerTopNavigation';

interface BestSellingProduct {
    id: number;
    name: string;
    price: number;
    sold: number;
    image: string | null;
    rating: number;
}

export default function DashboardSellerScreen() {
    const [storeName, setStoreName] = useState('PetZone Store');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        rating: 4.8
    });
    const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = await tokenService.getToken();
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Fetch user avatar
                const userResponse = await userInfoService.getUserInfo(token);
                setAvatarUrl(userResponse.user.avatarUrl || null);

                // Fetch store name
                const storeData = await storeService.getMyStore(token);
                setStoreName(storeData.store.storeName);

                // Fetch stats
                const statsResponse = await storeService.getSellerStats(token);
                setStats(statsResponse.data);

                // Fetch best selling products
                const productsResponse = await storeService.getBestSellingProducts(token);
                setBestSellingProducts(productsResponse.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <View style={dashboardSellerStyles.container}>
                <SellerTopNavigation />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FBBC05" />
                    <Text style={{ marginTop: 12, color: '#666' }}>Đang tải...</Text>
                </View>
                <SellerBottomNavigation />
            </View>
        );
    }

    return (
        <View style={dashboardSellerStyles.container}>
            <SellerTopNavigation />
            <ScrollView style={dashboardSellerStyles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header Banner */}
                <View style={dashboardSellerStyles.headerBanner}>
                    <View style={dashboardSellerStyles.headerContent}>
                        <Text style={dashboardSellerStyles.welcomeText}>
                            Hi <Text style={dashboardSellerStyles.storeNameText}>{storeName}</Text>
                        </Text>
                        <Image
                            source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/seller-hello.png')}
                            style={dashboardSellerStyles.helloImage}
                            contentFit="cover"
                        />
                    </View>
                </View>

                {/* KPI Cards */}
                <View style={dashboardSellerStyles.kpiContainer}>
                    {/* Tổng doanh thu */}
                    <View style={dashboardSellerStyles.kpiCard}>
                        <View style={dashboardSellerStyles.kpiLeft}>
                            <View style={dashboardSellerStyles.kpiIcon}>
                                <MaterialIcons name="attach-money" size={24} color="#FFFFFF" />
                            </View>
                            <View style={dashboardSellerStyles.kpiInfo}>
                                <Text style={dashboardSellerStyles.kpiTitle}>Tổng doanh thu</Text>
                                <Text style={dashboardSellerStyles.kpiValue}>{formatCurrency(stats.totalRevenue)}</Text>
                            </View>
                        </View>
                        <Text style={dashboardSellerStyles.arrowIcon}>›</Text>
                    </View>

                    {/* Số đơn hàng */}
                    <View style={dashboardSellerStyles.kpiCard}>
                        <View style={dashboardSellerStyles.kpiLeft}>
                            <View style={dashboardSellerStyles.kpiIcon}>
                                <FontAwesome5 name="shopping-cart" size={18} color="#FFFFFF" />
                            </View>
                            <View style={dashboardSellerStyles.kpiInfo}>
                                <Text style={dashboardSellerStyles.kpiTitle}>Số đơn hàng</Text>
                                <Text style={dashboardSellerStyles.kpiValue}>{stats.totalOrders}</Text>
                            </View>
                        </View>
                        <Text style={dashboardSellerStyles.arrowIcon}>›</Text>
                    </View>

                    {/* Sản phẩm */}
                    <View style={dashboardSellerStyles.kpiCard}>
                        <View style={dashboardSellerStyles.kpiLeft}>
                            <View style={dashboardSellerStyles.kpiIcon}>
                                <MaterialIcons name="inventory" size={20} color="#FFFFFF" />
                            </View>
                            <View style={dashboardSellerStyles.kpiInfo}>
                                <Text style={dashboardSellerStyles.kpiTitle}>Sản phẩm</Text>
                                <Text style={dashboardSellerStyles.kpiValue}>{stats.totalProducts}</Text>
                            </View>
                        </View>
                        <Text style={dashboardSellerStyles.arrowIcon}>›</Text>
                    </View>

                    {/* Đánh giá */}
                    <View style={dashboardSellerStyles.kpiCard}>
                        <View style={dashboardSellerStyles.kpiLeft}>
                            <View style={dashboardSellerStyles.kpiIcon}>
                                <AntDesign name="star" size={20} color="#FFFFFF" />
                            </View>
                            <View style={dashboardSellerStyles.kpiInfo}>
                                <Text style={dashboardSellerStyles.kpiTitle}>Đánh giá</Text>
                                <Text style={dashboardSellerStyles.kpiValue}>{stats.rating}</Text>
                            </View>
                        </View>
                        <Text style={dashboardSellerStyles.arrowIcon}>›</Text>
                    </View>
                </View>

                {/* Sản phẩm bán chạy */}
                <View style={dashboardSellerStyles.productsSection}>
                    <Text style={dashboardSellerStyles.productsTitle}>Sản phẩm bán chạy</Text>
                    {bestSellingProducts.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#999', fontSize: 14 }}>Chưa có sản phẩm bán chạy</Text>
                        </View>
                    ) : (
                        bestSellingProducts.map((product) => (
                            <TouchableOpacity key={product.id} style={dashboardSellerStyles.productCard} onPress={() => router.push(`/product?productId=${product.id}`)} activeOpacity={0.7}>
                                <Image
                                    source={product.image ? { uri: product.image } : require('@/assets/images/dog-feet.png')}
                                    style={dashboardSellerStyles.productImage}
                                    contentFit="cover"
                                />
                                <View style={dashboardSellerStyles.productInfo}>
                                    <View>
                                        <Text style={dashboardSellerStyles.productName}>{product.name}</Text>
                                        <View style={dashboardSellerStyles.ratingContainer}>
                                            <Text style={dashboardSellerStyles.productRating}>Đánh giá: {product.rating}</Text>
                                            <AntDesign name="star" size={12} color="#FBBC05" />
                                        </View>
                                    </View>
                                    <View style={dashboardSellerStyles.productBottom}>
                                        <Text style={dashboardSellerStyles.productPrice}>{formatCurrency(product.price)}</Text>
                                        <View style={dashboardSellerStyles.soldButton}>
                                            <Text style={dashboardSellerStyles.soldText}>Đã bán: {product.sold}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            <SellerBottomNavigation />
        </View>
    );
}