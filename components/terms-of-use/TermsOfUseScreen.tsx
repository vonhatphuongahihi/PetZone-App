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
import { styles } from './termsOfUseStyles';

const termsItems = [
  {
    id: 1,
    title: 'Hướng dẫn sử dụng PetZone',
    icon: require('../../assets/images/icon.png'),
  },
  {
    id: 2,
    title: 'Quy định về tài khoản',
    icon: require('../../assets/images/icon.png'),
  },
  {
    id: 3,
    title: 'Chính sách mua bán',
    icon: require('../../assets/images/icon.png'),
  },
  {
    id: 4,
    title: 'Chính sách giao nhận hàng',
    icon: require('../../assets/images/icon.png'),
  },
  {
    id: 5,
    title: 'Chính sách thanh toán',
    icon: require('../../assets/images/icon.png'),
  },
  {
    id: 6,
    title: 'Chính sách đổi trả và hoàn tiền',
    icon: require('../../assets/images/icon.png'),
  },
];

export default function TermsOfUseScreen() {
  const handleItemPress = (title: string) => {
    // Điều hướng đến trang chi tiết của từng mục
    console.log(`Navigating to: ${title}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều khoản sử dụng</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Background Design */}
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Điều khoản sử dụng</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Terms Items */}
        <View style={styles.itemsContainer}>
          {termsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.termItem}
              onPress={() => handleItemPress(item.title)}
              activeOpacity={0.7}
            >
              <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                  <Image source={item.icon} style={styles.itemIcon} />
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <MaterialIcons name="chevron-right" size={24} color="#FBBC05" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}