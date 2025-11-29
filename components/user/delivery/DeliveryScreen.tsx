import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order, orderService } from '../../../services/orderService';
import { styles } from './deliveryStyles';

export default function DeliveryScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(0);

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

      const response = await orderService.getUserOrders(token, 'confirmed');
      setOrders(response.data || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCloseRatingModal = async () => {
    // Cập nhật status mà không đánh giá
    if (selectedOrder) {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (!token) {
          router.replace('/login');
          return;
        }
        await orderService.updateOrderStatus(selectedOrder.id, 'shipped', token);
        loadOrders();
      } catch (error: any) {
        console.error('Error confirming received:', error);
      }
    }
    setShowRatingModal(false);
    setSelectedOrder(null);
    setSelectedProduct(null);
    setRating(0);
  };

  const handleRateProduct = async () => {
    if (!selectedProduct || !selectedOrder || rating === 0) return;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Cập nhật status trước
      await orderService.updateOrderStatus(selectedOrder.id, 'shipped', token);

      // Đóng modal và chuyển đến trang đánh giá sản phẩm
      setShowRatingModal(false);
      const productId = selectedProduct.productId || selectedProduct.product?.id;
      if (productId) {
        router.push(`/product?productId=${productId}&orderId=${selectedOrder.id}&rating=${rating}&tab=reviews`);
      } else {
        loadOrders();
      }
    } catch (error: any) {
      console.error('Error rating product:', error);
    } finally {
      setSelectedOrder(null);
      setSelectedProduct(null);
      setRating(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giao hàng</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FBBC05" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="local-shipping" size={64} color="#D0D0D0" />
          <Text style={{ marginTop: 12, fontSize: 16, color: '#999', textAlign: 'center' }}>
            Chưa có đơn hàng nào đang giao
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
                  <Text style={styles.statusText}>Đang giao hàng</Text>
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

              {/* Delivery Info */}
              {order.estimatedDeliveryDate && (
                <View style={styles.deliveryInfo}>
                  <MaterialIcons name="schedule" size={18} color="#2196F3" />
                  <Text style={styles.deliveryText}>
                    Dự kiến giao hàng: {formatDate(order.estimatedDeliveryDate)}
                  </Text>
                </View>
              )}

              {/* Confirm Received Button */}
              <TouchableOpacity
                style={styles.receivedButton}
                onPress={() => {
                  // Hiển thị popup đánh giá cho sản phẩm đầu tiên trong đơn hàng
                  if (order.orderItems && order.orderItems.length > 0) {
                    setSelectedOrder(order);
                    setSelectedProduct(order.orderItems[0]);
                    setRating(0);
                    setShowRatingModal(true);
                  }
                }}
              >
                <MaterialIcons name="check-circle" size={20} color="#fff" />
                <Text style={styles.receivedButtonText}>Đã nhận hàng</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.ratingModalOverlay}>
          <View style={styles.ratingModalContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.ratingModalClose}
              onPress={() => {
                handleCloseRatingModal();
              }}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>

            {/* Success Icon */}
            <View style={styles.ratingModalIcon}>
              <MaterialIcons name="check-circle" size={50} color="#4CAF50" />
            </View>

            {/* Question */}
            <Text style={styles.ratingModalTitle}>
              Bạn có hài lòng với đơn hàng?
            </Text>

            {/* Stars */}
            <View style={styles.ratingStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.ratingStarButton}
                >
                  <FontAwesome
                    name={star <= rating ? 'star' : 'star-o'}
                    size={32}
                    color="#FBBC05"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.ratingModalActions}>
              <TouchableOpacity
                style={[styles.ratingModalButton, styles.ratingModalButtonSecondary]}
                onPress={() => {
                  handleCloseRatingModal();
                }}
              >
                <Text style={styles.ratingModalButtonTextSecondary}>Bỏ qua</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ratingModalButton,
                  styles.ratingModalButtonPrimary,
                  rating === 0 && styles.ratingModalButtonDisabled
                ]}
                onPress={() => {
                  if (rating > 0) {
                    handleRateProduct();
                  }
                }}
                disabled={rating === 0}
              >
                <Text style={styles.ratingModalButtonTextPrimary}>Đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}