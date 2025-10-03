import SearchBarWithPopup from "@/components/search-bar-with-popup/SearchBarWithPopup";
import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchResultsStyles } from './searchResultsStyles';

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

const hotProducts=[
    {
        id: 1,
        name: "Vòng Cổ Mạ Vàng Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        price: 94679,
        oldPrice: 105190,
        image: require("../../assets/images/cat.png"),
    },
    {
        id: 2,
        name: "Vòng Cổ Mạ Bạc Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        price: 84679,
        oldPrice: 95000,
        image: require("../../assets/images/cat.png"),
    },
];

export default function SearchResultsScreen() {
    const router = useRouter();

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
                        <FontAwesome5 name="star" size={10} color="#FFD700" solid/>
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


