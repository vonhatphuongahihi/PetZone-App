import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from '../product-card/ProductCard';
import { productListStyles } from './productListStyles';

// Mock data sản phẩm
const products = [
    {
        id: "p1",
        name: "Vòng Cổ Màu Vàng Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shop: "phuong-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 1000,
        category: "Vòng cổ",
        rating: 5,
        image: require("../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
    },
    {
        id: "p2",
        name: "Vòng Cổ Màu Đỏ Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shop: "pet-shop",
        sold: 500,
        shopImage: require("../../assets/images/shop.png"),
        category: "Vòng cổ",
        rating: 4.5,
        image: require("../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
    },
    {
        id: "p3",
        name: "Vòng Cổ Màu Xanh Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shop: "dog-cat-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 800,
        category: "Vòng cổ",
        rating: 4.8,
        image: require("../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
    },
    {
        id: "p4",
        name: "Vòng Cổ Màu Xanh Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shop: "dog-cat-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 800,
        category: "Vòng cổ",
        rating: 4.8,
        image: require("../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
    }
];

export default function ProductListScreen() {
    const { categoryName } = useLocalSearchParams();
    const router = useRouter();

    const handleProductPress = (product: typeof products[0]) => {
        // Điều hướng đến trang chi tiết sản phẩm
        // router.push(`/product/${product.id}`);
        console.log('Product pressed:', product.name);
    };

    const renderProduct = ({ item }: { item: typeof products[0] }) => (
        <ProductCard 
            product={item} 
            onPress={handleProductPress}
        />
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={productListStyles.container}>
                {/* Header */}
                <View style={productListStyles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                    </TouchableOpacity>
                    <Text style={productListStyles.headerTitle}>{categoryName}</Text>
                </View>

                {/* Danh sách sản phẩm */}
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    contentContainerStyle={{ padding: 12 }}
                />
            </SafeAreaView>
        </>
    );
}
