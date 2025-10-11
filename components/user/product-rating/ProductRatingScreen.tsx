import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './productRatingStyles';

const reviewsData = [
  {
    id: 1,
    name: 'Le Thien Phuc',
    date: '11/04/2024',
    rating: 5,
    comment: 'Phân loại: Cát vệ sinh trà xanh',
    images: [
      require('../../../assets/images/icon.png'),
      require('../../../assets/images/icon.png'),
    ],
  },
  {
    id: 2,
    name: 'Le Thien Phuc',
    date: '11/04/2024',
    rating: 5,
    comment: 'Phân loại: Cát vệ sinh trà xanh',
    images: [
      require('../../../assets/images/icon.png'),
      require('../../../assets/images/icon.png'),
    ],
  },
];

export default function ProductRatingScreen() {
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const renderStars = (rating: number, size: number = 16, onPress?: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <FontAwesome
              name={star <= rating ? 'star' : 'star-o'}
              size={size}
              color="#FBBC05"
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={styles.productSection}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>Cát vệ sinh đậu nành Cats me</Text>
            <Text style={styles.productBrand}>Catsme Than</Text>
            <Text style={styles.productPrice}>121.599đ</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Đánh giá của bạn</Text>
          {renderStars(userRating, 24, setUserRating)}
        </View>

        {/* Review Text Input */}
        <View style={styles.reviewSection}>
          <TextInput
            style={styles.reviewInput}
            placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={reviewText}
            onChangeText={setReviewText}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons Row */}
        <View style={styles.buttonRow}>
          {/* Add Photos Button */}
          <TouchableOpacity style={styles.addPhotoButton}>
            <MaterialIcons name="add-a-photo" size={20} color="#FBBC05" />
            <Text style={styles.addPhotoText}>Thêm hình ảnh</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews History */}
        <View style={styles.reviewsHistory}>
          <Text style={styles.historyTitle}>Lịch sử đánh giá</Text>

          {reviewsData.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={require('../../../assets/images/icon.png')}
                  style={styles.reviewerAvatar}
                />
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                  {renderStars(review.rating, 14)}
                </View>
              </View>

              <Text style={styles.reviewComment}>{review.comment}</Text>

              {/* Review Images */}
              <View style={styles.reviewImages}>
                <Text style={styles.reviewImagesTitle}>Sản phẩm nhật chất lượng</Text>
                <View style={styles.imagesRow}>
                  {review.images.map((image, index) => (
                    <Image
                      key={index}
                      source={image}
                      style={styles.reviewImage}
                    />
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}