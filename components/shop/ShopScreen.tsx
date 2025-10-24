import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Image,
    ImageSourcePropType,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Category as ApiCategory, categoryService } from "../../services/categoryService";
import { Product as ApiProduct, productService } from "../../services/productService";
import { Store, storeService } from "../../services/storeService";
import { tokenService } from "../../services/tokenService";
import { SellerBottomNavigation } from "../seller/SellerBottomNavigation";
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
    parentId?: string;
}

export default function ShopScreen() {
    const [activeTab, setActiveTab] = useState<"Sản phẩm" | "Danh mục">("Sản phẩm");
    const [store, setStore] = useState<Store | null>(null);
    const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
    const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [shouldRefresh, setShouldRefresh] = useState(false);

    // Hàm fetch dữ liệu chính
    const fetchData = useCallback(async () => {
        try {
            console.log("🔄 Fetching shop data...");
            setLoading(true);
            const token = await tokenService.getToken();
            if (token) {
                const storeResponse = await storeService.getMyStore(token);
                setStore(storeResponse.store);
                console.log("Store loaded:", storeResponse.store.storeName);

                const productsResponse = await productService.getProductsByStore(storeResponse.store.id, token);
                setApiProducts(productsResponse.data);
                console.log("Products loaded:", productsResponse.data.length);

                const categoriesResponse = await categoryService.getAllCategories(token);
                setApiCategories(categoriesResponse.data);
                console.log("Categories loaded:", categoriesResponse.data.length);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Test API nhanh
    const testAPI = useCallback(async () => {
        try {
            console.log("🧪 Testing API...");
            const token = await tokenService.getToken();
            if (token) {
                const response = await fetch("http://192.168.1.147:3001/api/categories", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                console.log("API Test Result:", data);
            }
        } catch (err) {
            console.error("API Test Error:", err);
        }
    }, []);

    // Lần đầu load dữ liệu
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Refresh khi quay lại màn hình
    useFocusEffect(
        useCallback(() => {
            console.log("Shop screen focused, refreshing data...");
            setShouldRefresh(true);
        }, [])
    );

    // Khi flag shouldRefresh bật
    useEffect(() => {
        if (shouldRefresh) {
            fetchData();
            setShouldRefresh(false);
        }
    }, [shouldRefresh, fetchData]);

    // Refresh định kỳ mỗi 30s
    useEffect(() => {
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const renderItem = ({ item }: { item: ApiProduct }) => (
        <View style={styles.card}>
            <View style={styles.imageWrapper}>
                <Image
                    source={
                        item.images && item.images.length > 0
                            ? { uri: item.images[0].url }
                            : require("../../assets/images/cat.png")
                    }
                    style={styles.productImage}
                />
                <View style={styles.stockTag}>
                    <Text style={styles.stockTagText}>Còn lại {item.quantity}</Text>
                </View>
            </View>

            <Text style={styles.productName} numberOfLines={2}>
                {item.title}
            </Text>

            <View style={styles.priceRow}>
                <Text style={styles.productPrice}>{Number(item.price).toLocaleString()}đ</Text>
                {item.oldPrice && (
                    <>
                        <Text style={styles.oldPrice}>
                            {Number(item.oldPrice).toLocaleString()}đ
                        </Text>
                        <Text style={styles.discount}>
                            -{Math.round((1 - Number(item.price) / Number(item.oldPrice)) * 100)}%
                        </Text>
                    </>
                )}
            </View>

            <View style={styles.metaRow}>
                <Text style={styles.soldLabel}>Đã bán {item.totalReviews}</Text>
                <Text style={styles.rating}>★ {Number(item.avgRating).toFixed(1)}</Text>
            </View>
        </View>
    );

    const renderCategoryItem = ({ item }: { item: ApiCategory }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
                router.push({
                    pathname: "/seller/shopCategories",
                    params: { parentId: item.id, parentName: item.name },
                })
            }
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                    source={
                        item.image
                            ? { uri: item.image }
                            : require("../../assets/images/food-icon.png")
                    }
                    style={styles.categoryIcon}
                />
                <Text style={styles.categoryName}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.push("/seller/dashboard")}>
                        <Ionicons name="chevron-back-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cửa hàng của tôi</Text>

                    <View style={styles.iconGroup}>
                        <TouchableOpacity onPress={testAPI}>
                            <Ionicons name="bug-outline" size={22} color="#fff" style={styles.icon} />
                        </TouchableOpacity>
                        <Ionicons name="notifications-outline" size={22} color="#fff" style={styles.icon} />
                        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" style={styles.icon} />
                        <Ionicons name="search-outline" size={22} color="#fff" style={styles.icon} />
                    </View>
                </View>

                <View style={styles.shopInfo}>
                    <Image source={require("../../assets/images/cat.png")} style={styles.avatar} />
                    <View style={styles.shopTextContainer}>
                        <Text style={styles.shopName}>
                            {store?.storeName || "phuong-shop"}
                        </Text>
                        <Text style={styles.subText}>
                            ★ {store?.rating ? Number(store.rating).toFixed(1) : "4.8"} |{" "}
                            {store?.totalOrders || 100} Người đã mua
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push("/seller/shopAddProduct")}
                    >
                        <Text style={styles.plusSign}>+</Text>
                        <Text style={styles.addButtonText}>Sản phẩm</Text>
                    </TouchableOpacity>

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
                    <Text style={activeTab === "Sản phẩm" ? styles.activeTabText : styles.tabText}>
                        Sản phẩm ({apiProducts.length})
                    </Text>
                </TouchableOpacity>
                <View style={styles.tabDivider} />
                <TouchableOpacity
                    style={[styles.tab, activeTab === "Danh mục" && styles.activeTab]}
                    onPress={() => setActiveTab("Danh mục")}
                >
                    <Text style={activeTab === "Danh mục" ? styles.activeTabText : styles.tabText}>
                        Danh mục ({apiCategories.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* LIST */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text>Đang tải dữ liệu...</Text>
                </View>
            ) : activeTab === "Sản phẩm" ? (
                <FlatList
                    key="products"
                    data={apiProducts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <FlatList
                    key="items"
                    data={apiCategories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* BOTTOM NAV */}
            <SellerBottomNavigation />
        </View>
    );
}
