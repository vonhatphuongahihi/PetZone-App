import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from "react";
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from "../user/product-card/ProductCard";
import SearchBarWithPopup from "../user/search-bar-with-popup/SearchBarWithPopup";
import { homeStyles } from './homeStyles';
// Mock data
const parentCategories = [
    { id: "1", name: "Thức ăn", icon: require("../../assets/images/food-icon.png") },
    { id: "2", name: "Đồ chơi", icon: require("../../assets/images/toy-icon.png") },
    { id: "3", name: "Phụ kiện", icon: require("../../assets/images/accessory-icon.png") },
    { id: "4", name: "Dụng cụ", icon: require("../../assets/images/tool-icon.png") },
    { id: "5", name: "Quần áo", icon: require("../../assets/images/clothes-icon.png") },
];

// Mock data sản phẩm
const todayProducts = [
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
    }
];

const newProducts = [
    {
        id: "p3",
        name: "Thức Ăn Cho Chó Premium Quality",
        shop: "food-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 800,
        category: "Thức ăn",
        rating: 4.8,
        image: require("../../assets/images/cat.png"),
        price: 125000,
        oldPrice: 150000,
        discount: "-17%",
    },
    {
        id: "p4",
        name: "Đồ Chơi Thú Cưng Cao Cấp",
        shop: "toy-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 300,
        category: "Đồ chơi",
        rating: 4.7,
        image: require("../../assets/images/cat.png"),
        price: 85000,
        oldPrice: 95000,
        discount: "-11%",
    }
];

const hotProducts = [
    {
        id: "p5",
        name: "Áo Khoác Cho Chó Mèo Siêu Cute",
        shop: "fashion-pet",
        shopImage: require("../../assets/images/shop.png"),
        sold: 1500,
        category: "Quần áo",
        rating: 4.9,
        image: require("../../assets/images/cat.png"),
        price: 199000,
        oldPrice: 250000,
        discount: "-20%",
    },
    {
        id: "p6",
        name: "Dây Dắt Chó Cao Cấp Da Thật",
        shop: "accessory-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 900,
        category: "Phụ kiện",
        rating: 4.6,
        image: require("../../assets/images/cat.png"),
        price: 156000,
        oldPrice: 180000,
        discount: "-13%",
    }
];

const recentSearches = ["Thức ăn cho chó", "Vòng cổ", "Đồ chơi"];
const hotSearchProducts = [
    { id: 1, name: "Thức ăn Royal Canin", price: 450000, oldPrice: 500000, image: require("../../assets/images/cat.png") },
    { id: 2, name: "Vòng cổ da thật", price: 120000, oldPrice: 150000, image: require("../../assets/images/cat.png") }
];

// Mock data cho top cửa hàng bán chạy
const topStores = [
    {
        id: "s1",
        name: "PetZone Store",
        avatar: require("../../assets/images/shop.png"),
        followerCount: 14,
        soldCount: 1000,
        isFollowed: true,
    },
    {
        id: "s2",
        name: "Pet Paradise Shop",
        avatar: require("../../assets/images/shop.png"),
        followerCount: 20,
        soldCount: 980,
        isFollowed: false,
    },
    {
        id: "s3",
        name: "Happy Pet Store",
        avatar: require("../../assets/images/shop.png"),
        followerCount: 50,
        soldCount: 756,
        isFollowed: false,
    },
    {
        id: "s4",
        name: "Pet Care Center",
        avatar: require("../../assets/images/shop.png"),
        followerCount: 25,
        soldCount: 642,
        isFollowed: true,
    }
];

export default function HomeScreen() {
    // State để quản lý trạng thái follow của các store
    const [storeFollowStates, setStoreFollowStates] = useState<{ [key: string]: boolean }>(() => {
        const initialStates: { [key: string]: boolean } = {};
        topStores.forEach(store => {
            initialStates[store.id] = store.isFollowed;
        });
        return initialStates;
    });

    const handleProductPress = (product: any) => {
        console.log('Product pressed:', product.name);
        // Điều hướng đến trang chi tiết sản phẩm
    };

    const handleToggleFollow = (storeId: string) => {
        setStoreFollowStates(prev => ({
            ...prev,
            [storeId]: !prev[storeId]
        }));
    };

    const renderCategoryItem = ({ item }: { item: typeof parentCategories[0] }) => (
        <TouchableOpacity
            style={homeStyles.categoryItem}
            onPress={() => {
                router.push(`/product-list?categoryId=${item.id}&categoryName=${item.name}`);
            }}
        >
            <View style={homeStyles.categoryIconContainer}>
                <Image source={item.icon} style={homeStyles.categoryIcon} />
                <Text style={homeStyles.categoryText}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderProductItem = ({ item }: { item: any }) => (
        <View style={homeStyles.productWrapper}>
            <ProductCard
                product={item}
                onPress={handleProductPress}
                layout="horizontal"
            />
        </View>
    );

    const renderStoreItem = ({ item }: { item: typeof topStores[0] }) => {
        const isFollowed = storeFollowStates[item.id];

        return (
            <TouchableOpacity style={homeStyles.storeItem}>
                <Image source={item.avatar} style={homeStyles.storeAvatar} />
                <View style={homeStyles.storeInfo}>
                    <Text style={homeStyles.storeName} numberOfLines={2}>{item.name}</Text>
                    <TouchableOpacity
                        style={[
                            homeStyles.followButton,
                            { backgroundColor: isFollowed ? '#E0E0E0' : '#FBBC05' }
                        ]}
                        onPress={() => handleToggleFollow(item.id)}
                    >
                        <Text style={[
                            homeStyles.followButtonText,
                            { color: isFollowed ? '#666' : '#FFF' }
                        ]}>
                            {isFollowed ? "Bỏ theo dõi" : "Theo dõi"}
                        </Text>
                    </TouchableOpacity>
                    <View style={homeStyles.storeStatRow}>
                        <Feather name="users" color="#7F8C8D" size={12} />
                        <Text style={homeStyles.storeStatText}>{item.followerCount} người theo dõi</Text>
                    </View>
                    <View style={homeStyles.storeStatRow}>
                        <Feather name="shopping-bag" color="#7F8C8D" size={12} />
                        <Text style={homeStyles.storeStatText}>{item.soldCount} đã bán</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={homeStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header với Search Bar và Cart */}
                <View style={homeStyles.header}>
                    <View style={homeStyles.searchBarContainer}>
                        <SearchBarWithPopup
                            recentSearches={recentSearches}
                            hotProducts={hotSearchProducts}
                        />
                    </View>
                    <TouchableOpacity
                        style={homeStyles.cartButton}
                        onPress={() => { router.push('/cart'); }}
                    >
                        <MaterialCommunityIcons name="cart" color="#FBBC05" size={30} />
                    </TouchableOpacity>
                </View>

                {/* Banner Hero */}
                <View style={homeStyles.heroBanner}>
                    <View style={homeStyles.heroContent}>
                        {/* Background Image */}
                        <Image
                            source={require("../../assets/images/banner.png")}
                            style={homeStyles.heroBackgroundImage}
                        />
                        {/* Text Content Overlay */}
                        <View style={homeStyles.heroTextContainer}>
                            <Text style={homeStyles.heroSubtitle}>
                                Những sản phẩm tốt nhất{'\n'}cho thú cưng của bạn
                            </Text>
                            <TouchableOpacity style={homeStyles.heroButton} onPress={() => { router.push('/categories'); }}>
                                <Text style={homeStyles.heroButtonText}>Mua ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Categories */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Danh mục</Text>
                    </View>
                    <FlatList
                        data={parentCategories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        scrollEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={homeStyles.categoriesList}
                    />
                </View>

                {/* Gợi ý hôm nay */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Gợi ý hôm nay</Text>
                        <TouchableOpacity>
                            <Text style={homeStyles.viewAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={todayProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        scrollEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={homeStyles.productsList}
                    />
                </View>

                {/* Sản phẩm mới */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Sản phẩm mới</Text>
                        <TouchableOpacity>
                            <Text style={homeStyles.viewAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={newProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        scrollEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={homeStyles.productsList}
                    />
                </View>

                {/* Khuyến mãi HOT */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Khuyến mãi HOT</Text>
                        <TouchableOpacity>
                            <Text style={homeStyles.viewAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={hotProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        scrollEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={homeStyles.productsList}
                    />
                </View>

                {/* Top cửa hàng bán chạy */}
                <View style={homeStyles.section}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Top cửa hàng bán chạy</Text>
                        <TouchableOpacity>
                            <Text style={homeStyles.viewAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Danh sách cửa hàng */}
                    <FlatList
                        data={topStores}
                        renderItem={renderStoreItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        scrollEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={homeStyles.storesList}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}