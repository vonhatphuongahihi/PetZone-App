import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CartItem, cartService } from '../../../services/cartService';
import styles from "./cartStyle";

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

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedShops, setCheckedShops] = useState<{ [shopId: string]: boolean }>({});
  const [checkedProducts, setCheckedProducts] = useState<{ [productId: string]: boolean }>({});
  const [checkedAll, setCheckedAll] = useState(false);
  const [updatingQuantities, setUpdatingQuantities] = useState<{ [cartItemId: string]: boolean }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch cart từ API
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập');
        router.replace('/login');
        return;
      }

      const response = await cartService.getCart(token);
      setCartItems(response.data);
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      Alert.alert('Lỗi', error.message || 'Không tải được giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Gom sản phẩm theo shop
  const shops = Object.values(
    cartItems.reduce((acc, item) => {
      const shopId = item.product.store.id;
      const shopName = item.product.store.storeName;

      if (!acc[shopId]) {
        acc[shopId] = {
          shopId,
          title: shopName,
          products: [] as CartItem[],
        };
      }
      acc[shopId].products.push(item);
      return acc;
    }, {} as Record<string, { shopId: string; title: string; products: CartItem[] }>)
  );

  // Toggle sản phẩm
  const toggleProduct = (item: CartItem) => {
    const newCheckedProducts = {
      ...checkedProducts,
      [item.id]: !checkedProducts[item.id],
    };

    const shopId = item.product.store.id;
    const shopProducts = cartItems.filter((i) => i.product.store.id === shopId);
    const allChecked = shopProducts.every((i) => newCheckedProducts[i.id]);

    setCheckedProducts(newCheckedProducts);
    setCheckedShops({
      ...checkedShops,
      [shopId]: allChecked,
    });

    const allProductsChecked = cartItems.every((i) => newCheckedProducts[i.id]);
    setCheckedAll(allProductsChecked);
  };

  // Toggle shop
  const toggleShop = (shopId: string) => {
    const shopProducts = cartItems.filter((i) => i.product.store.id === shopId);
    const newValue = !checkedShops[shopId];

    const newCheckedProducts = { ...checkedProducts };
    shopProducts.forEach((i) => {
      newCheckedProducts[i.id] = newValue;
    });

    setCheckedProducts(newCheckedProducts);
    setCheckedShops({
      ...checkedShops,
      [shopId]: newValue,
    });

    const allProductsChecked = cartItems.every((i) => newCheckedProducts[i.id]);
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
  const changeQuantity = async (cartItemId: string, delta: number) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + delta);
    if (newQty === item.quantity) return;

    try {
      setUpdatingQuantities(prev => ({ ...prev, [cartItemId]: true }));
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      await cartService.updateQuantity(token, cartItemId, newQty);
      await fetchCart(); // Refresh cart
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật số lượng');
    } finally {
      setUpdatingQuantities(prev => {
        const newState = { ...prev };
        delete newState[cartItemId];
        return newState;
      });
    }
  };

  // Xóa sản phẩm
  const removeProduct = (cartItemId: string) => {
    setDeletingItemId(cartItemId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItemId) return;

    try {
      setDeleting(true);
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        setShowDeleteModal(false);
        setDeletingItemId(null);
        return;
      }

      await cartService.removeItem(token, deletingItemId);

      const newChecked = { ...checkedProducts };
      delete newChecked[deletingItemId];
      setCheckedProducts(newChecked);

      await fetchCart(); // Refresh cart

      setShowDeleteModal(false);
      setDeletingItemId(null);
    } catch (error: any) {
      console.error('Error removing item:', error);
      Alert.alert('Lỗi', error.message || 'Không thể xóa sản phẩm');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingItemId(null);
  };

  // Xử lý mua hàng
  const handleBuy = () => {
    const selectedItems = cartItems.filter(item => checkedProducts[item.id]);

    if (selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    // Tính tổng tiền
    const totalAmount = selectedItems.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    // Gom sản phẩm theo shop
    const selectedShops = Object.values(
      selectedItems.reduce((acc, item) => {
        const shopId = item.product.store.id;
        const shopName = item.product.store.storeName;

        if (!acc[shopId]) {
          acc[shopId] = {
            shopId,
            shopName,
            products: [] as CartItem[],
          };
        }
        acc[shopId].products.push(item);
        return acc;
      }, {} as Record<string, { shopId: string; shopName: string; products: CartItem[] }>)
    );

    // Chuyển sang trang thanh toán với dữ liệu
    router.push({
      pathname: "/payment",
      params: {
        selectedItems: JSON.stringify(selectedItems),
        selectedShops: JSON.stringify(selectedShops),
        totalAmount: totalAmount.toString(),
      }
    });
  };

  // Render 1 shop
  const renderShop = ({
    item,
  }: {
    item: { shopId: string; title: string; products: CartItem[] };
  }) => (
    <View>
      {/* Shop header */}
      <View style={styles.shopHeader}>
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
      {item.products.map((cartItem) => {
        const product = cartItem.product;
        const imageUri = product.images?.[0]?.url;
        const isLoading = updatingQuantities[cartItem.id];

        return (
          <View key={cartItem.id} style={styles.productRow}>
            <CustomCheckbox
              checked={!!checkedProducts[cartItem.id]}
              onToggle={() => toggleProduct(cartItem)}
            />
            <Image
              source={imageUri ? { uri: imageUri } : require("../../../assets/images/cat1.png")}
              style={styles.image}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.productName}>{product.title}</Text>
              <Text style={styles.productDesc}>
                {product.category?.name || 'Chưa phân loại'}
              </Text>

              <View style={styles.rowBetween}>
                <Text style={styles.price}>
                  {(Number(product.price) * cartItem.quantity).toLocaleString()}đ
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={styles.counter}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => changeQuantity(cartItem.id, -1)}
                      disabled={isLoading || cartItem.quantity <= 1}
                    >
                      <Text style={[styles.counterText, (isLoading || cartItem.quantity <= 1) && { opacity: 0.4 }]}>-</Text>
                    </TouchableOpacity>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FBBC05" />
                    ) : (
                      <Text style={styles.counterValue}>{cartItem.quantity}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => changeQuantity(cartItem.id, 1)}
                      disabled={isLoading}
                    >
                      <Text style={[styles.counterText, isLoading && { opacity: 0.4 }]}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeProduct(cartItem.id)}
                    style={{ padding: 4 }}
                  >
                    <Text style={styles.remove}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      })}
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
        <Text style={styles.headerTitle}>Giỏ hàng ({cartItems.length})</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FBBC05" />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-cart" size={64} color="#D0D0D0" />
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.shopId}
          renderItem={renderShop}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
        ]}
      >
        <CustomCheckbox checked={checkedAll} onToggle={toggleAll} />
        <Text style={styles.footerText}>Tất cả</Text>
        <Text style={styles.totalPrice}>
          {Object.keys(checkedProducts)
            .filter((id) => checkedProducts[id])
            .reduce((sum, id) => {
              const item = cartItems.find(i => i.id === id);
              if (!item) return sum;
              return sum + (Number(item.product.price) * item.quantity);
            }, 0)
            .toLocaleString()}đ
        </Text>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={handleBuy}
          disabled={Object.keys(checkedProducts).filter((id) => checkedProducts[id]).length === 0}
        >
          <Text style={styles.buyBtnText}>
            Mua hàng (
            {Object.keys(checkedProducts).filter((id) => checkedProducts[id]).length}
            )
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <TouchableOpacity
          style={styles.deleteModalOverlay}
          activeOpacity={1}
          onPress={handleCancelDelete}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.deleteModalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.deleteIconContainer}>
              <MaterialIcons name="delete-outline" size={50} color="#E53935" />
            </View>
            <Text style={styles.deleteModalTitle}>Xác nhận xóa</Text>
            <Text style={styles.deleteModalMessage}>
              Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?
            </Text>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                onPress={handleCancelDelete}
                disabled={deleting}
              >
                <Text style={styles.deleteModalButtonCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonConfirm]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteModalButtonConfirmText}>Xóa</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
