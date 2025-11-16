import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const { categoryName, categoryId } = useLocalSearchParams();

  // TÍNH CARD_WIDTH RESPONSIVE
  const { width } = Dimensions.get('window');
  const CARD_WIDTH = (width - 48) / 2; // 2 cột, padding 12 mỗi bên

  const filteredProducts = useMemo(() => {
    if (categoryId) return products.filter(p => p.categoryId === categoryId);
    if (categoryName) return products.filter(p => p.category === categoryName);
    return products;
  }, [categoryId, categoryName]);

  const handleBack = () => {
    if (Platform.OS === "web" && window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/seller/shopCategories");
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={[styles.productCard, { width: CARD_WIDTH }]}>
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.productImage} />
        <View style={styles.stockTag}>
          <Text style={styles.stockTagText}>Còn lại {item.stock}</Text>
        </View>
      </View>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>{item.price.toLocaleString()}đ</Text>
        {item.oldPrice && <Text style={styles.oldPrice}>{item.oldPrice.toLocaleString()}đ</Text>}
        {item.discount && <Text style={styles.discount}>{item.discount}</Text>}
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.soldLabel}>Đã bán {item.sold}</Text>
        <Text style={styles.rating}>★ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

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