// src/screens/ProductListScreen.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from '../product-card/ProductCard';
import { productListStyles } from './productListStyles';

// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.0.35.227:3001/api';

// Helper: lấy string đầu tiên nếu param là string | string[]
const getFirstString = (param: string | string[] | undefined) =>
    Array.isArray(param) ? param[0] : param;

export default function ProductListScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    // Extract params
    const categoryId = getFirstString(params.categoryId);
    const categoryName = getFirstString(params.categoryName);
    const typeParam = getFirstString(params.type);
    const title = categoryName || (typeParam ? typeParam.toUpperCase() : 'Sản phẩm');

    // State
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // === Hàm gọi API ===
    const fetchProducts = async (pageNum: number = 1, isLoadMore: boolean = false) => {
        if (!hasMore && pageNum > 1) return;

        if (!isLoadMore) setLoading(true);
        else setLoadingMore(true);

        try {
            const token = await AsyncStorage.getItem("jwt_token");
            if (!token) {
                router.replace("/login");
                return;
            }

            let url = '';
            if (categoryId) {
                // Nếu có categoryId, gọi API theo category
                url = `${API_BASE_URL}/products/category/${categoryId}?page=${pageNum}&limit=10`;
            } else {
                // Nếu không, dựa vào type
                switch (typeParam) {
                    case 'today':
                        url = `${API_BASE_URL}/products/today?page=${pageNum}&limit=10`;
                        break;
                    case 'new':
                        url = `${API_BASE_URL}/products/new?page=${pageNum}&limit=10`;
                        break;
                    case 'hot':
                        url = `${API_BASE_URL}/products/hot?page=${pageNum}&limit=10`;
                        break;
                    default:
                        url = `${API_BASE_URL}/products?page=${pageNum}&limit=10`;
                }
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                await AsyncStorage.removeItem("jwt_token");
                Alert.alert("Phiên hết hạn", "Vui lòng đăng nhập lại.", [
                    { text: "OK", onPress: () => router.replace("/login") }
                ]);
                return;
            }

            const data = await res.json();
            if (data.success && data.data?.length > 0) {
                const newProducts = data.data.map((item: any) => ({
                    id: item.id,
                    name: item.title || "Sản phẩm",
                    price: item.price || 0,
                    oldPrice: item.oldPrice,
                    image: item.images?.[0]?.url
                        ? { uri: item.images[0].url }
                        : require("../../../assets/images/cat.png"),
                    shop: item.store?.name || "Pet Shop",
                    shopImage: item.store?.avatar
                        ? { uri: item.store.avatar }
                        : require("../../../assets/images/shop.png"),
                    sold: item.soldCount || 0,
                    rating: item.rating || 5,
                    discount: item.oldPrice
                        ? `-${Math.round((item.oldPrice - item.price) / item.oldPrice * 100)}%`
                        : "",
                    category: item.category?.name || "Chưa phân loại",
                }));

                if (pageNum === 1) setProducts(newProducts);
                else setProducts(prev => [...prev, ...newProducts]);

                setHasMore(data.data.length === 10);
            } else {
                if (pageNum === 1) setProducts([]);
                setHasMore(false);
            }

        } catch (err: any) {
            console.error("Lỗi tải sản phẩm:", err);
            Alert.alert("Lỗi", "Không kết nối được server");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchProducts(1);
    }, [categoryId, typeParam]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchProducts(page + 1, true);
            setPage(prev => prev + 1);
        }
    };

    const handleProductPress = (product: any) => {
        Alert.alert("Thông báo", "Chi tiết sản phẩm đang phát triển!");
    };

    const renderProduct = ({ item }: { item: any }) => (
        <ProductCard product={item} onPress={() => handleProductPress(item)} />
    );

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FBBC05" />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang tải sản phẩm...</Text>
            </SafeAreaView>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={productListStyles.container}>
                {/* Header */}
                <View style={productListStyles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                    </TouchableOpacity>
                    <Text style={productListStyles.headerTitle}>{title}</Text>
                </View>

                {/* Danh sách sản phẩm */}
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    contentContainerStyle={{ padding: 12 }}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator size="small" color="#FBBC05" style={{ margin: 16 }} />
                        ) : null
                    }
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
                            Chưa có sản phẩm
                        </Text>
                    }
                />
            </SafeAreaView>
        </>
    );
}
