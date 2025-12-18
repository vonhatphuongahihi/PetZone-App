import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order, orderService } from '../../../services/orderService';
import { styles } from './orderConfirmStyles';

export default function OrderConfirmScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await orderService.getUserOrders(token, 'pending');
      setOrders(response.data);
    } catch (error: any) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrderId) return;

    try {
      setCancellingOrderId(selectedOrderId);
      setShowCancelModal(false);
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) return;

      await orderService.cancelOrder(selectedOrderId, token);
      setShowCancelModal(false);
      setSelectedOrderId(null);
      loadOrders(); // Reload danh sách
    } catch (error: any) {
      setShowCancelModal(false);
      setSelectedOrderId(null);
      // Có thể thêm một modal thông báo lỗi nếu cần
      console.error('Error cancelling order:', error);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const cancelCancelOrder = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FBBC05" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="receipt" size={64} color="#D0D0D0" />
          <Text style={{ marginTop: 12, fontSize: 16, color: '#999', textAlign: 'center' }}>
            Chưa có đơn hàng nào chờ xác nhận
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <Text style={styles.storeName}>{order.store?.storeName || 'Shop'}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Chờ xác nhận</Text>
                </View>
              </View>

              {/* Order Items - Hiển thị từng sản phẩm riêng */}
              <View style={styles.orderItemsContainer}>
                {order.orderItems.map((item, index) => {
                  const imageUri = item.product?.images?.[0]?.url;
                  const itemTotal = Number(item.unitPrice) * item.quantity;
                  return (
                    <View key={item.id || index} style={styles.orderItem}>
                      <Image
                        source={imageUri ? { uri: imageUri } : require('../../../assets/images/icon.png')}
                        style={styles.productImage}
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <View style={styles.itemPriceRow}>
                          <Text style={styles.itemPrice}>
                            {Number(item.unitPrice).toLocaleString()}đ
                          </Text>
                          <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        </View>
                        <Text style={styles.itemTotal}>
                          Thành tiền: {itemTotal.toLocaleString()}đ
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Order Summary */}
              <View style={styles.orderSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tạm tính:</Text>
                  <Text style={styles.summaryValue}>
                    {Number(order.subtotal).toLocaleString()}đ
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
                  <Text style={styles.summaryValue}>
                    {Number(order.shippingFee).toLocaleString()}đ
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Tổng cộng:</Text>
                  <Text style={styles.totalValue}>
                    {Number(order.total).toLocaleString()}đ
                  </Text>
                </View>
              </View>

              {/* Cancel Button */}
              <View style={styles.cancelButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    cancellingOrderId === order.id && styles.cancelButtonDisabled,
                  ]}
                  onPress={() => handleCancelOrder(order.id)}
                  disabled={cancellingOrderId === order.id}
                >
                  {cancellingOrderId === order.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialIcons name="cancel" size={16} color="#fff" />
                      <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Cancel Order Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelCancelOrder}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Icon */}
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="cancel" size={48} color="#E53935" />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Hủy đơn hàng</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cancelCancelOrder}
              >
                <Text style={styles.modalCancelButtonText}>Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmCancelOrder}
                disabled={cancellingOrderId !== null}
              >
                {cancellingOrderId === selectedOrderId ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Có, hủy đơn</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}