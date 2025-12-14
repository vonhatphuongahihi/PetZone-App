import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { addressService, UserAddress } from "../../../services/addressService";
import { tokenService } from "../../../services/tokenService";
import styles from "./addAddressStyle";

export default function AddAddressScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [street, setStreet] = useState("");
  const [loading, setLoading] = useState(false);

  // Addresses list state
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // dropdown loại địa chỉ
  const [type, setType] = useState("Nhà riêng");
  const [showDropdown, setShowDropdown] = useState(false);
  const addressTypes = ["Nhà riêng", "Văn phòng"];

  // popup state
  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load addresses from API
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const token = await tokenService.getToken();
      if (!token) return;

      const response = await addressService.getUserAddresses(token);
      setAddresses(response.data);
    } catch (error: any) {
      console.error('Load addresses error:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Load addresses when screen focused
  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  // Auto-close success popup after 1 second
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSaveAddress = async () => {
    // Validate form
    if (!name.trim() || !phone.trim() || !province.trim() || !street.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const token = await tokenService.getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        router.navigate('/login');
        return;
      }

      const addressData = {
        name: name.trim(),
        phoneNumber: phone.trim(),
        province: province.trim(),
        street: street.trim(),
        type: type,
        isDefault: false
      };

      await addressService.addAddress(addressData, token);
      
      // Clear form
      setName("");
      setPhone("");
      setProvince("");
      setStreet("");
      setType("Nhà riêng");
      
      setShowSuccess(true);
      await loadAddresses();
    } catch (error: any) {
      console.error('Add address error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể thêm địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    console.log('🗑️ DELETE INITIATED for ID:', addressId);
    
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    
    if (!addressToDelete) {
      console.error('❌ Address not found in list!');
      Alert.alert('Lỗi', 'Không tìm thấy địa chỉ cần xóa');
      return;
    }
    
    if (addressToDelete.isDefault) {
      console.log('⚠️ Cannot delete default address');
      Alert.alert(
        'Không thể xóa', 
        'Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước.'
      );
      return;
    }

    // Xóa trực tiếp không cần confirm
    try {
      console.log('🔥 Starting delete process for:', addressId);
      const token = await tokenService.getToken();
      
      if (!token) {
        console.error('❌ No token available');
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }
      
      console.log('🌐 Calling API delete...');
      await addressService.deleteAddress(addressId, token);
      console.log('✅ Delete API success');
      
      console.log('🔄 Reloading addresses...');
      await loadAddresses();
      
      Alert.alert('Thành công', 'Đã xóa địa chỉ');
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const token = await tokenService.getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }
      
      await addressService.setDefaultAddress(addressId, token);
      await loadAddresses();
      Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đặt địa chỉ mặc định');
    }
  };

  const renderAddressItem = ({ item }: { item: UserAddress }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressNameRow}>
          <Text style={styles.addressName}>{item.name}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Mặc định</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          {!item.isDefault && (
            <TouchableOpacity
              style={styles.setDefaultBtn}
              onPress={() => handleSetDefault(item.id)}
            >
              <Text style={styles.setDefaultText}>Đặt mặc định</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.deleteBtn, { 
              padding: 8, 
              zIndex: 999,
              elevation: 5 
            }]}
            activeOpacity={0.6}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            onPress={() => {
              console.log('🗑️ DELETE BUTTON PRESSED!');
              console.log('Item:', item.id, item.name);
              handleDeleteAddress(item.id);
            }}
          >
            <MaterialIcons name="delete" size={22} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.addressPhone}>{item.phoneNumber}</Text>
      <Text style={styles.addressDetail}>
        {item.street}, {item.province}
      </Text>
      <View style={styles.addressTypeContainer}>
        <MaterialIcons 
          name={item.type === 'Văn phòng' ? 'business' : 'home'} 
          size={16} 
          color="#666" 
        />
        <Text style={styles.addressType}>{item.type}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FCCB05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ người dùng</Text>
      </View>

      {/* Lưu ý */}
      <Text style={styles.noteText}>
        Địa chỉ (dùng thông tin trước sát nhập)
      </Text>

      {/* Nội dung */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ padding: 15 }}>
          <Text style={styles.label}>Họ và Tên</Text>
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName}
            placeholder="Nhập họ và tên"
          />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Nhập số điện thoại"
          />

          <Text style={styles.label}>Tỉnh/Thành phố, Quận/Huyện, Phường/Xã</Text>
          <TextInput
            style={[styles.input, { height: 50 }]}
            value={province}
            onChangeText={setProvince}
            multiline
            placeholder="Nhập địa chỉ"
          />

          <Text style={styles.label}>Tên đường, Tòa nhà, Số nhà</Text>
          <TextInput 
            style={styles.input} 
            value={street} 
            onChangeText={setStreet}
            placeholder="Nhập tên đường, số nhà"
          />

          {/* Loại địa chỉ */}
          <Text style={styles.label}>Loại địa chỉ</Text>
          <View style={{ zIndex: 10, marginBottom: 60 }}>
            <TouchableOpacity
              style={styles.select}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text>{type}</Text>
              <MaterialIcons
                name={showDropdown ? "arrow-drop-up" : "arrow-drop-down"}
                size={24}
                color="#555"
              />
            </TouchableOpacity>

            {showDropdown && (
              <View style={[styles.dropdown, { 
                position: 'absolute', 
                top: 45, 
                left: 0, 
                right: 0,
                zIndex: 1000,
                elevation: 10
              }]}>
                {addressTypes.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setType(item);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.footer, { marginTop: 20 }]}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setShowCancel(true)}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSaveAddress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveText}>Hoàn thành</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Addresses List */}
        <View style={styles.addressListContainer}>
          <Text style={styles.addressListTitle}>Địa chỉ đã lưu</Text>
          {loadingAddresses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFB400" />
              <Text style={styles.loadingText}>Đang tải địa chỉ...</Text>
            </View>
          ) : addresses.length > 0 ? (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item: UserAddress) => item.id}
              style={[styles.addressList, { maxHeight: 400 }]}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              removeClippedSubviews={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="location-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có địa chỉ nào được lưu</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* POPUP HỦY */}
      <Modal transparent visible={showCancel} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertCard}>
            <View style={[styles.alertHeader, { backgroundColor: "#F44336" }]}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="error-outline" size={28} color="#F44336" />
              </View>
              <Text style={styles.alertHeaderText}>
                Bạn có chắc chắn muốn hủy thêm địa chỉ?
              </Text>
            </View>

            <View style={styles.alertBody}>
              <TouchableOpacity
                style={[styles.alertPrimaryBtn, { backgroundColor: "#F44336" }]}
                onPress={() => {
                  setShowCancel(false);
                  router.back();
                }}
              >
                <Text style={styles.alertPrimaryBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.alertSecondaryBtn}
                onPress={() => setShowCancel(false)}
              >
                <Text style={styles.alertSecondaryBtnText}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* POPUP THÀNH CÔNG */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertCard}>
            <View style={[styles.alertHeader, { backgroundColor: "#FBBC05" }]}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="check" size={28} color="#FBBC05" />
              </View>
              <Text style={styles.alertHeaderText}>
                Thêm địa chỉ thành công!
              </Text>
            </View>

            <View style={styles.alertBody}>
              {/* Auto-close after 1 second - no button needed */}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}