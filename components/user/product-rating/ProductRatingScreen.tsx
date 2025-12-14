import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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
import { Review, reviewService } from '../../../services/reviewService';
import { styles } from './productRatingStyles';

export default function ProductRatingScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserReviews();
  }, []);

  const loadUserReviews = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await reviewService.getUserReviews(token);
      setReviews(response.data || []);
    } catch (error: any) {
      console.error('Error loading user reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesome
            key={star}
            name={star <= rating ? 'star' : 'star-o'}
            size={size}
            color="#FBBC05"
            style={{ marginRight: 8 }}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FBBC05" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải...</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="star-outline" size={64} color="#D0D0D0" />
          <Text style={{ marginTop: 12, fontSize: 16, color: '#999', textAlign: 'center' }}>
            Bạn chưa có đánh giá nào
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.reviewsHistory}>
            <Text style={styles.historyTitle}>Tất cả đánh giá của bạn</Text>

            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={
                      review.product?.images?.[0]?.url
                        ? { uri: review.product.images[0].url }
                        : require('../../../assets/images/icon.png')
                    }
                    style={styles.reviewerAvatar}
                  />
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.product?.title || 'Sản phẩm'}</Text>
                    {review.product?.store?.storeName && (
                      <Text style={styles.shopName}>Shop: {review.product.store.storeName}</Text>
                    )}
                    <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                    {renderStars(review.rating, 14)}
                  </View>
                </View>

                {review.content && (
                  <Text style={styles.reviewComment}>{review.content}</Text>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <View style={styles.reviewImages}>
                    <View style={styles.imagesRow}>
                      {review.images.map((imageUrl, index) => (
                        <Image
                          key={index}
                          source={{ uri: imageUrl }}
                          style={styles.reviewImage}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* Product Link */}
                <TouchableOpacity
                  style={styles.viewProductButton}
                  onPress={() => {
                    if (review.productId) {
                      router.push(`/product?productId=${review.productId}`);
                    }
                  }}
                >
                  <Text style={styles.viewProductText}>Xem sản phẩm</Text>
                  <MaterialIcons name="arrow-forward-ios" size={16} color="#FBBC05" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}