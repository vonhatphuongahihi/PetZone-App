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

// === DỮ LIỆU GIỮ NGUYÊN ===
interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  image: any;
  sold: number;
  category?: string;
  categoryId: string;
  rating: number;
  stock: number;
  storeId?: string;
}

const products: Product[] = [
  { id: "p1", name: "Hạt dinh dưỡng hỗn hợp", category: "Hạt dinh dưỡng", categoryId: "c1", price: 120000, oldPrice: 150000, discount: "-20%", image: require("../../assets/images/cat.png"), sold: 100, rating: 4.8, stock: 50 },
  { id: "p2", name: "Hạt dinh dưỡng cao cấp", category: "Hạt dinh dưỡng", categoryId: "c1", price: 200000, oldPrice: 250000, discount: "-20%", image: require("../../assets/images/cat.png"), sold: 80, rating: 5, stock: 30 },
  { id: "p3", name: "Pate gà cho mèo", category: "Pate", categoryId: "c2", price: 50000, oldPrice: 60000, discount: "-15%", image: require("../../assets/images/cat.png"), sold: 150, rating: 4.5, stock: 40 },
  { id: "p4", name: "Pate cá hồi cho mèo", category: "Pate", categoryId: "c2", price: 55000, oldPrice: 65000, discount: "-15%", image: require("../../assets/images/cat.png"), sold: 120, rating: 4.7, stock: 35 },
  { id: "p5", name: "Cỏ mèo tự nhiên", category: "Cỏ mèo", categoryId: "c3", price: 30000, image: require("../../assets/images/cat.png"), sold: 200, rating: 4.9, stock: 60 },
  { id: "p6", name: "Cỏ mèo dạng viên", category: "Cỏ mèo", categoryId: "c3", price: 35000, image: require("../../assets/images/cat.png"), sold: 180, rating: 4.6, stock: 50 },
  { id: "p7", name: "Bàn cào móng", category: "Dụng cụ", categoryId: "c4", price: 80000, image: require("../../assets/images/cat.png"), sold: 75, rating: 4.5, stock: 20 },
  { id: "p8", name: "Nhà vệ sinh cho mèo", category: "Dụng cụ", categoryId: "c4", price: 250000, image: require("../../assets/images/cat.png"), sold: 50, rating: 4.7, stock: 15 },
  { id: "p9", name: "Áo cho chó mèo", category: "Quần áo", categoryId: "c5", price: 90000, image: require("../../assets/images/cat.png"), sold: 120, rating: 4.6, stock: 25 },
  { id: "p10", name: "Mũ cho chó mèo", category: "Quần áo", categoryId: "c5", price: 45000, image: require("../../assets/images/cat.png"), sold: 90, rating: 4.5, stock: 30 },
  { id: "p11", name: "Vòng cổ màu vàng", category: "Vòng cổ", categoryId: "c6", price: 95000, oldPrice: 105000, discount: "-10%", image: require("../../assets/images/cat.png"), sold: 100, rating: 5, stock: 12 },
  { id: "p12", name: "Vòng cổ màu đỏ", category: "Vòng cổ", categoryId: "c6", price: 90000, oldPrice: 100000, discount: "-10%", image: require("../../assets/images/cat.png"), sold: 90, rating: 4.8, stock: 10 },
  { id: "p13", name: "Dây dắt đơn màu xanh", category: "Dây dắt", categoryId: "c7", price: 70000, image: require("../../assets/images/cat.png"), sold: 60, rating: 4.7, stock: 20 },
  { id: "p14", name: "Dây dắt đơn màu đỏ", category: "Dây dắt", categoryId: "c7", price: 75000, image: require("../../assets/images/cat.png"), sold: 50, rating: 4.6, stock: 18 },
];

export default function ShopProductListScreen() {
  const { categoryName, categoryId, storeId } = useLocalSearchParams();

  // TÍNH CARD_WIDTH RESPONSIVE
  const { width } = Dimensions.get('window');
  const CARD_WIDTH = (width - 48) / 2; // 2 cột, padding 12 mỗi bên

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("Filtered products:", filteredProducts);

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

        const catIdParam = categoryId ? `categoryId=${categoryId}` : '';
        const storeParam = storeId ? `&storeId=${storeId}` : '';
        const res = await fetch(`${API_BASE_URL}/products?${catIdParam}${storeParam}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        const json = await res.json();

        if (json.success) {
          const filtered = json.data.filter((p: Product) => {
            return (!categoryId || (!categoryId || String(p.categoryId) === String(categoryId))) &&
              (!storeId || p.storeId === storeId);
          });
          setFilteredProducts(filtered);
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, storeId]);


  const handleBack = () => {
    if (Platform.OS === "web" && window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/seller/shopCategories");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // Ảnh
    const imageSource = item.images?.[0]?.url
      ? { uri: item.images[0].url }
      : item.image || require("../../assets/images/cat.png");

    // Số lượng tồn
    const stock = item.quantity !== undefined ? item.quantity : item.stock ?? 0;

    // Tên sản phẩm
    const productName = item.title || item.name || "Sản phẩm";

    // Giá cũ & discount 
    const oldPrice = item.oldPrice || item.old_price;
    const discount = item.discount;

    // Đã bán & rating
    const sold = item.sold || item.totalReviews || 0;
    const rating = item.avgRating || item.rating || 0;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.productCard,
          { width: CARD_WIDTH },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => {
          console.log('Pressed', item.id);
          router.push(`/product?productId=${item.id}`);
        }}
      >
        <View style={styles.imageWrapper}>
          <Image source={imageSource} style={styles.productImage} />

          <View style={[styles.stockTag, { zIndex: 10 }]}>
            <Text style={styles.stockTagText}>Còn lại {stock}</Text>
          </View>
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {productName}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            {Number(item.price).toLocaleString()}đ
          </Text>
          {oldPrice && (
            <Text style={styles.oldPrice}>
              {Number(oldPrice).toLocaleString()}đ
            </Text>
          )}
          {discount && <Text style={styles.discount}>{discount}</Text>}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.soldLabel}>Đã bán {sold}</Text>
          <Text style={styles.rating}>
            ★ {Number(rating).toFixed(1)}
          </Text>
        </View>
      </Pressable>
    );
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back-outline" size={28} color="#FBBC05" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName ?? "Sản phẩm"}</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 12,
        }}
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}