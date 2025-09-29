import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

    const renderProduct = ({ item }: { item: typeof products[0] }) => (
        <TouchableOpacity
            style={productListStyles.card}
            //   onPress={() => router.push(`/product/${item.id}`)}
        >
            {/* Badge giảm giá */}
            <View style={productListStyles.discountBadge}>
                <Text style={productListStyles.discountText}>{item.discount}</Text>
            </View>

            {/* Ảnh sản phẩm */}
            <Image source={item.image} style={productListStyles.image} />

            {/* Thông tin sản phẩm */}
            <View style={productListStyles.info}>
                {/* Shop */}
                <View style={productListStyles.shopRow}>
                    <Image
                        source={item.shopImage}
                        style={productListStyles.shopAvatar}
                    />
                    <View style={{ marginLeft: 6 }}>
                        <Text style={productListStyles.shopName}>{item.shop}</Text>
                        <Text style={productListStyles.sold}>{item.sold} đã bán</Text>
                    </View>
                </View>

                {/* Danh mục + Rating */}
                <View style={productListStyles.metaRow}>
                    <Text style={productListStyles.categoryText}>{item.category}</Text>
                    <View style={productListStyles.ratingRow}>
                        <FontAwesome5 name="star" size={10} color="#FFD700" solid/>
                        <Text style={productListStyles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                </View>

                {/* Tên sản phẩm */}
                <Text style={productListStyles.productName} numberOfLines={2}>
                    {item.name}
                </Text>

                <Text style={productListStyles.tagline}>Hàng cực hot</Text>

                {/* Giá */}
                <View style={productListStyles.priceRow}>
                    <Text style={productListStyles.price}>
                        {item.price.toLocaleString("vi-VN")}đ
                    </Text>
                    <Text style={productListStyles.oldPrice}>
                        {item.oldPrice.toLocaleString("vi-VN")}đ
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
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
