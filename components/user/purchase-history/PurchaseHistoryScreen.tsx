import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Order, orderService } from '../../../services/orderService';
import { styles } from './purchaseHistoryStyles';

interface PurchaseItem {
  id: string;
  orderId: string;
  productId: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image: string | null;
  orderDate: string;
}

export default function PurchaseHistoryScreen() {
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchaseHistory();
  }, []);

  const loadPurchaseHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Lấy tất cả đơn hàng đã shipped (đã nhận hàng)
      const response = await orderService.getUserOrders(token, 'shipped');
      const orders: Order[] = response.data || [];

      // Flatten order items thành purchase items
      const items: PurchaseItem[] = [];
      orders.forEach((order) => {
        order.orderItems.forEach((item) => {
          items.push({
            id: `${order.id}-${item.id}`,
            orderId: order.id,
            productId: item.productId || 0,
            name: item.title,
            brand: order.store?.storeName || 'Shop',
            price: Number(item.unitPrice),
            quantity: item.quantity,
            totalPrice: Number(item.totalPrice),
            image: item.product?.images?.[0]?.url || null,
            orderDate: order.createdAt,
          });
        });
      });

      // Sắp xếp theo ngày đặt hàng (mới nhất trước)
      items.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

      setPurchaseItems(items);
    } catch (error: any) {
      console.error('Error loading purchase history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử mua hàng</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FBBC05" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải...</Text>
        </View>
      ) : purchaseItems.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="shopping-bag" size={64} color="#D0D0D0" />
          <Text style={{ marginTop: 12, fontSize: 16, color: '#999', textAlign: 'center' }}>
            Chưa có lịch sử mua hàng
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {purchaseItems.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productContent}>
                {/* Product Image */}
                <Image
                  source={item.image ? { uri: item.image } : require('../../../assets/images/icon.png')}
                  style={styles.productImage}
                />

                {/* Product Details */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.brandName}>{item.brand}</Text>

                  <View style={styles.priceSection}>
                    <Text style={styles.currentPrice}>{item.price.toLocaleString()}đ</Text>
                    <Text style={styles.quantity}>x{item.quantity}</Text>
                  </View>

                  <Text style={styles.discountInfo}>
                    Tổng số tiền ({item.quantity} sản phẩm): {item.totalPrice.toLocaleString()}đ
                  </Text>
                  <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    Ngày đặt: {formatDate(item.orderDate)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={() => {
                    if (item.productId) {
                      router.push(`/product?productId=${item.productId}`);
                    }
                  }}
                >
                  <Text style={styles.rateButtonText}>Đánh giá</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buyAgainButton}
                  onPress={() => {
                    if (item.productId) {
                      router.push(`/product?productId=${item.productId}`);
                    }
                  }}
                >
                  <Text style={styles.buyAgainButtonText}>Mua lại</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}