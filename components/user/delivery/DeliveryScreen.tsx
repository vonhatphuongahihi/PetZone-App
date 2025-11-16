import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
                onPress={async () => {
                  try {
                    const token = await AsyncStorage.getItem('jwt_token');
                    if (!token) {
                      router.replace('/login');
                      return;
                    }
                    await orderService.updateOrderStatus(order.id, 'shipped', token);
                    loadOrders();
                  } catch (error: any) {
                    console.error('Error confirming received:', error);
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
    </SafeAreaView>
  );
}