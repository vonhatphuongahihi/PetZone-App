import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { API_BASE_URL } from "../../config/api";
import { styles } from "./shopProductListStyle";

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  image?: string;
  sold: number;
  category?: { id: string; name: string };
  categoryId: string;
  rating: number;
  stock: number;
  storeId?: string;
}

export default function ShopProductListScreen() {
  const { categoryId, categoryName, storeId } = useLocalSearchParams();  
  
  const { width } = Dimensions.get('window');
  const CARD_WIDTH = (width - 48) / 2;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("jwt_token");
        if (!token) {
          Alert.alert("Lỗi", "Bạn chưa đăng nhập");
          setLoading(false);
          return;
        }

        if (!storeId) {
          Alert.alert("Lỗi", "Thiếu storeId");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/products/store/${storeId}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        const json = await res.json();
        console.log("API Response:", JSON.stringify(json, null, 2));
        
        if (!json.success) {
          Alert.alert("Lỗi", "Không thể tải sản phẩm");
          setLoading(false);
          return;
        }

        // Map fallback cho category
        const fetchedProducts: Product[] = json.data.map((p: any) => {
          console.log("Raw product data:", p);
          return {
            id: p.id,
            name: p.title || p.name || "Sản phẩm",
            price: p.price || 0,
            oldPrice: p.oldPrice,
            discount: p.discount,
            image: p.images?.[0]?.url || p.image || p.imageUrl,
            sold: p.sold || 0,
            category: p.category ? p.category : { id: p.categoryId, name: `Danh mục ${p.categoryId}` },
            categoryId: p.categoryId,
            rating: p.avgRating || p.rating || 0,
            stock: p.remainingQuantity || p.stock || 0,
            storeId: p.storeId
          };
        });

        // Filter theo categoryId nếu có
        const filteredProducts = categoryId
          ? fetchedProducts.filter(p => String(p.category?.id ?? p.categoryId) === String(categoryId))
          : fetchedProducts;

        setProducts(filteredProducts);

        // Log danh mục duy nhất của store
        const categoriesMap: { [key: string]: string } = {};
        fetchedProducts.forEach(p => {
          if (p.categoryId) {
            categoriesMap[p.categoryId] = p.category?.name || `Danh mục ${p.categoryId}`;
          }
        });
        const categories = Object.keys(categoriesMap).map(key => ({
          id: key,
          name: categoriesMap[key]
        }));
        console.log("Danh mục cửa hàng:", categories);

      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId, categoryId]);

  const handleBack = () => {
    if (Platform.OS === "web" && window.history.length > 1) {
      window.history.back();
    } else {
      router.push({
        pathname: "/seller/shopCategories",
        params: { storeId }
      });
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    const imageSource = item.image ? { uri: item.image } : require("../../assets/images/cat.png");
    const stock = item.stock ?? 0;
    const productName = item.name ?? "Sản phẩm";
    const oldPrice = item.oldPrice;
    const sold = item.sold ?? 0;
    const rating = item.rating ?? 0;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.productCard,
          { width: CARD_WIDTH },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => router.push(`/product?productId=${item.id}`)}
      >
        <View style={styles.imageWrapper}>
          <Image source={imageSource} style={styles.productImage} />
          <View style={[styles.stockTag, { zIndex: 10 }]}>
            <Text style={styles.stockTagText}>Còn lại {stock}</Text>
          </View>
        </View>

        <Text style={styles.productName} numberOfLines={2}>{productName}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{Number(item.price).toLocaleString()}đ</Text>
          {oldPrice && (
            <>
              <Text style={styles.oldPrice}>{Number(oldPrice).toLocaleString()}đ</Text>
              <Text style={styles.discount}>
                -{Math.round((1 - Number(item.price) / Number(oldPrice)) * 100)}%
              </Text>
            </>
          )}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.soldLabel}>Đã bán {sold}</Text>
          <Text style={styles.rating}>★ {Number(rating).toFixed(1)}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: 4, zIndex: 999 }}
          >
            <Ionicons name="chevron-back-outline" size={28} color="#FBBC05" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName ?? "Sản phẩm"}</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
