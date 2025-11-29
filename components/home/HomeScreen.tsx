// src/screens/HomeScreen.tsx
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../config/api";
import { ProductCard } from "../user/product-card/ProductCard";
import SearchBarWithPopup from "../user/search-bar-with-popup/SearchBarWithPopup";
import { homeStyles } from './homeStyles';

const recentSearches = ["Thức ăn cho chó", "Vòng cổ", "Đồ chơi"];
const hotSearchProducts = [
    { id: 1, name: "Thức ăn Royal Canin", price: 450000, oldPrice: 500000, image: require("../../assets/images/cat.png") },
    { id: 2, name: "Vòng cổ da thật", price: 120000, oldPrice: 150000, image: require("../../assets/images/cat.png") },
];

const topStores = [
    { id: "s1", name: "PetZone Store", avatar: require("../../assets/images/shop.png"), followerCount: 14, soldCount: 1000, isFollowed: true },
    { id: "s2", name: "Pet Paradise Shop", avatar: require("../../assets/images/shop.png"), followerCount: 20, soldCount: 980, isFollowed: false },
    { id: "s3", name: "Happy Pet Store", avatar: require("../../assets/images/shop.png"), followerCount: 50, soldCount: 756, isFollowed: false },
    { id: "s4", name: "Pet Care Center", avatar: require("../../assets/images/shop.png"), followerCount: 25, soldCount: 642, isFollowed: true }
];

export default function HomeScreen() {
    const [categories, setCategories] = useState<any[]>([]);
    const [todayProducts, setTodayProducts] = useState<any[]>([]);
    const [newProducts, setNewProducts] = useState<any[]>([]);
    const [hotProducts, setHotProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { refresh } = useLocalSearchParams();

    const [storeFollowStates, setStoreFollowStates] = useState<{ [key: string]: boolean }>(() => {
        const init: any = {};
        topStores.forEach(s => init[s.id] = s.isFollowed);
        return init;
    });

    const handleToggleFollow = (storeId: string) => {
        setStoreFollowStates(prev => ({
            ...prev,
            [storeId]: !prev[storeId],
        }));
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
                fetch(`${API_BASE_URL}/products/today`, { headers }),
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

            await Promise.all([fetchCategories(token), fetchProducts(token)]);
            setLoading(false);
        })();
    }, [refresh]);

    // 🔹 Render danh mục cha
    const renderCategoryItem = ({ item }: any) => (
        <TouchableOpacity
            style={homeStyles.categoryItem}
            onPress={() =>
                router.push(`/categories`)
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
            shop: item.store?.name || "Pet Shop",
            shopImage: item.store?.avatar
                ? { uri: item.store.avatar }
                : require("../../assets/images/shop.png"),
            sold: item.soldCount || 0,
            rating: item.rating || 5,
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
    const renderStoreItem = ({ item }: any) => {
        const isFollowed = storeFollowStates[item.id];

        return (
            <TouchableOpacity style={homeStyles.storeItem}>
                <Image source={item.avatar} style={homeStyles.storeAvatar} />
                <View style={homeStyles.storeInfo}>
                    <Text style={homeStyles.storeName} numberOfLines={2}>{item.name}</Text>

                    <TouchableOpacity
                        style={[homeStyles.followButton, { backgroundColor: isFollowed ? "#E0E0E0" : "#FBBC05" }]}
                        onPress={() => handleToggleFollow(item.id)}
                    >
                        <Text style={[homeStyles.followButtonText, { color: isFollowed ? "#666" : "#FFF" }]}>
                            {isFollowed ? "Bỏ theo dõi" : "Theo dõi"}
                        </Text>
                    </TouchableOpacity>

                    <View style={homeStyles.storeStatRow}>
                        <Feather name="users" size={12} color="#7F8C8D" />
                        <Text style={homeStyles.storeStatText}>{item.followerCount} người theo dõi</Text>
                    </View>

                    <View style={homeStyles.storeStatRow}>
                        <Feather name="shopping-bag" size={12} color="#7F8C8D" />
                        <Text style={homeStyles.storeStatText}>{item.soldCount} đã bán</Text>
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
                            recentSearches={recentSearches}
                            hotProducts={hotSearchProducts}
                        />
                    </View>

                    <TouchableOpacity
                        style={homeStyles.cartButton}
                        onPress={() => router.push('/cart')}
                    >
                        <MaterialCommunityIcons name="cart" color="#FBBC05" size={28} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentInsetAdjustmentBehavior="automatic"
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingTop: 0 }}
                >
                </ScrollView>

                    {/* Banner */}
                    <View style={homeStyles.heroBanner}>
                        <View style={homeStyles.heroContent}>
                            <Image source={require("../../assets/images/banner.png")} style={homeStyles.heroBackgroundImage} />
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