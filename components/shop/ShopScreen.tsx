import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Category as ApiCategory, categoryService } from "../../services/categoryService";
import { Product as ApiProduct, productService } from "../../services/productService";
import { SocketEventEmitter } from "../../services/socketEventEmitter";
import { Store, storeService } from "../../services/storeService";
import { tokenService } from "../../services/tokenService";
import { userInfoService } from "../../services/userInfoService";
import { SellerBottomNavigation } from "../seller/SellerBottomNavigation";
import styles from "./shopStyle";

export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState<"Sản phẩm" | "Danh mục">("Danh mục");
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApiProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Listen for unread messages
  useEffect(() => {
    const handleUnreadNotification = (data: { conversationId: number }) => {
      setUnreadCount(prev => prev + 1);
    };

    const handleMarkAsRead = (data: { conversationId: number }) => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    SocketEventEmitter.addListener('conversation:unread', handleUnreadNotification);
    SocketEventEmitter.addListener('conversation:read', handleMarkAsRead);

    return () => {
      SocketEventEmitter.removeAllListeners('conversation:unread');
      SocketEventEmitter.removeAllListeners('conversation:read');
    };
  }, []);

  const handleSearchInShop = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const token = await tokenService.getToken();
      if (!token) throw new Error("Không có token");

      const filtered = products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const { refresh } = useLocalSearchParams();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await tokenService.getToken();
      console.log("Token in fetchData:", token ? "OK" : "null");
      if (!token) {
        throw new Error("No token found");
      }

      // Lấy thông tin cửa hàng và user info song song
      const [storeResponse, userResponse] = await Promise.all([
        storeService.getMyStore(token),
        userInfoService.getUserInfo(token)
      ]);

      console.log("Store response:", JSON.stringify(storeResponse, null, 2));
      if (!storeResponse.store || !storeResponse.store.id) {
        throw new Error("Invalid store data: store or store.id is missing");
      }
      setStore(storeResponse.store);

      // Lấy avatar từ user info
      if (userResponse.user.avatarUrl) {
        setAvatarUrl(userResponse.user.avatarUrl);
      }

      // Lấy danh sách sản phẩm
      const productsResponse = await productService.getProductsByStore(storeResponse.store.id, token);
      setProducts(productsResponse.data || []);

      // Lấy danh sách danh mục
      const categoriesResponse = await categoryService.getAllCategories(token);
      setCategories(categoriesResponse.data || []);

      return storeResponse.store;
    } catch (err: any) {
      console.error("Error fetching shop data:", err.message);
      if (err.message === "No token found") {
        if (Platform.OS === "web") {
          alert("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        } else {
          Alert.alert("Lỗi", "Bạn chưa đăng nhập. Vui lòng đăng nhập lại.", [
            { text: "OK", onPress: () => router.replace("/login" as any) },
          ]);
        }
      } else {
        if (Platform.OS === "web") {
          alert(`Lỗi khi tải dữ liệu cửa hàng: ${err.message}`);
        } else {
          Alert.alert("Lỗi", `Lỗi khi tải dữ liệu cửa hàng: ${err.message}`);
        }
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lần đầu load dữ liệu
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reload dữ liệu khi focus screen
  useFocusEffect(
    useCallback(() => {
      if (refresh === "true") fetchData();
    }, [refresh, fetchData])
  );

  // Lọc danh mục cha
  const parentCategories = categories.filter(cat => !cat.parentId);

  // Render sản phẩm
  const renderProductItem = ({ item }: { item: ApiProduct }) => (
    <Pressable
      onPress={() => {
        router.push(`/product?productId=${item.id}`);
      }}
      style={{ flex: 1, marginHorizontal: 6, marginBottom: 12 }}
    >
      <View style={styles.card}>
        {/* Ảnh sản phẩm */}
        <View style={styles.imageWrapper}>
          <Image
            source={
              item.images?.length
                ? { uri: item.images[0].url }
                : require("../../assets/images/cat.png")
            }
            style={styles.productImage}
          />
          <View style={styles.stockTag}>
            <Text style={styles.stockTagText}>Còn lại {item.quantity}</Text>
          </View>
        </View>

        {/* Tên sản phẩm */}
        <Text style={styles.productName} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Giá */}
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            {Number(item.price).toLocaleString()}đ
          </Text>
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

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.soldLabel}>Đã bán {item.totalReviews}</Text>
          <Text style={styles.rating}>★ {Number(item.avgRating).toFixed(1)}</Text>
        </View>

        {/* Nút Sửa + Xóa */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: "/seller/shopUpdateProduct",
                params: { product: JSON.stringify(item), storeId: store?.id },
              });
            }}
          >
            <Text style={styles.editButtonText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteProduct(item.id);
            }}
          >
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );

  const handleConfirmDelete = (id: number) => {
    confirmDelete(id);
  };

  const handleDeleteProduct = (productId: number) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
      if (confirmed) handleConfirmDelete(productId);
    } else {
      Alert.alert(
        "Xóa sản phẩm",
        "Bạn có chắc chắn muốn xóa?\nHành động này không thể hoàn tác.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xóa ngay", style: "destructive", onPress: () => handleConfirmDelete(productId) },
        ],
        { cancelable: true }
      );
    }
  };

  const confirmDelete = async (productId: number) => {
    try {
      setLoading(true);
      const token = await tokenService.getToken();
      if (!token) throw new Error("Không có token");

      console.log("Đang xóa sản phẩm ID:", productId);
      const res = await productService.deleteProduct(productId, token);
      console.log("Delete API response:", res);
      console.log("XÓA THÀNH CÔNG:", res);

      setProducts(prev => prev.filter(p => p.id !== productId));

      Alert.alert("Thành công", "Đã xóa sản phẩm!");
    } catch (err: any) {
      console.error("Lỗi xóa:", err);
      Alert.alert("Lỗi", err.message || "Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Render danh mục
  const renderCategoryItem = ({ item }: { item: ApiCategory }) => {
    const subCategories = item.children || [];
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() =>
          router.push({
            pathname: "/seller/shopCategories",
            params: {
              parentId: item.id,
              parentName: item.name,
              subCategories: JSON.stringify(subCategories),
            },
          })
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={item.image ? { uri: item.image } : require("../../assets/images/food-icon.png")}
            style={styles.categoryIcon}
          />
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push("/seller/dashboard")}>
            <Ionicons name="chevron-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cửa hàng của tôi</Text>
          <View style={styles.iconGroup}>
            <Ionicons name="notifications-outline" size={22} color="#fff" style={styles.icon} />
            <TouchableOpacity onPress={() => router.push('/seller/messages')}>
              <View style={styles.messageIconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" style={styles.icon} />
                {unreadCount > 0 && (
                  <View style={styles.messageBadge}>
                    <Text style={styles.messageBadgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <Ionicons
              name="search-outline"
              size={22}
              color="#fff"
              style={styles.icon}
              onPress={() => setSearchVisible(true)}
            />
          </View>
        </View>

        <View style={styles.shopInfo}>
          {/* Hiển thị avatar động từ API */}
          <Image 
            source={
              avatarUrl 
                ? { uri: avatarUrl } 
                : require("../../assets/images/cat.png")
            } 
            style={styles.avatar} 
          />
          <View style={styles.shopTextContainer}>
            <Text style={styles.shopName}>{store?.storeName || "phuong-shop"}</Text>
            <Text style={styles.subText}>
              ★ {store?.rating ? Number(store.rating).toFixed(1) : "4.8"} |{" "}
              {store?.totalOrders || 100} Người đã mua
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.addButton, isNavigating && { opacity: 0.5 }]}
            disabled={isNavigating}
            onPress={async () => {
              if (isNavigating) return;
              setIsNavigating(true);
              try {
                let currentStore = store;
                console.log("Current store before fetch:", currentStore);
                if (!currentStore || !currentStore.id) {
                  if (Platform.OS === "web") {
                    alert("Không thể tải thông tin cửa hàng. Đang thử lại...");
                  } else {
                    Alert.alert("Lỗi", "Không thể tải thông tin cửa hàng. Đang thử lại...");
                  }
                  currentStore = await fetchData();
                  console.log("Current store after fetch:", currentStore);
                }
                if (!currentStore || !currentStore.id) {
                  if (Platform.OS === "web") {
                    alert("Lỗi: Không thể tải thông tin cửa hàng sau khi thử lại.");
                  } else {
                    Alert.alert("Lỗi", "Không thể tải thông tin cửa hàng sau khi thử lại.");
                  }
                  return;
                }
                console.log("Navigating with storeId:", currentStore.id);
                router.push({
                  pathname: "/seller/shopAddProduct",
                  params: {
                    storeId: currentStore.id,
                    refresh: "true",
                  },
                });
              } catch (err) {
                console.error("Error navigating to AddProductScreen:", err);
                if (Platform.OS === "web") {
                  alert("Lỗi không xác định khi điều hướng.");
                } else {
                  Alert.alert("Lỗi", "Lỗi không xác định khi điều hướng.");
                }
              } finally {
                setIsNavigating(false);
              }
            }}
          >
            <Text style={styles.plusSign}>+</Text>
            <Text style={styles.addButtonText}>Sản phẩm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/seller/shopAddCategories")}>
            <Text style={styles.plusSign}>+</Text>
            <Text style={styles.addButtonText}>Danh mục</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Sản phẩm" && styles.activeTab]}
          onPress={() => setActiveTab("Sản phẩm")}
        >
          <Text style={activeTab === "Sản phẩm" ? styles.activeTabText : styles.tabText}>
            Sản phẩm ({products.length})
          </Text>
        </TouchableOpacity>
        <View style={styles.tabDivider} />
        <TouchableOpacity
          style={[styles.tab, activeTab === "Danh mục" && styles.activeTab]}
          onPress={() => setActiveTab("Danh mục")}
        >
          <Text style={activeTab === "Danh mục" ? styles.activeTabText : styles.tabText}>
            Danh mục ({parentCategories.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Đang tải dữ liệu...</Text>
        </View>
      ) : activeTab === "Sản phẩm" ? (
        <FlatList
          key="products"
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          key="categories"
          data={parentCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {searchVisible && (
        <Pressable style={styles.searchOverlay} onPress={() => setSearchVisible(false)}>
          <Pressable style={styles.searchPopup} onPress={(e) => e.stopPropagation()}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm sản phẩm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearchInShop()}
              autoFocus
            />
            {searchLoading && <Text>Đang tìm...</Text>}

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.searchProductRow}
                  onPress={() => {
                    setSearchVisible(false);
                    router.push(`/product?productId=${item.id}`);
                  }}
                >
                  <Image
                    source={item.images?.[0]?.url ? { uri: item.images[0].url } : require('../../assets/images/cat.png')}
                    style={styles.searchProductImage}
                  />
                  <View style={styles.searchProductInfo}>
                    <Text style={styles.searchProductTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.searchProductPrice}>{Number(item.price).toLocaleString()}đ</Text>
                  </View>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      )}
      <SellerBottomNavigation />
    </View>
  );
}