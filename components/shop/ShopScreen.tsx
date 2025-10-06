import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    ImageSourcePropType,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import styles from "./shopStyle";

interface Product {
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    discount?: string;
    image: any;
    sold: number;
    shopName: string;
    shopImage?: any;
    category?: string;
    rating: number;
    stock: number;
}

interface Category {
    id: string;
    name: string;
    icon: ImageSourcePropType;
}

const categories = [
    { id: "1", name: "Thức ăn", icon: require("../../assets/images/food-icon.png") },
    { id: "2", name: "Đồ chơi", icon: require("../../assets/images/toy-icon.png") },
    { id: "3", name: "Phụ kiện", icon: require("../../assets/images/accessory-icon.png") },
    { id: "4", name: "Dụng cụ", icon: require("../../assets/images/tool-icon.png") },
    { id: "5", name: "Quần áo", icon: require("../../assets/images/clothes-icon.png") },
];

const products: Product[] = [
    {
        id: "p1",
        name: "Vòng Cổ Màu Vàng Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shopName: "phuong-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 1000,
        category: "Vòng cổ",
        rating: 5,
        image: require("../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
        stock: 12,
    },
    {
        id: "p2",
        name: "Vòng Cổ Màu Đỏ Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shopName: "phuong-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 500,
        category: "Vòng cổ",
        rating: 4.5,
        image: require("../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
        stock: 12,
    },
    {
        id: "p3",
        name: "Vòng Cổ Màu Xanh Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shopName: "phuong-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 800,
        category: "Vòng cổ",
        rating: 4.8,
        image: require("../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
        stock: 12,
    },
    {
        id: "p4",
        name: "Vòng Cổ Màu Hồng Cho Chó Mèo - Sang Trọng, Đẳng Cấp",
        shopName: "phuong-shop",
        shopImage: require("../../assets/images/shop.png"),
        sold: 650,
        category: "Vòng cổ",
        rating: 4.9,
        image: require("../../assets/images/cat.png"),
        price: 94679,
        oldPrice: 105190,
        discount: "-10%",
        stock: 12,
    },
];

export default function ShopScreen() {
    const [activeTab, setActiveTab] = useState<"Sản phẩm" | "Danh mục">("Sản phẩm");

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.card}>
            <View style={styles.imageWrapper}>
                <Image source={item.image} style={styles.productImage} />
                <View style={styles.stockTag}>
                    <Text style={styles.stockTagText}>Còn lại {item.stock}</Text>
                </View>
            </View>

            <Text style={styles.productName} numberOfLines={2}>
                {item.name}
            </Text>

            <View style={styles.priceRow}>
                <Text style={styles.productPrice}>{item.price.toLocaleString()}đ</Text>
                {item.oldPrice && (
                    <Text style={styles.oldPrice}>{item.oldPrice.toLocaleString()}đ</Text>
                )}
                {item.discount && <Text style={styles.discount}>{item.discount}</Text>}
            </View>

            <View style={styles.metaRow}>
                <Text style={styles.soldLabel}>Đã bán {item.sold}</Text>
                <Text style={styles.rating}>★ {item.rating}</Text>
            </View>
        </View>
    );

    const renderCategoryItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
                router.push({
                    pathname: "/seller/shopCategories",
                    params: { parentId: item.id, parentName: item.name },
                })
            }
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image source={item.icon} style={styles.categoryIcon} />
                    <Text style={styles.categoryName}>{item.name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity>
                        <Ionicons name="chevron-back-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cửa hàng của tôi</Text>

                    <View style={styles.iconGroup}>
                        <Ionicons name="notifications-outline" size={22} color="#fff" style={styles.icon} />
                        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" style={styles.icon} />
                        <Ionicons name="search-outline" size={22} color="#fff" style={styles.icon} />
                    </View>
                </View>

                <View style={styles.shopInfo}>
                    <Image
                        source={require("../../assets/images/cat.png")}
                        style={styles.avatar}
                    />
                    <View style={styles.shopTextContainer}>
                        <Text style={styles.shopName}>phuong-shop</Text>
                        <Text style={styles.subText}>★ 4.8 | 100 Người đã mua</Text>
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    {/* Nút thêm sản phẩm */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push("/seller/shopAddProduct")}
                    >
                        <Text style={styles.plusSign}>+</Text>
                        <Text style={styles.addButtonText}>Sản phẩm</Text>
                    </TouchableOpacity>

                    {/* ✅ Nút thêm danh mục - ĐÃ THÊM onPress */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push("/seller/shopAddCategories")}
                    >
                        <Text style={styles.plusSign}>+</Text>
                        <Text style={styles.addButtonText}>Danh mục</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* TABS */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "Sản phẩm" && styles.activeTab]}
                    onPress={() => setActiveTab("Sản phẩm")}
                >
                    <Text
                        style={activeTab === "Sản phẩm" ? styles.activeTabText : styles.tabText}
                    >
                        Sản phẩm ({products.length})
                    </Text>
                </TouchableOpacity>
                <View style={styles.tabDivider} />
                <TouchableOpacity
                    style={[styles.tab, activeTab === "Danh mục" && styles.activeTab]}
                    onPress={() => setActiveTab("Danh mục")}
                >
                    <Text
                        style={activeTab === "Danh mục" ? styles.activeTabText : styles.tabText}
                    >
                        Danh mục ({categories.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* LIST */}
            {activeTab === "Sản phẩm" ? (
                <FlatList
                    key="products"
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <FlatList
                    key="items"
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
