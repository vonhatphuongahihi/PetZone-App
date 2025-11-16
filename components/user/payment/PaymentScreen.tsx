import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { addressService, UserAddress } from "../../../services/addressService";
import { CartItem } from "../../../services/cartService";
import { orderService } from "../../../services/orderService";
import styles from "./paymentStyle";

interface SelectedShop {
    shopId: string;
    shopName: string;
    products: CartItem[];
}

export default function CheckoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
    const [selectedShops, setSelectedShops] = useState<SelectedShop[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [shippingFee] = useState(30000); // Phí vận chuyển cố định
    const [address, setAddress] = useState<UserAddress | null>(null);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    // Load dữ liệu từ params (chỉ chạy một lần khi mount)
    useEffect(() => {
        if (params.selectedItems) {
            try {
                const items = JSON.parse(params.selectedItems as string) as CartItem[];
                setSelectedItems(items);

                if (params.selectedShops) {
                    const shops = JSON.parse(params.selectedShops as string) as SelectedShop[];
                    setSelectedShops(shops);
                }

                if (params.totalAmount) {
                    setTotalAmount(Number(params.totalAmount));
                }
            } catch (error) {
                console.error('Error parsing params:', error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy một lần khi component mount

    // Load địa chỉ mặc định
    useEffect(() => {
        const loadAddress = async () => {
            try {
                setLoadingAddress(true);
                const token = await AsyncStorage.getItem('jwt_token');
                if (!token) return;

                const response = await addressService.getUserAddresses(token);
                const defaultAddress = response.data.find(addr => addr.isDefault) || response.data[0];
                setAddress(defaultAddress || null);
            } catch (error) {
                console.error('Error loading address:', error);
            } finally {
                setLoadingAddress(false);
            }
        };

        loadAddress();
    }, []);

    const handlePlaceOrder = async () => {
        if (!paymentMethod) {
            setShowWarning(true);
            return;
        }

        if (!address) {
            Alert.alert('Lỗi', 'Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (selectedItems.length === 0) {
            Alert.alert('Lỗi', 'Không có sản phẩm nào để đặt hàng');
            return;
        }

        try {
            setPlacingOrder(true);
            const token = await AsyncStorage.getItem('jwt_token');
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                return;
            }

            // Chuẩn bị dữ liệu đơn hàng
            const orderItems = selectedItems.map(item => ({
                productId: item.product.id,
                storeId: item.product.store.id,
                title: item.product.title,
                sku: undefined, // Product có thể không có slug trong CartItem
                price: Number(item.product.price),
                quantity: item.quantity
            }));

            // Tạo đơn hàng
            await orderService.createOrder({
                items: orderItems,
                addressId: address.id,
                paymentMethod: paymentMethod,
                shippingFee: shippingFee
            }, token);

            // Xóa các sản phẩm đã đặt khỏi giỏ hàng (đã được xử lý ở backend)
            // Có thể refresh cart nếu cần

            setShowSuccess(true);
        } catch (error: any) {
            console.error('Error placing order:', error);
            Alert.alert('Lỗi', error.message || 'Không thể đặt hàng. Vui lòng thử lại.');
        } finally {
            setPlacingOrder(false);
        }
    };

    const totalPayment = totalAmount + shippingFee;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/cart")}>
                    <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
            </View>

            {/* Scroll nội dung */}
            <ScrollView
                contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {/* Địa chỉ */}
                <View style={[styles.card, { paddingVertical: 8, paddingHorizontal: 14 }]}>
                    {loadingAddress ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#FBBC05" />
                        </View>
                    ) : address ? (
                        <>
                            <View style={styles.rowBetween}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <MaterialIcons
                                        name="location-on"
                                        size={20}
                                        color="#FBBC05"
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text style={styles.bold}>
                                        {address.name} | {address.phoneNumber}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => router.push("/editAddress")}>
                                    <MaterialIcons
                                        name="arrow-forward-ios"
                                        size={14}
                                        color="rgba(0,0,0,0.55)"
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ marginTop: 4, marginLeft: 28 }}>
                                {address.street}{"\n"}{address.province}
                            </Text>
                        </>
                    ) : (
                        <TouchableOpacity
                            onPress={() => router.push("/addAddress")}
                            style={{ padding: 10 }}
                        >
                            <Text style={{ color: "#FBBC05", textAlign: 'center' }}>
                                + Thêm địa chỉ giao hàng
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Sản phẩm theo shop */}
                {selectedShops.map((shop) => {
                    const shopTotal = shop.products.reduce((sum, item) => {
                        return sum + (Number(item.product.price) * item.quantity);
                    }, 0);
                    const totalQuantity = shop.products.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                        <View key={shop.shopId} style={[styles.card, { paddingVertical: 8, paddingHorizontal: 14, marginTop: 12 }]}>
                            <View style={styles.row}>
                                <MaterialIcons
                                    name="storefront"
                                    size={20}
                                    color="#FBBC05"
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={styles.bold}>{shop.shopName}</Text>
                            </View>

                            {shop.products.map((cartItem) => {
                                const product = cartItem.product;
                                const imageUri = product.images?.[0]?.url;

                                return (
                                    <View key={cartItem.id} style={[styles.row, { marginTop: 10 }]}>
                                        <Image
                                            source={imageUri ? { uri: imageUri } : require("../../../assets/images/cat1.png")}
                                            style={styles.image}
                                        />
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={styles.productName}>
                                                {product.title}
                                            </Text>
                                            <Text style={styles.price}>
                                                {Number(product.price).toLocaleString()}đ
                                            </Text>
                                            <Text style={{ fontSize: 12, color: "gray" }}>
                                                x{cartItem.quantity}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}

                            <View style={[styles.rowBetween, { marginTop: 10 }]}>
                                <Text style={{ color: "gray", fontSize: 13 }}>
                                    Tổng số tiền ({totalQuantity} sản phẩm)
                                </Text>
                                <Text style={styles.price}>{shopTotal.toLocaleString()}đ</Text>
                            </View>
                        </View>
                    );
                })}

                {/* Phương thức thanh toán */}
                <View style={[styles.card, { paddingVertical: 8, paddingHorizontal: 14 }]}>
                    <View style={styles.row}>
                        <MaterialIcons
                            name="account-balance-wallet"
                            size={20}
                            color="#FBBC05"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={styles.bold}>Phương thức thanh toán</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.radioRow}
                        onPress={() =>
                            setPaymentMethod(paymentMethod === "cash" ? "" : "cash")
                        }
                    >
                        <Text>Tiền mặt / Cash</Text>
                        <View
                            style={[
                                styles.radioOuter,
                                paymentMethod === "cash" && styles.radioOuterActive,
                            ]}
                        >
                            {paymentMethod === "cash" && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.radioRow}
                        onPress={() =>
                            setPaymentMethod(paymentMethod === "momo" ? "" : "momo")
                        }
                    >
                        <Text>MoMo / E-wallet</Text>
                        <View
                            style={[
                                styles.radioOuter,
                                paymentMethod === "momo" && styles.radioOuterActive,
                            ]}
                        >
                            {paymentMethod === "momo" && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Chi tiết thanh toán */}
                <View style={[styles.card, { paddingVertical: 8, paddingHorizontal: 14 }]}>
                    <View style={styles.row}>
                        <MaterialIcons
                            name="receipt-long"
                            size={20}
                            color="#FBBC05"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={styles.bold}>Chi tiết thanh toán</Text>
                    </View>

                    <View style={[styles.rowBetween, { marginTop: 10 }]}>
                        <Text>Tổng tiền hàng</Text>
                        <Text>{totalAmount.toLocaleString()}đ</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text>Tổng phí vận chuyển</Text>
                        <Text>{shippingFee.toLocaleString()}đ</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text>Tổng thanh toán</Text>
                        <Text style={styles.boldRed}>{totalPayment.toLocaleString()}đ</Text>
                    </View>
                </View>

                {/* Note */}
                <Text style={styles.note}>
                    Nhấn <Text style={{ color: "red" }}>“Đặt hàng”</Text> đồng nghĩa với
                    việc bạn đồng ý tuân theo Điều khoản PetZone.
                </Text>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerPrice}>{totalPayment.toLocaleString()}đ</Text>
                <TouchableOpacity
                    style={styles.buyBtn}
                    onPress={handlePlaceOrder}
                    disabled={selectedItems.length === 0 || !address || placingOrder}
                >
                    {placingOrder ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buyBtnText}>Đặt hàng</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Popup đặt hàng thành công */}
            <Modal transparent visible={showSuccess} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.popup}>
                        <View style={[styles.popupHeader, { backgroundColor: "#FBBC05" }]}>
                            <MaterialIcons name="check-circle" size={40} color="#fff" />
                            <Text style={styles.popupHeaderText}>Đặt hàng thành công!</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.popupBtnSuccess}
                            onPress={() => {
                                setShowSuccess(false);
                                router.push("/"); // ✅ quay về trang Home
                            }}
                        >
                            <Text style={styles.popupBtnText}>Tiếp tục mua sắm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Popup cảnh báo */}
            <Modal transparent visible={showWarning} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.popup}>
                        <View style={[styles.popupHeader, { backgroundColor: "#F44336" }]}>
                            <MaterialIcons name="error" size={40} color="#fff" />
                            <Text style={styles.popupHeaderText}>
                                Vui lòng chọn phương thức thanh toán
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.popupBtnWarning}
                            onPress={() => setShowWarning(false)}
                        >
                            <Text style={styles.popupBtnText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
