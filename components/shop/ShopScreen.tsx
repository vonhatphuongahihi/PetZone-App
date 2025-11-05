import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
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

export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState<"Sản phẩm" | "Danh mục">("Danh mục");
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false); // Ngăn nhấn nút khi đang tải

  const { refresh } = useLocalSearchParams();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await tokenService.getToken();
      console.log("Token in fetchData:", token ? "OK" : "null");
      if (!token) {
        throw new Error("No token found");
      }

      // Lấy thông tin cửa hàng
      const storeResponse = await storeService.getMyStore(token);
      console.log("Store response:", JSON.stringify(storeResponse, null, 2));
      if (!storeResponse.store || !storeResponse.store.id) {
        throw new Error("Invalid store data: store or store.id is missing");
      }
      setStore(storeResponse.store);

      // Lấy danh sách sản phẩm
      const productsResponse = await productService.getProductsByStore(storeResponse.store.id, token);
      setProducts(productsResponse.data || []);

      // Lấy danh sách danh mục
      const categoriesResponse = await categoryService.getAllCategories(token);
      setCategories(categoriesResponse.data || []);

      return storeResponse.store; // Trả về store để sử dụng trong onPress
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

  // Reload dữ liệu khi focus screen (ví dụ sau khi thêm sản phẩm)
  useFocusEffect(
    useCallback(() => {
      if (refresh === "true") fetchData();
    }, [refresh, fetchData])
  );

  // Lọc danh mục cha
  const parentCategories = categories.filter(cat => !cat.parentId);

  // Render sản phẩm
  const renderProductItem = ({ item }: { item: ApiProduct }) => (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image
          source={item.images?.length ? { uri: item.images[0].url } : require("../../assets/images/cat.png")}
          style={styles.productImage}
        />
        <View style={styles.stockTag}>
          <Text style={styles.stockTagText}>Còn lại {item.quantity}</Text>
        </View>
      </View>
      <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>{Number(item.price).toLocaleString()}đ</Text>
        {item.oldPrice && (
          <>
            <Text style={styles.oldPrice}>{Number(item.oldPrice).toLocaleString()}đ</Text>
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
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" style={styles.icon} />
            <Ionicons name="search-outline" size={22} color="#fff" style={styles.icon} />
          </View>
        </View>

        <View style={styles.shopInfo}>
          <Image source={require("../../assets/images/cat.png")} style={styles.avatar} />
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

      <SellerBottomNavigation />
    </View>
  );
}