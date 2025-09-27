import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Product = {
  id: string;
  shopId: string;
  title: string;    // Shop name
  subtitle: string; // Product name
  price: number;
  image: any;
};

const products: Product[] = [
  {
    id: "1",
    shopId: "shop1",
    title: "Thuphuong.pet",
    subtitle: "Vòng chuông bấm xinh cho mèo",
    price: 125000,
    image: require("../../assets/images/cat1.png"),
  },
  {
    id: "2",
    shopId: "shop1",
    title: "Thuphuong.pet",
    subtitle: "Áo xinh cho chó",
    price: 135000,
    image: require("../../assets/images/cat1.png"),
  },
  {
    id: "3",
    shopId: "shop2",
    title: "Nhatphuong.pet",
    subtitle: "Chuồng thú cưng",
    price: 300000,
    image: require("../../assets/images/cat1.png"),
  },
];

// Checkbox component
function CustomCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.checkbox, checked && styles.checkedBox]}
      onPress={onToggle}
    >
      {checked && <MaterialIcons name="check" size={16} color="#fff" />}
    </TouchableOpacity>
  );
}

export default function CartScreen() {
  const [cart, setCart] = useState<Product[]>(products);

  // state lưu checkbox
  const [checkedShops, setCheckedShops] = useState<{ [shopId: string]: boolean }>({});
  const [checkedProducts, setCheckedProducts] = useState<{ [productId: string]: boolean }>({});
  const [checkedAll, setCheckedAll] = useState(false); // checkbox chọn tất cả

  // state lưu số lượng sản phẩm
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>(() =>
    products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  );

  // gom sản phẩm theo shopId
  const shops = Object.values(
    cart.reduce((acc, product) => {
      if (!acc[product.shopId]) {
        acc[product.shopId] = { shopId: product.shopId, title: product.title, products: [] as Product[] };
      }
      acc[product.shopId].products.push(product);
      return acc;
    }, {} as Record<string, { shopId: string; title: string; products: Product[] }>)
  );

  // toggle sản phẩm
  const toggleProduct = (product: Product) => {
    const newCheckedProducts = {
      ...checkedProducts,
      [product.id]: !checkedProducts[product.id],
    };

    const shopProducts = cart.filter((p) => p.shopId === product.shopId);
    const allChecked = shopProducts.every((p) => newCheckedProducts[p.id]);

    setCheckedProducts(newCheckedProducts);
    setCheckedShops({
      ...checkedShops,
      [product.shopId]: allChecked,
    });

    const allProductsChecked = cart.every((p) => newCheckedProducts[p.id]);
    setCheckedAll(allProductsChecked);
  };

  // toggle shop
  const toggleShop = (shopId: string) => {
    const shopProducts = cart.filter((p) => p.shopId === shopId);
    const newValue = !checkedShops[shopId];

    const newCheckedProducts = { ...checkedProducts };
    shopProducts.forEach((p) => {
      newCheckedProducts[p.id] = newValue;
    });

    setCheckedProducts(newCheckedProducts);
    setCheckedShops({
      ...checkedShops,
      [shopId]: newValue,
    });

    const allProductsChecked = cart.every((p) => newCheckedProducts[p.id]);
    setCheckedAll(allProductsChecked);
  };

  // toggle chọn tất cả
  const toggleAll = () => {
    const newValue = !checkedAll;

    const newCheckedProducts: { [productId: string]: boolean } = {};
    const newCheckedShops: { [shopId: string]: boolean } = {};

    shops.forEach((shop) => {
      newCheckedShops[shop.shopId] = newValue;
      shop.products.forEach((product) => {
        newCheckedProducts[product.id] = newValue;
      });
    });

    setCheckedProducts(newCheckedProducts);
    setCheckedShops(newCheckedShops);
    setCheckedAll(newValue);
  };

  // tăng/giảm số lượng
  const changeQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const newQty = Math.max(1, (prev[productId] || 1) + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  // xóa sản phẩm
  const removeProduct = (productId: string) => {
    setCart((prev) => prev.filter((p) => p.id !== productId));

    // dọn luôn checked & quantities
    const newChecked = { ...checkedProducts };
    delete newChecked[productId];
    setCheckedProducts(newChecked);

    const newQuantities = { ...quantities };
    delete newQuantities[productId];
    setQuantities(newQuantities);
  };

  // render 1 shop
  const renderShop = ({ item }: { item: { shopId: string; title: string; products: Product[] } }) => (
    <View style={styles.item}>
      {/* Hàng 1: Checkbox + Shop name */}
      <View style={styles.row}>
        <CustomCheckbox
          checked={!!checkedShops[item.shopId]}
          onToggle={() => toggleShop(item.shopId)}
        />
        <Text style={styles.shopName}>{item.title}</Text>
        <MaterialIcons
          name="arrow-forward-ios"
          size={13}
          color="rgba(0,0,0,0.55)"
          style={{ marginLeft: 4, marginTop: 1 }}
        />
      </View>

      {/* Hàng 2: Các sản phẩm của shop */}
      {item.products.map((product) => (
        <View key={product.id} style={styles.productRow}>
          <CustomCheckbox
            checked={!!checkedProducts[product.id]}
            onToggle={() => toggleProduct(product)}
          />
          <Image source={product.image} style={styles.image} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.productName}>{product.subtitle}</Text>
            <Text style={styles.productDesc}>Trắng | M</Text>

            {/* Giá + đếm số lượng + nút Xóa */}
            <View style={styles.rowBetween}>
              <Text style={styles.price}>
                {(product.price * (quantities[product.id] || 1)).toLocaleString()}đ
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Counter */}
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => changeQuantity(product.id, -1)}
                  >
                    <Text style={styles.counterText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{quantities[product.id]}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => changeQuantity(product.id, 1)}
                  >
                    <Text style={styles.counterText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Nút Xóa */}
                <TouchableOpacity onPress={() => removeProduct(product.id)}>
                  <Text style={styles.remove}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
        <Text style={styles.headerTitle}>Giỏ hàng ({cart.length})</Text>
      </View>

      {/* Danh sách shop */}
      <FlatList
        data={shops}
        keyExtractor={(item) => item.shopId}
        renderItem={renderShop}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <CustomCheckbox checked={checkedAll} onToggle={toggleAll} />
        <Text style={{ flex: 1 }}>Tất cả</Text>
        <Text style={{ color: "red", marginRight: 10, fontWeight: "bold" }}>
          {Object.keys(checkedProducts)
            .filter((id) => checkedProducts[id])
            .reduce((sum, id) => sum + (products.find(p => p.id === id)?.price || 0) * quantities[id], 0)
            .toLocaleString()}đ
        </Text>
        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyBtnText}>
            Mua hàng (
            {Object.keys(checkedProducts).filter((id) => checkedProducts[id]).length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingTop: 40,
  },
  headerTitle: { marginLeft: 8, fontSize: 20, fontWeight: "500", color: "#000" },

  // Item
  item: {
    borderWidth: 1,
    borderColor: "#FBBC05",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", alignItems: "center" },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#FBBC05",
    borderColor: "#FBBC05",
  },
  shopName: { fontWeight: "bold", fontSize: 14, color: "#000" },
  image: { width: 70, height: 70, borderRadius: 8 },
  productName: { fontSize: 14, fontWeight: "400" },
  productDesc: { color: "#666", fontSize: 12, marginTop: 2 },
  price: { color: "red", fontWeight: "bold", fontSize: 15 },

  // Actions
  remove: { color: "rgba(0,0,0,0.55)", fontSize: 12, marginLeft: 12 },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CE",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  counterBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: { fontSize: 16, fontWeight: "bold", color: "rgba(0,0,0,0.55)" },
  counterValue: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(0,0,0,0.55)",
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  buyBtn: {
    backgroundColor: "#FBBC05",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buyBtnText: { color: "#fff", fontWeight: "bold" },
});
