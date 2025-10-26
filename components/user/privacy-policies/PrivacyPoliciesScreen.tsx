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
import { styles } from './privacyPoliciesStyles';

const privacyItems = [
  {
    id: 1,
    title: 'Mục đích thu thập thông tin',
    icon: require('../../../assets/images/icon.png'),
  },
  {
    id: 2,
    title: 'Phạm vi sử dụng thông tin',
    icon: require('../../../assets/images/icon.png'),
  },
  {
    id: 3,
    title: 'Quản lý và lưu trữ thông tin',
    icon: require('../../../assets/images/icon.png'),
  },
  {
    id: 4,
    title: 'Cam kết bảo mật thông tin',
    icon: require('../../../assets/images/icon.png'),
  },
];

export default function PrivacyPoliciesScreen() {
  const handleItemPress = (title: string) => {
    console.log(`Navigating to: ${title}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
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
          <Text style={styles.mainTitle}>Chính sách bảo mật</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Privacy Items */}
        <View style={styles.itemsContainer}>
          {privacyItems.map((item) => (
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