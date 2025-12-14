import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Review, reviewService } from '../../services/reviewService';
import { reviewStyle } from './reviewStyle';

interface Props {
  item: Review;
  isStoreOwner: boolean;
  onReplySuccess: () => void;
}

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating)
      stars.push(<FontAwesome5 key={i} name="star" size={16} color="#FFD700" solid />);
    else if (i === Math.ceil(rating) && rating % 1 !== 0)
      stars.push(<FontAwesome5 key={i} name="star-half-alt" size={16} color="#FFD700" solid />);
    else
      stars.push(<FontAwesome5 key={i} name="star" size={16} color="#E0E0E0" />);
  }
  return <View style={{ flexDirection: 'row', gap: 3 }}>{stars}</View>;
};

export const ReviewItem: React.FC<Props> = ({ item, isStoreOwner, onReplySuccess }) => {
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      setReplying(true);
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) throw new Error('Phiên đăng nhập hết hạn');

      await reviewService.replyReview(item.id, replyText.trim(), token);

      Alert.alert('Thành công', 'Đã gửi phản hồi đến khách hàng');
      setReplyText('');
      onReplySuccess(); // reload lại danh sách để thấy reply mới
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể gửi phản hồi');
    } finally {
      setReplying(false);
    }
  };

  return (
    <View style={reviewStyle.container}>
      {/* Header */}
      <View style={reviewStyle.header}>
        <Image
          source={
            item.user?.avatarUrl
              ? { uri: item.user.avatarUrl }
              : require('../../assets/images/icon.png')
          }
          style={reviewStyle.avatar}
        />
        <View style={reviewStyle.userInfo}>
          <Text style={reviewStyle.username}>
            {item.user?.username || 'Khách hàng'}
          </Text>
          <View style={reviewStyle.ratingRow}>
            {renderStars(item.rating)}
            <Text style={reviewStyle.date}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>

      {/* Nội dung đánh giá */}
      {item.content && <Text style={reviewStyle.content}>{item.content}</Text>}

      {/* Ảnh đánh giá */}
      {item.images?.length > 0 && (
        <View style={reviewStyle.imagesContainer}>
          {item.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={reviewStyle.reviewImage} />
          ))}
        </View>
      )}

      {/* Form trả lời – chỉ hiện cho chủ shop khi chưa có reply */}
      {isStoreOwner && !item.sellerReply && (
        <View style={reviewStyle.replyForm}>
          <Text style={reviewStyle.replyTitle}>Trả lời khách hàng</Text>
          <TextInput
            style={reviewStyle.replyInput}
            placeholder="Nhập phản hồi của bạn..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[
              reviewStyle.replyButton,
              (!replyText.trim() || replying) && reviewStyle.replyButtonDisabled,
            ]}
            onPress={handleReply}
            disabled={!replyText.trim() || replying}
          >
            {replying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={reviewStyle.replyButtonText}>Gửi phản hồi</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Phản hồi đã gửi (cả khách và chủ shop đều thấy) */}
      {item.sellerReply && (
        <View style={reviewStyle.sellerReplyBox}>
          <Text style={reviewStyle.sellerReplyTitle}>Trả lời từ cửa hàng:</Text>
          <Text style={reviewStyle.sellerReplyText}>{item.sellerReply}</Text>
          {item.replyAt && (
            <Text style={reviewStyle.sellerReplyDate}>
              {formatDate(item.replyAt)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};