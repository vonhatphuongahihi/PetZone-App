import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    Dimensions,
    FlatList,
    Image,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Category as ApiCategory, categoryService } from "../../../services/categoryService";
import { chatService } from "../../../services/chatService";
import { Product as ApiProduct, productService } from "../../../services/productService";
import { Store, storeService } from "../../../services/storeService";
import { tokenService } from "../../../services/tokenService";
import styles from "./userShopStyle";

export default function UserShopScreen() {
    const [activeTab, setActiveTab] = useState<"Sản phẩm" | "Danh mục">("Sản phẩm");
    const [store, setStore] = useState<(Store & { isFollowing?: boolean }) | null>(null);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);

    const { storeId, isFollowing: initialFollowing } = useLocalSearchParams<{ storeId: string; isFollowing?: string }>();

    const fetchData = useCallback(async () => {
        if (!storeId) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin cửa hàng");
            router.back();
            return;
        }

        try {
            setLoading(true);
            const token = await tokenService.getToken();

            // Lấy thông tin cửa hàng
            const storeResponse = await storeService.getStoreById(storeId, token || undefined);
            if (!storeResponse.success || !storeResponse.data) {
                throw new Error("Không tìm thấy cửa hàng");
            }
            setStore(storeResponse.data);

            // Ưu tiên sử dụng giá trị từ params (đồng bộ từ HomeScreen), nếu không có thì dùng từ API
            if (initialFollowing !== undefined && initialFollowing !== null) {
                // Có giá trị từ params (từ HomeScreen)
                const followingFromParams = initialFollowing === "true";
                setFollowing(followingFromParams);
            } else {
                // Không có từ params, dùng giá trị từ API
                setFollowing(storeResponse.data.isFollowing || false);
            }

            // Lấy danh sách sản phẩm (public endpoint, không cần token)
            try {
                const productsResponse = await productService.getProductsByStore(storeId, token || "");
                setProducts(productsResponse.data || []);
            } catch (err) {
                console.error("Error fetching products:", err);
                setProducts([]);
            }

            // Lấy danh sách danh mục (nếu có token)
            if (token) {
                try {
                    const categoriesResponse = await categoryService.getAllCategories(token);
                    setCategories(categoriesResponse.data || []);
                } catch (err) {
                    console.error("Error fetching categories:", err);
                }
            }
        } catch (err: any) {
            console.error("Error fetching shop data:", err.message);
            if (Platform.OS === "web") {
                alert(`Lỗi khi tải dữ liệu cửa hàng: ${err.message}`);
            } else {
                Alert.alert("Lỗi", `Lỗi khi tải dữ liệu cửa hàng: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleFollow = async () => {
        try {
            const token = await tokenService.getToken();
            if (!token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập để theo dõi cửa hàng");
                return;
            }

            // Use followStore endpoint which now toggles follow/unfollow
            const response = await storeService.followStore(storeId, token);
            const newFollowingState = (response as any).isFollowing !== undefined ? (response as any).isFollowing : !following;

            setFollowing(newFollowingState);
            if (store) {
                setStore({
                    ...store,
                    isFollowing: newFollowingState,
                    followersCount: newFollowingState
                        ? store.followersCount + 1
                        : Math.max(0, store.followersCount - 1)
                });
            }

            // Emit event để đồng bộ với HomeScreen
            DeviceEventEmitter.emit('store_follow_changed', {
                storeId,
                isFollowing: newFollowingState,
                followersCount: store ? (newFollowingState
                    ? store.followersCount + 1
                    : Math.max(0, store.followersCount - 1)) : 0
            });
        } catch (error: any) {
            console.error("Toggle follow error:", error);
            Alert.alert("Lỗi", error.message || "Không thể thay đổi trạng thái theo dõi");
        }
    };

    const handleChatPress = async () => {
        try {
            const token = await tokenService.getToken();
            if (!token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập để chat với cửa hàng");
                return;
            }

            // Lấy userId từ store.userId hoặc store.user.id
            const shopUserId = store?.userId || store?.user?.id;
            if (!shopUserId) {
                console.error("Store data:", store);
                Alert.alert("Lỗi", "Không thể tìm thấy thông tin cửa hàng");
                return;
            }

            // Tạo hoặc tìm conversation với shop
            const conversation = await chatService.createOrFindConversation(
                { otherUserId: shopUserId },
                token
            );

            // Navigate đến chat screen với conversationId
            router.push(`/chat?chatId=${conversation.id}`);
        } catch (error: any) {
            console.error("Chat error:", error);
            Alert.alert("Lỗi", error.message || "Không thể mở chat với cửa hàng");
        }
    };

    // Lọc danh mục cha
    const parentCategories = categories.filter(cat => !cat.parentId);

    // Tính CARD_WIDTH responsive
    const { width } = Dimensions.get('window');
    const CARD_WIDTH = (width - 48) / 2; // 2 cột, padding 12 mỗi bên

    // Render sản phẩm
    const renderProductItem = ({ item }: { item: ApiProduct }) => {
        const discount = item.oldPrice && item.price
            ? `-${Math.round((item.oldPrice - item.price) / item.oldPrice * 100)}%`
            : undefined;

        return (
            <TouchableOpacity
                style={[styles.productCard, { width: CARD_WIDTH }]}
                onPress={() => router.push({
                    pathname: "/product",
                    params: { productId: item.id.toString() }
                })}
            >
                <View style={styles.imageWrapper}>
                    <Image
                        source={item.images?.[0]?.url
                            ? { uri: item.images[0].url }
                            : require("../../../assets/images/cat.png")}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    {discount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeText}>{discount}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.title || "Sản phẩm"}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>
                        {item.price ? item.price.toLocaleString('vi-VN') : 0}đ
                    </Text>
                    {item.oldPrice && (
                        <Text style={styles.oldPrice}>
                            {item.oldPrice.toLocaleString('vi-VN')}đ
                        </Text>
                    )}
                </View>
                <View style={styles.metaRow}>
                    <Text style={styles.soldLabel}>
                        Đã bán {item.totalReviews || 0}
                    </Text>
                    <Text style={styles.rating}>
                        ★ {item.avgRating ? Number(item.avgRating).toFixed(1) : "0.0"}
                    </Text>

                </View>
            </TouchableOpacity>
        );
    };

    // Render danh mục
    const renderCategoryItem = ({ item }: { item: ApiCategory }) => {
        const subCategories = item.children || [];
        return (
            <TouchableOpacity
                style={styles.categoryCard}
                onPress={() =>
                    router.push({
                        pathname: "/categories",
                        params: {
                            parentId: item.id,
                            parentName: item.name,
                        },
                    })
                }
            >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Image
                        source={item.image ? { uri: item.image } : require("../../../assets/images/food-icon.png")}
                        style={styles.categoryIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" style={styles.categoryArrow} />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#FBBC05" />
                    <Text style={{ marginTop: 10, color: "#666" }}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!store) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "#666" }}>Không tìm thấy cửa hàng</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 10, backgroundColor: "#FBBC05", borderRadius: 8 }}>
                        <Text style={{ color: "#fff", fontWeight: "600" }}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        {/* Back button */}
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        {/* Decorative circles */}
                        <View style={styles.headerDecoration} />
                        <View style={styles.headerDecoration2} />

                        <View style={styles.shopInfo}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={store.user?.avatarUrl ? { uri: store.user.avatarUrl } : require("../../../assets/images/shop.png")}
                                    style={styles.avatar}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.shopTextContainer}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.shopName}>{store.storeName}</Text>
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color="#fff" />
                                        <Text style={styles.ratingText}>
                                            {store.rating ? Number(store.rating).toFixed(1) : "4.8"}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Ionicons name="people" size={12} color="#fff" style={styles.statIcon} />
                                        <Text style={styles.statText}>
                                            {store.followersCount || 0} theo dõi
                                        </Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <MaterialCommunityIcons name="shopping" size={12} color="#fff" style={styles.statIcon} />
                                        <Text style={styles.statText}>
                                            {store.totalOrders || 0} đơn hàng
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.followButton, following && styles.followingButton]}
                                onPress={handleToggleFollow}
                            >
                                <Ionicons name={following ? "checkmark-circle" : "add-circle-outline"} size={16} color={following ? "#666" : "#FBBC05"} />
                                <Text style={[styles.followButtonText, following && styles.followingButtonText]}>
                                    {following ? "Đang theo dõi" : "Theo dõi"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.chatButton}
                                onPress={handleChatPress}
                            >
                                <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                                <Text style={styles.chatButtonText}>Chat</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Description Section */}
                    {store.description && (
                        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                                <Ionicons name="information-circle" size={20} color="#FBBC05" style={styles.descriptionTitleIcon} />
                                <Text style={styles.descriptionTitle}>Giới thiệu cửa hàng</Text>
                            </View>
                            <Text style={styles.descriptionText}>{store.description}</Text>
                        </View>
                    )}

                    {/* Tabs */}
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "Sản phẩm" && styles.activeTab]}
                            onPress={() => setActiveTab("Sản phẩm")}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={activeTab === "Sản phẩm" ? styles.activeTabText : styles.tabText}>
                                    Sản phẩm
                                </Text>
                                {products.length > 0 && (
                                    <View style={[styles.tabBadge, activeTab !== "Sản phẩm" && { backgroundColor: "#CCC" }]}>
                                        <Text style={styles.tabBadgeText}>{products.length}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                        <View style={styles.tabDivider} />
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "Danh mục" && styles.activeTab]}
                            onPress={() => setActiveTab("Danh mục")}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={activeTab === "Danh mục" ? styles.activeTabText : styles.tabText}>
                                    Danh mục
                                </Text>
                                {parentCategories.length > 0 && (
                                    <View style={[styles.tabBadge, activeTab !== "Danh mục" && { backgroundColor: "#CCC" }]}>
                                        <Text style={styles.tabBadgeText}>{parentCategories.length}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {activeTab === "Sản phẩm" ? (
                        products.length > 0 ? (
                            <FlatList
                                key="products"
                                data={products}
                                renderItem={renderProductItem}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={2}
                                columnWrapperStyle={styles.columnWrapper}
                                contentContainerStyle={styles.productsList}
                                scrollEnabled={false}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="package-variant" size={64} color="#DDD" style={styles.emptyIcon} />
                                <Text style={styles.emptyText}>Cửa hàng chưa có sản phẩm</Text>
                                <Text style={styles.emptySubText}>Hãy quay lại sau để xem sản phẩm mới</Text>
                            </View>
                        )
                    ) : (
                        parentCategories.length > 0 ? (
                            <FlatList
                                key="categories"
                                data={parentCategories}
                                renderItem={renderCategoryItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 20, paddingBottom: 30 }}
                                scrollEnabled={false}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="folder-outline" size={64} color="#DDD" style={styles.emptyIcon} />
                                <Text style={styles.emptyText}>Cửa hàng chưa có danh mục</Text>
                                <Text style={styles.emptySubText}>Hãy quay lại sau để xem danh mục mới</Text>
                            </View>
                        )
                    )}
                </ScrollView>
            </SafeAreaView >
        </>
    );
}

