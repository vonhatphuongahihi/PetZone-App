import SearchBarWithPopup from "@/components/user/search-bar-with-popup/SearchBarWithPopup";
import { API_BASE_URL } from "@/config/api";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from "../../user/product-card/ProductCard";
import { SearchResultsStyles } from './searchResultsStyles';

export default function SearchResultsScreen() {
    const router = useRouter();
    const { q } = useLocalSearchParams();

    const [products, setProducts] = useState<any[]>([]);
    const [hotProducts, setHotProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true)

    // === TÌM KIẾM THEO TỪ KHÓA ===
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!q || q === "") {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const token = await AsyncStorage.getItem("jwt_token");
                const res = await fetch(`${API_BASE_URL}/products/search?q=${q}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setProducts(data.success ? data.data : []);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [q]);

    // === LẤY SẢN PHẨM HOT CHO SEARCH BAR ===
    useEffect(() => {
        const fetchHotProducts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/products/hot`);
                const data = await res.json();
                if (data.success) setHotProducts(data.data);
            } catch (error) {
                console.error("Error fetching hot products:", error);
            }
        };

        fetchHotProducts();
    }, []);

    const handleProductPress = (productId: number) => {
        router.push({
            pathname: "/product",
            params: { id: productId.toString() },
        });
    };
    const renderProduct = ({ item }: { item: any }) => {
        const productForCard = {
            id: item.id.toString(),
            name: item.title || "Sản phẩm không tên",
            price: Number(item.price) || 0,
            oldPrice: item.oldPrice ? Number(item.oldPrice) : 0,
            image: item.images?.[0]?.url
                ? { uri: item.images[0].url }
                : require("../../../assets/images/cat.png"),
            shop: item.store?.storeName || "Pet Shop",
            shopImage: item.store?.user?.avatarUrl
                ? { uri: item.store.user.avatarUrl }
                : require("../../../assets/images/shop.jpg"),
            sold: Math.floor(Math.random() * 800) + 100,
            rating: 5.0,
            discount: item.oldPrice
                ? `-${Math.round(((Number(item.oldPrice) - Number(item.price)) / Number(item.oldPrice)) * 100)}%`
                : "",
            category: "Pet",
            tag: "Hàng cực hot",
        };

        return (
            <View style={{ marginBottom: 16, width: "50%", paddingHorizontal: 8 }}>
                <ProductCard
                    product={productForCard}
                    onPress={() => handleProductPress(item.id)}
                    layout="horizontal"
                />
            </View>
        );
    };
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={SearchResultsStyles.container}>
                {/* Header */}
                <View style={SearchResultsStyles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                    </TouchableOpacity>
                    <SearchBarWithPopup
                    //recentSearches={["cỏ mèo", "cát vệ sinh trà xanh", "áo cho mèo", "dây dắt"]}
                    //hotProducts={hotProducts}
                    />
                </View>

                {/* Danh sách sản phẩm */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#FBBC05" />
                        <Text style={{ marginTop: 10 }}>Đang tìm kiếm...</Text>
                    </View>
                ) : products.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 16, color: "#666" }}>
                            Không tìm thấy sản phẩm nào cho &quot;{q}&quot;
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: "space-between" }}
                        contentContainerStyle={{ padding: 12 }}
                    />
                )}
            </SafeAreaView>
        </>
    );
}


