// src/screens/HomeScreen.tsx
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    FlatList,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from '../../config/api';
import { useOrderNotifications } from "../../hooks/useOrderNotifications";
import { cartService } from "../../services/cartService";
import { storeService } from "../../services/storeService";
import { tokenService } from "../../services/tokenService";
import { ProductCard } from "../user/product-card/ProductCard";
import SearchBarWithPopup from "../user/search-bar-with-popup/SearchBarWithPopup";
import { homeStyles } from './homeStyles';

const recentSearches = ["Thức ăn cho chó", "Vòng cổ", "Đồ chơi"];
const hotSearchProducts = [
    { id: 1, name: "Thức ăn Royal Canin", price: 450000, oldPrice: 500000, image: require("../../assets/images/cat.png") },
    { id: 2, name: "Vòng cổ da thật", price: 120000, oldPrice: 150000, image: require("../../assets/images/cat.png") },
];

interface TopStore {
    id: string;
    storeName: string;
    avatarUrl?: string;
    sellerAvatarUrl?: string;
    followersCount: number;
    totalOrders: number;
    isFollowing?: boolean;
}

export default function HomeScreen() {
    const [categories, setCategories] = useState<any[]>([]);
    const [todayProducts, setTodayProducts] = useState<any[]>([]);
    const [newProducts, setNewProducts] = useState<any[]>([]);
    const [hotProducts, setHotProducts] = useState<any[]>([]);
    const [topStores, setTopStores] = useState<TopStore[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartItemCount, setCartItemCount] = useState(0);
    const { unreadCount: notificationCount } = useOrderNotifications();

    const { refresh } = useLocalSearchParams();

    const handleToggleFollow = async (storeId: string) => {
        try {
            const token = await tokenService.getToken();
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để theo dõi cửa hàng');
                return;
            }

            const store = topStores.find(s => s.id === storeId);
            const isCurrentlyFollowing = store?.isFollowing || false;

            // Use followStore endpoint which now toggles follow/unfollow
            const response = await storeService.followStore(storeId, token);
            const newFollowingState = (response as any).isFollowing !== undefined ? (response as any).isFollowing : !isCurrentlyFollowing;

            // Update local state
            setTopStores(prev => prev.map(s =>
                s.id === storeId
                    ? {
                        ...s,
                        isFollowing: newFollowingState,
                        followersCount: newFollowingState
                            ? s.followersCount + 1
                            : Math.max(0, s.followersCount - 1)
                    }
                    : s
            ));
        } catch (error: any) {
            console.error('Toggle follow error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể thay đổi trạng thái theo dõi');
        }
    };

    // 🔹 Fetch danh mục cha
    const fetchCategories = async (token: string) => {
        try {
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
            const res = await fetch(`${API_BASE_URL}/categories`, { headers });

            if (res.status === 401) {
                await AsyncStorage.removeItem("jwt_token");
                Alert.alert("Phiên hết hạn", "Vui lòng đăng nhập lại.", [
                    { text: "OK", onPress: () => router.replace("/login") }
                ]);
                return;
            }

            const json = await res.json();
            if (json.success) setCategories(json.data);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            Alert.alert("Lỗi", "Không tải được danh mục");
        }
    };

    // 🔹 Fetch sản phẩm
    const fetchProducts = async (token: string) => {
        try {
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
            const [todayRes, newRes, hotRes] = await Promise.all([
                fetch(`${API_BASE_URL}/products/today?limit=10`, { headers }),
                fetch(`${API_BASE_URL}/products/new`, { headers }),
                fetch(`${API_BASE_URL}/products/hot`, { headers }),
            ]);

            if (todayRes.status === 401 || newRes.status === 401 || hotRes.status === 401) {
                await AsyncStorage.removeItem("jwt_token");
                Alert.alert("Phiên hết hạn", "Vui lòng đăng nhập lại.", [
                    { text: "OK", onPress: () => router.replace("/login") }
                ]);
                return;
            }

            const today = await todayRes.json();
            const newP = await newRes.json();
            const hot = await hotRes.json();

            setTodayProducts(today.success ? today.data : []);
            setNewProducts(newP.success ? newP.data : []);
            setHotProducts(hot.success ? hot.data : []);
        } catch (err) {
            console.error("Lỗi API:", err);
            Alert.alert("Lỗi", "Không kết nối được server");
        }
    };

    // 🔹 Fetch top stores
    const fetchTopStores = async (token?: string, preserveFollowState: boolean = false) => {
        try {
            const result = await storeService.getTopStores(token, 10);
            if (result.success) {
                setTopStores(prevStores => {
                    const newStores = result.data.map(store => {
                        // Nếu preserveFollowState = true, giữ lại trạng thái follow hiện tại
                        if (preserveFollowState) {
                            const existingStore = prevStores.find(s => s.id === store.id);
                            return {
                                id: store.id,
                                storeName: store.storeName,
                                avatarUrl: store.avatarUrl || (store as any).sellerAvatarUrl || (store as any).user?.avatarUrl || undefined,
                                sellerAvatarUrl: (store as any).sellerAvatarUrl || (store as any).user?.avatarUrl,
                                followersCount: store.followersCount,
                                totalOrders: store.totalOrders,
                                isFollowing: existingStore?.isFollowing !== undefined
                                    ? existingStore.isFollowing
                                    : (store.isFollowing !== undefined ? store.isFollowing : false)
                            };
                        }
                        // Nếu không, dùng giá trị từ API (ưu tiên giá trị từ API, nếu undefined thì false)
                        return {
                            id: store.id,
                            storeName: store.storeName,
                            avatarUrl: store.avatarUrl || (store as any).sellerAvatarUrl || (store as any).user?.avatarUrl || undefined,
                            sellerAvatarUrl: (store as any).sellerAvatarUrl || (store as any).user?.avatarUrl,
                            followersCount: store.followersCount,
                            totalOrders: store.totalOrders,
                            isFollowing: store.isFollowing !== undefined ? Boolean(store.isFollowing) : false
                        };
                    });
                    return newStores;
                });
            }
        } catch (error) {
            console.error("Lỗi tải cửa hàng:", error);
            // Không hiển thị alert để không làm gián đoạn trải nghiệm
        }
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            const token = await AsyncStorage.getItem("jwt_token");

            if (!token) {
                Alert.alert("Lỗi", "Bạn chưa đăng nhập", [
                    { text: "OK", onPress: () => router.replace("/login") }
                ]);
                setLoading(false);
                return;
            }

            await Promise.all([
                fetchCategories(token),
                fetchProducts(token),
                fetchTopStores(token, false) // Lần đầu load, không preserve state
            ]);
            setLoading(false);
        })();
    }, [refresh]);

    // Listen for follow status changes from UserShopScreen
    useEffect(() => {
        const followSubscription = DeviceEventEmitter.addListener('store_follow_changed', (data: { storeId: string; isFollowing: boolean; followersCount: number }) => {
            setTopStores(prev => prev.map(s =>
                s.id === data.storeId
                    ? {
                        ...s,
                        isFollowing: data.isFollowing,
                        followersCount: data.followersCount
                    }
                    : s
            ));
        });

        // Listen for order status updates to refresh product data (soldCount)
        const orderUpdateSubscription = DeviceEventEmitter.addListener('order_status_updated', async () => {
            const token = await AsyncStorage.getItem("jwt_token");
            if (token) {
                await fetchProducts(token); // Refresh products to get updated soldCount
            }
        });

        return () => {
            followSubscription.remove();
            orderUpdateSubscription.remove();
        };
    }, []);

    // Fetch cart count
    const fetchCartCount = useCallback(async () => {
        try {
            const token = await tokenService.getToken();
            if (!token) {
                setCartItemCount(0);
                return;
            }
            const response = await cartService.getCart(token);
            if (response.success) {
                const totalQuantity = response.data.reduce((sum, item) => sum + item.quantity, 0);
                setCartItemCount(totalQuantity);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
            setCartItemCount(0);
        }
    }, []);

    // Fetch cart count on mount
    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    // Refresh data when screen is focused to get updated soldCount
    useFocusEffect(
        React.useCallback(() => {
            const refreshData = async () => {
                const token = await AsyncStorage.getItem("jwt_token");
                if (token) {
                    // Refresh both products (to get updated soldCount) and stores
                    await Promise.all([
                        fetchProducts(token), // Refresh products to get updated soldCount
                        fetchTopStores(token, true) // Preserve follow state when refreshing
                    ]);
                }
            };
            refreshData();
            fetchCartCount(); // Refresh cart count when screen is focused
        }, [fetchCartCount])
    );

    // 🔹 Render danh mục cha
    const renderCategoryItem = ({ item }: any) => (
        <TouchableOpacity
            style={homeStyles.categoryItem}
            onPress={() =>
                router.push({
                    pathname: '/child-categories' as any,
                    params: {
                        parentId: item.id.toString(),
                        parentName: item.name,
                        parentImage: item.image || ''
                    }
                })
            }
        >
            <View style={homeStyles.categoryIconContainer}>
                {/* 🔹 Paste ảnh cho danh mục tại đây */}
                <Image
                    source={
                        item.image
                            ? { uri: item.image }
                            : require("../../assets/images/food-icon.png") // <-- paste ảnh local mặc định
                    }
                    style={homeStyles.categoryIcon}
                    resizeMode="contain"
                />
            </View>
            <Text style={homeStyles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
    );

    // 🔹 Render sản phẩm
    const renderProductItem = ({ item }: { item: any }) => {
        const productForCard = {
            id: item.id,
            name: item.title || "Sản phẩm",
            price: item.price || 0,
            oldPrice: item.oldPrice,
            image: item.images?.[0]?.url
                ? { uri: item.images[0].url }
                : require("../../assets/images/cat.png"),
            shop: item.store?.storeName || "Pet Shop",
            shopImage: item.store?.avatarUrl || item.store?.user?.avatarUrl
                ? { uri: item.store?.avatarUrl || item.store?.user?.avatarUrl }
                : require("../../assets/images/shop.jpg"),
            sold: item.soldCount || 0,
            rating: item.avgRating || 5,
            discount: item.oldPrice
                ? `-${Math.round((item.oldPrice - item.price) / item.oldPrice * 100)}%`
                : "",
            category: item.category?.name || "Chưa phân loại",
        };

        return (
            <View style={homeStyles.productWrapper}>
                <ProductCard
                    product={productForCard}
                    onPress={() => router.push(`/product?productId=${item.id}`)}
                    layout="horizontal"
                />
            </View>
        );
    };

    // 🔹 Render cửa hàng
    const renderStoreItem = ({ item }: { item: TopStore }) => {
        const isFollowed = item.isFollowing || false;

        return (
            <TouchableOpacity
                style={homeStyles.storeItem}
                onPress={() => router.push({
                    pathname: "/shop",
                    params: {
                        storeId: item.id,
                        isFollowing: item.isFollowing ? "true" : "false"
                    }
                })}
            >
                <Image
                    source={item.avatarUrl || item.sellerAvatarUrl
                        ? { uri: item.avatarUrl || item.sellerAvatarUrl }
                        : require("../../assets/images/shop.jpg")
                    }
                    style={homeStyles.storeAvatar}
                    resizeMode="cover"
                />
                <View style={homeStyles.storeInfo}>
                    <Text style={homeStyles.storeName} numberOfLines={2}>{item.storeName}</Text>

                    <TouchableOpacity
                        style={[homeStyles.followButton, { backgroundColor: isFollowed ? "#E0E0E0" : "#FBBC05" }]}
                        onPress={() => handleToggleFollow(item.id)}
                    >
                        <Text style={[homeStyles.followButtonText, { color: isFollowed ? "#666" : "#FFF" }]}>
                            {isFollowed ? "Đã theo dõi" : "Theo dõi"}
                        </Text>
                    </TouchableOpacity>

                    <View style={homeStyles.storeStatRow}>
                        <Feather name="users" size={12} color="#7F8C8D" />
                        <Text style={homeStyles.storeStatText}>{item.followersCount} người theo dõi</Text>
                    </View>

                    <View style={homeStyles.storeStatRow}>
                        <Feather name="shopping-bag" size={12} color="#7F8C8D" />
                        <Text style={homeStyles.storeStatText}>{item.totalOrders} đơn hàng</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FBBC05" />
                <Text style={{ marginTop: 10, color: "#666" }}>Đang tải...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={homeStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false} >
                <View style={homeStyles.fixedHeader}>
                    <View style={homeStyles.searchBarContainer}>
                        <SearchBarWithPopup
                        //recentSearches={recentSearches}
                        //hotProducts={hotSearchProducts}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity
                            style={homeStyles.cartButton}
                            onPress={() => router.push('/chatbot')}
                        >
                            <MaterialCommunityIcons name="robot-happy-outline" color="#FBBC05" size={30} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={homeStyles.cartButton}
                            onPress={() => router.push('/notifications')}
                        >
                            <MaterialCommunityIcons name="bell" color="#FBBC05" size={28} />
                            {notificationCount > 0 && (
                                <View style={homeStyles.cartBadge}>
                                    <Text style={homeStyles.cartBadgeText}>
                                        {notificationCount > 99 ? '99+' : notificationCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={homeStyles.cartButton}
                            onPress={() => router.push('/cart')}
                        >
                            <MaterialCommunityIcons name="cart" color="#FBBC05" size={28} />
                            {cartItemCount > 0 && (
                                <View style={homeStyles.cartBadge}>
                                    <Text style={homeStyles.cartBadgeText}>
                                        {cartItemCount > 99 ? '99+' : cartItemCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Banner */}
                <View style={homeStyles.heroBanner}>
                    <View style={homeStyles.heroContent}>
                        <Image
                            source={require("../../assets/images/banner.png")}
                            style={homeStyles.heroBackgroundImage}
                            resizeMode="cover"
                        />
                        <View style={homeStyles.heroTextContainer}>
                            <Text style={homeStyles.heroSubtitle}>
                                Những sản phẩm tốt nhất{'\n'}cho thú cưng của bạn
                            </Text>
                            <TouchableOpacity style={homeStyles.heroButton} onPress={() => router.push('/categories')}>
                                <Text style={homeStyles.heroButtonText}>Mua ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Danh mục */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Danh mục</Text>
                    </View>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={homeStyles.categoriesList}
                    />
                </View>

                {/* Gợi ý hôm nay */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Gợi ý hôm nay</Text>
                        <TouchableOpacity onPress={() => router.push({ pathname: '/product-list', params: { title: 'Gợi ý hôm nay', type: 'today' } })}>
                            <Text style={homeStyles.viewAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={todayProducts}
                        renderItem={renderProductItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={homeStyles.productsList}
                    />
                </View>

                {/* Sản phẩm mới */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Sản phẩm mới</Text>
                        <TouchableOpacity onPress={() => router.push({ pathname: '/product-list', params: { title: 'Sản phẩm mới', type: 'new' } })}>
                            <Text style={homeStyles.viewAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={newProducts}
                        renderItem={renderProductItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={homeStyles.productsList}
                    />
                </View>

                {/* Khuyến mãi HOT */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Khuyến mãi HOT</Text>
                        <TouchableOpacity onPress={() => router.push({ pathname: '/product-list', params: { title: 'Khuyến mãi HOT', type: 'hot' } })}>
                            <Text style={homeStyles.viewAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={hotProducts}
                        renderItem={renderProductItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={homeStyles.productsList}
                    />
                </View>

                {/* Cửa hàng nổi bật */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Cửa hàng nổi bật</Text>
                    </View>
                    <FlatList
                        data={topStores}
                        renderItem={renderStoreItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingLeft: 16, paddingBottom: 8 }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}