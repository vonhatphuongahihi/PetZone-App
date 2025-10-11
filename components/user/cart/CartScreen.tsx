import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "./cartStyle";

type Product = {
  id: string;
  shopId: string;
  title: string; // Shop name
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
    image: require("../../../assets/images/cat1.png"),
  },
  {
    id: "2",
    shopId: "shop1",
    title: "Thuphuong.pet",
    subtitle: "Áo xinh cho chó",
    price: 135000,
    image: require("../../../assets/images/cat1.png"),
  },
  {
    id: "3",
    shopId: "shop2",
    title: "Nhatphuong.pet",
    subtitle: "Chuồng thú cưng",
    price: 300000,
    image: require("../../../assets/images/cat1.png"),
  },
];

// Checkbox component
function CustomCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
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
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [cart, setCart] = useState<Product[]>(products);
  const [checkedShops, setCheckedShops] = useState<{ [shopId: string]: boolean }>({});
  const [checkedProducts, setCheckedProducts] = useState<{ [productId: string]: boolean }>({});
  const [checkedAll, setCheckedAll] = useState(false);

  const [quantities, setQuantities] = useState<{ [productId: string]: number }>(() =>
    products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  );

  // Gom sản phẩm theo shop
  const shops = Object.values(
    cart.reduce((acc, product) => {
      if (!acc[product.shopId]) {
        acc[product.shopId] = {
          shopId: product.shopId,
          title: product.title,
          products: [] as Product[],
        };
      }
      acc[product.shopId].products.push(product);
      return acc;
    }, {} as Record<string, { shopId: string; title: string; products: Product[] }>)
  );

  // Toggle sản phẩm
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

  // Toggle shop
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

  // Toggle tất cả
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

  // Tăng/giảm số lượng
  const changeQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const newQty = Math.max(1, (prev[productId] || 1) + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  // Xóa sản phẩm
  const removeProduct = (productId: string) => {
    setCart((prev) => prev.filter((p) => p.id !== productId));

    const newChecked = { ...checkedProducts };
    delete newChecked[productId];
    setCheckedProducts(newChecked);

    const newQuantities = { ...quantities };
    delete newQuantities[productId];
    setQuantities(newQuantities);
  };

  // Render 1 shop
  const renderShop = ({
    item,
  }: {
    item: { shopId: string; title: string; products: Product[] };
  }) => (
    <View style={styles.item}>
      {/* Shop header */}
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

      {/* Products */}
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

            <View style={styles.rowBetween}>
              <Text style={styles.price}>
                {(product.price * (quantities[product.id] || 1)).toLocaleString()}đ
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
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
        <MaterialIcons
          name="arrow-back-ios"
          size={24}
          color="#FBBC05"
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>Giỏ hàng ({cart.length})</Text>
      </View>

      {/* Danh sách shops */}
      <FlatList
        data={shops}
        keyExtractor={(item) => item.shopId}
        renderItem={renderShop}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
        ]}
      >
        <CustomCheckbox checked={checkedAll} onToggle={toggleAll} />
        <Text style={{ flex: 1 }}>Tất cả</Text>
        <Text style={{ color: "red", marginRight: 10, fontWeight: "bold" }}>
          {Object.keys(checkedProducts)
            .filter((id) => checkedProducts[id])
            .reduce(
              (sum, id) =>
                sum +
                (products.find((p) => p.id === id)?.price || 0) *
                quantities[id],
              0
            )
            .toLocaleString()}đ
        </Text>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => router.push("/payment")}
        >
          <Text style={styles.buyBtnText}>
            Mua hàng (
            {Object.keys(checkedProducts).filter((id) => checkedProducts[id]).length}
            )
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
