import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { styles } from './orderConfirmStyles';

const purchaseData = [
  {
    id: 1,
    name: 'Cát vệ sinh đậu nành Cats me',
    brand: 'Catsme Than',
    price: '121.599đ',
    originalPrice: '234.198đ',
    discount: '2 sản phẩm',
    quantity: 'x2',
    image: require('../../assets/images/icon.png'),
  },
];

export default function OrderConfirmScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Product List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {purchaseData.map((item) => (
          <View key={item.id} style={styles.productCard}>
            <View style={styles.productContent}>
              {/* Product Image */}
              <Image source={item.image} style={styles.productImage} />
              
              {/* Product Details */}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.brandName}>{item.brand}</Text>
                
                <View style={styles.priceSection}>
                  <Text style={styles.currentPrice}>{item.price}</Text>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                </View>
                
                <Text style={styles.discountInfo}>
                  Tổng số tiền ({item.discount}): {item.originalPrice}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderState}>   
                <View style={styles.statusContainer}>
                  <Text style={styles.rateButtonText}>Đang chờ xác nhận</Text>
                </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}