import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./profileStyles";

export default function ProfileScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    // Thực hiện đăng xuất tại đây
    console.log("Đã đăng xuất");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../../assets/images/icon.png")} // sử dụng icon.png thay cho avatar
            style={styles.avatar}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>Vo Nhat Phuong</Text>
            <Text style={styles.rank}>Hạng bạc</Text>
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
              <Text style={styles.link}>Xem tất cả &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <MenuItem
              icon="credit-card"
              label="Xác nhận"
              onPress={() => router.push('/order-confirm')}
            />
            <MenuItem icon="local-shipping" label="Giao hàng"
              onPress={() => router.push('/delivery')}
            />
            <MenuItem icon="star" label="Đánh giá" badge={1}
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
            <MenuItem icon="person" label="Tài khoản" />
            <MenuItem icon="shopping-cart" label="Giỏ hàng" />
            <MenuItem icon="location-on" label="Địa chỉ" />
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
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Về chúng tôi</Text>
          <MaterialIcons name="chevron-right" size={25} color="#FBBC05" />
        </View>

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
              source={require("../../../assets/images/icon.png")}
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