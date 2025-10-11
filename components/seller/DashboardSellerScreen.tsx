import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { storeService } from '../../services/storeService';
import { tokenService } from '../../services/tokenService';
import { dashboardSellerStyles } from './dashboardSellerStyles';
import { SellerBottomNavigation } from './SellerBottomNavigation';
import { SellerTopNavigation } from './SellerTopNavigation';

export default function DashboardSellerScreen() {
    const [storeName, setStoreName] = useState('PetZone Store');
    const [loading, setLoading] = useState(true);

    // Mock data - sẽ được thay thế bằng data từ database
    const stats = {
        totalRevenue: 100000000,
        totalOrders: 118,
        totalProducts: 30,
        rating: 4.8
    };

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const token = await tokenService.getToken();
                if (token) {
                    const storeData = await storeService.getMyStore(token);
                    setStoreName(storeData.store.storeName);
                }
            } catch (error) {
                console.error('Error fetching store data:', error);
                // Keep default store name if error
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, []);

    const bestSellingProducts = [
        {
            id: 1,
            name: "Vòng chuông bấm xinh cho mèo",
            rating: 5.0,
            price: 125000,
            sold: 30,
            image: require('@/assets/images/dog-feet.png') // Placeholder
        },
        {
            id: 2,
            name: "Thức ăn khô cho chó",
            rating: 4.8,
            price: 250000,
            sold: 25,
            image: require('@/assets/images/dog-feet.png') // Placeholder
        },
        {
            id: 3,
            name: "Đồ chơi cho mèo",
            rating: 4.9,
            price: 85000,
            sold: 20,
            image: require('@/assets/images/dog-feet.png') // Placeholder
        }
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

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
                            source={require('@/assets/images/seller-hello.png')}
                            style={dashboardSellerStyles.helloImage}
                            contentFit="contain"
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
                                <View style={dashboardSellerStyles.kpiTrend}>
                                    <Text style={dashboardSellerStyles.trendUp}>↗</Text>
                                    <Text style={dashboardSellerStyles.trendUpText}>12%</Text>
                                </View>
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
                                <View style={dashboardSellerStyles.kpiTrend}>
                                    <Text style={dashboardSellerStyles.trendDown}>↘</Text>
                                    <Text style={dashboardSellerStyles.trendDownText}>6%</Text>
                                </View>
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
                    {bestSellingProducts.map((product) => (
                        <View key={product.id} style={dashboardSellerStyles.productCard}>
                            <Image
                                source={product.image}
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
                        </View>
                    ))}
                </View>
            </ScrollView>

            <SellerBottomNavigation />
        </View>
    );
}