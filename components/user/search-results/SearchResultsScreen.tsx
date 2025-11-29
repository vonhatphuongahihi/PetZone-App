import SearchBarWithPopup from "@/components/user/search-bar-with-popup/SearchBarWithPopup";
import { API_BASE_URL } from "@/config/api";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchResultsStyles } from './searchResultsStyles';

// Mock data sản phẩm
const products = [
    {
        id: "p1",
        name: "Vòng Cổ Màu Vàng Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shop: "phuong-shop",
        shopImage: require("../../../assets/images/shop.png"),
        sold: 1000,
        category: "Vòng cổ",
        rating: 5,
        image: require("../../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
    },
    {
        id: "p2",
        name: "Vòng Cổ Màu Đỏ Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shop: "pet-shop",
        sold: 500,
        shopImage: require("../../../assets/images/shop.png"),
        category: "Vòng cổ",
        rating: 4.5,
        image: require("../../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
    },
    {
        id: "p3",
        name: "Vòng Cổ Màu Xanh Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shop: "dog-cat-shop",
        shopImage: require("../../../assets/images/shop.png"),
        sold: 800,
        category: "Vòng cổ",
        rating: 4.8,
        image: require("../../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
    },
    {
        id: "p4",
        name: "Vòng Cổ Màu Xanh Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shop: "dog-cat-shop",
        shopImage: require("../../../assets/images/shop.png"),
        sold: 800,
        category: "Vòng cổ",
        rating: 4.8,
        image: require("../../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
    }
];

const hotProducts = [
    {
        id: 1,
        name: "Vòng Cổ Mạ Vàng Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        price: 94679,
        oldPrice: 105190,
        image: require("../../../assets/images/cat.png"),
    },
    {
        id: 2,
        name: "Vòng Cổ Mạ Bạc Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        price: 84679,
        oldPrice: 95000,
        image: require("../../../assets/images/cat.png"),
    },
];

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
                const token = await AsyncStorage.getItem("accessToken");
                const res = await fetch(`${API_BASE_URL}/api/products/search?q=${q}`, {
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
                const res = await fetch(`${API_BASE_URL}/api/products/hot`);
                const data = await res.json();
                if (data.success) setHotProducts(data.data);
            } catch (error) {
                console.error("Error fetching hot products:", error);
            }
        };

        fetchHotProducts();
    }, []);


    const renderProduct = ({ item }: { item: typeof products[0] }) => (
        <TouchableOpacity
            style={SearchResultsStyles.card}
        //   onPress={() => router.push(`/product/${item.id}`)}
        >
            {/* Badge giảm giá */}
            <View style={SearchResultsStyles.discountBadge}>
                <Text style={SearchResultsStyles.discountText}>{item.discount}</Text>
            </View>

            {/* Ảnh sản phẩm */}
            <Image source={item.image} style={SearchResultsStyles.image} />

            {/* Thông tin sản phẩm */}
            <View style={SearchResultsStyles.info}>
                {/* Shop */}
                <View style={SearchResultsStyles.shopRow}>
                    <Image
                        source={item.shopImage}
                        style={SearchResultsStyles.shopAvatar}
                    />
                    <View style={{ marginLeft: 6 }}>
                        <Text style={SearchResultsStyles.shopName}>{item.shop}</Text>
                        <Text style={SearchResultsStyles.sold}>{item.sold} đã bán</Text>
                    </View>
                </View>

                {/* Danh mục + Rating */}
                <View style={SearchResultsStyles.metaRow}>
                    <Text style={SearchResultsStyles.categoryText}>{item.category}</Text>
                    <View style={SearchResultsStyles.ratingRow}>
                        <FontAwesome5 name="star" size={10} color="#FFD700" solid />
                        <Text style={SearchResultsStyles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                </View>

                {/* Tên sản phẩm */}
                <Text style={SearchResultsStyles.productName} numberOfLines={2}>
                    {item.name}
                </Text>

                <Text style={SearchResultsStyles.tagline}>Hàng cực hot</Text>

                {/* Giá */}
                <View style={SearchResultsStyles.priceRow}>
                    <Text style={SearchResultsStyles.price}>
                        {item.price.toLocaleString("vi-VN")}đ
                    </Text>
                    <Text style={SearchResultsStyles.oldPrice}>
                        {item.oldPrice.toLocaleString("vi-VN")}đ
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                        recentSearches={["cỏ mèo", "cát vệ sinh trà xanh", "áo cho mèo", "dây dắt"]}
                        hotProducts={hotProducts}
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
                            Không tìm thấy sản phẩm nào cho "{q}"
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


