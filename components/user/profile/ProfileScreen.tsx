import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { orderService } from "../../../services/orderService";
import { tokenService } from "../../../services/tokenService";
import { UserInfo, userInfoService } from "../../../services/userInfoService";
import { styles } from "./profileStyles";

export default function ProfileScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderCounts, setOrderCounts] = useState({
    pending: 0,
    shipped: 0,
    delivered: 0,
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrderCounts();
    }, [])
  );

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const token = await tokenService.getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await userInfoService.getUserInfo(token);
      setUserInfo(response.user);
      console.log('User info loaded:', response.user);
      console.log('Total spent:', response.user.totalSpent);
    } catch (error: any) {
      console.error('Load user info error:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderCounts = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) return;

      // Load counts for each status
      const [pendingRes, confirmedRes, shippedRes] = await Promise.all([
        orderService.getUserOrders(token, 'pending').catch(() => ({ data: [] })),
        orderService.getUserOrders(token, 'confirmed').catch(() => ({ data: [] })),
        orderService.getUserOrders(token, 'shipped').catch(() => ({ data: [] })),
      ]);

      setOrderCounts({
        pending: pendingRes.data?.length || 0,
        shipped: confirmedRes.data?.length || 0, // "Giao hàng" = confirmed orders
        delivered: shippedRes.data?.length || 0, // "Đánh giá" = shipped orders (đã nhận hàng)
      });
    } catch (error: any) {
      console.error('Error loading order counts:', error);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('jwt_token'); // Xóa cả jwt_token

      // Disconnect Socket.IO
      const { disconnectSocket } = await import('../../../services/socket');
      disconnectSocket();
    } catch (e) {
      console.error('Error during logout:', e);
    }
    // Chuyển về trang đăng nhập
    router.replace('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Tính rank dựa trên totalSpent
  const getUserRank = (totalSpent: number | null | undefined): string => {
    const spent = totalSpent || 0;
    if (spent >= 500001) {
      return 'Hạng vàng';
    } else if (spent >= 300100) {
      return 'Hạng bạc';
    } else if (spent >= 100100) {
      return 'Hạng đồng';
    } else {
      return 'Thân thiết';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FFB400" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={
              userInfo?.avatarUrl
                ? { uri: userInfo.avatarUrl }
                : require("../../../assets/images/user.jpg")
            }
            style={styles.avatar}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>
              {userInfo?.username || 'Đang tải...'}
            </Text>
            <Text style={styles.rank}>{getUserRank(userInfo?.totalSpent)}</Text>
          </View>
          <View style={styles.pawCircle}>
            <FontAwesome5 name="paw" size={24} color="#fff" />
          </View>
        </View>

        {/* Đơn đã mua */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Đơn đã mua</Text>
            <TouchableOpacity onPress={() => router.push('/purchase-history')}>
              <Text style={styles.link}>Lịch sử mua hàng &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <MenuItem
              icon="credit-card"
              label="Xác nhận"
              badge={orderCounts.pending > 0 ? orderCounts.pending : undefined}
              onPress={() => router.push('/order-confirm')}
            />
            <MenuItem
              icon="local-shipping"
              label="Giao hàng"
              badge={orderCounts.shipped > 0 ? orderCounts.shipped : undefined}
              onPress={() => router.push('/delivery')}
            />
            <MenuItem
              icon="star"
              label="Đánh giá"
              badge={orderCounts.delivered > 0 ? orderCounts.delivered : undefined}
              onPress={() => router.push('/product-rating')}
            />
          </View>
        </View>

        {/* Hồ sơ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Hồ sơ</Text>
          </View>
          <View style={styles.row}>
            <MenuItem
              icon="person"
              label="Tài khoản"
              onPress={() => router.push('/user-info')}
            />
            <MenuItem
              icon="shopping-cart"
              label="Giỏ hàng"
              onPress={() => router.push('/cart')}
            />
            <MenuItem
              icon="location-on"
              label="Địa chỉ"
              onPress={() => router.push('/addAddress')}
            />
          </View>
        </View>

        {/* Menu nhỏ */}
        <TouchableOpacity style={[styles.menuItem, styles.firstMenuItem]} onPress={() => router.push('/terms-of-use')}>
          <Text style={styles.menuText}>Điều khoản sử dụng</Text>
          <MaterialIcons name="chevron-right" size={25} color="#FBBC05" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy-policies')}>
          <Text style={styles.menuText}>Bảo mật</Text>
          <MaterialIcons name="chevron-right" size={25} color="#FBBC05" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/about-us')}>
          <Text style={styles.menuText}>Về chúng tôi</Text>
          <MaterialIcons name="chevron-right" size={25} color="#FBBC05" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/support')}>
          <Text style={styles.menuText}>Hỗ trợ</Text>
          <MaterialIcons name="chevron-right" size={25} color="#FBBC05" />
        </TouchableOpacity>

        {/* Nút đăng xuất */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Cat Image */}
            <Image
              source={require("../../../assets/images/dog-feet.png")}
              style={styles.modalCatImage}
            />

            {/* Modal Text */}
            <Text style={styles.modalTitle}>Đăng xuất khỏi PetZone?</Text>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelLogout}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmLogout}>
                <Text style={styles.confirmButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type MenuItemProps = {
  icon: string;
  label: string;
  badge?: number;
  onPress?: () => void;
};

function MenuItem({ icon, label, badge, onPress }: MenuItemProps) {
  return (
    <View style={styles.menuItemCard}>
      <TouchableOpacity style={styles.menuBox} onPress={onPress}>
        <MaterialIcons name={icon as any} size={26} color="#FBBC05" />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <Text style={styles.menuLabel}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}