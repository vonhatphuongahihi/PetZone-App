import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addressService } from "../../../services/addressService";
import { styles } from "./editAddressStyle";

export default function EditAddressScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const addressId = params.addressId as string;

    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [province, setProvince] = useState("");
    const [street, setStreet] = useState("");
    const [type, setType] = useState("Nhà riêng");
    const [showDropdown, setShowDropdown] = useState(false);
    const addressTypes = ["Nhà riêng", "Văn phòng"];

    // popup state
    const [showDelete, setShowDelete] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Load địa chỉ từ API
    useEffect(() => {
        const loadAddress = async () => {
            if (!addressId) {
                Alert.alert('Lỗi', 'Không tìm thấy địa chỉ');
                router.back();
                return;
            }

            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('jwt_token');
                if (!token) {
                    Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                    router.back();
                    return;
                }

                const response = await addressService.getUserAddresses(token);
                const address = response.data.find(addr => addr.id === addressId);

                if (!address) {
                    Alert.alert('Lỗi', 'Không tìm thấy địa chỉ');
                    router.back();
                    return;
                }

                setName(address.name);
                setPhone(address.phoneNumber);
                setProvince(address.province);
                setStreet(address.street);
                setType(address.type);
            } catch (error: any) {
                console.error('Error loading address:', error);
                Alert.alert('Lỗi', error.message || 'Không thể tải địa chỉ');
                router.back();
            } finally {
                setLoading(false);
            }
        };

        loadAddress();
    }, [addressId, router]);

    const handleSave = async () => {
        if (!name.trim() || !phone.trim() || !province.trim() || !street.trim()) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('jwt_token');
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                return;
            }

            await addressService.updateAddress(addressId, {
                name: name.trim(),
                phoneNumber: phone.trim(),
                province: province.trim(),
                street: street.trim(),
                type: type,
            }, token);

            setShowSuccess(true);
        } catch (error: any) {
            console.error('Error updating address:', error);
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật địa chỉ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            const token = await AsyncStorage.getItem('jwt_token');
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                return;
            }

            await addressService.deleteAddress(addressId, token);
            setShowDelete(false);
            router.back();
        } catch (error: any) {
            console.error('Error deleting address:', error);
            Alert.alert('Lỗi', error.message || 'Không thể xóa địa chỉ');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FBBC05" />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang tải địa chỉ...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back-ios" size={24} color="#FCCB05" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sửa Địa chỉ</Text>
            </View>

            {/* Lưu ý */}
            <Text style={styles.noteText}>
                Địa chỉ (dùng thông tin trước sáp nhập)
            </Text>

            {/* Nội dung */}
            <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 80 }}>
                <Text style={styles.label}>Họ và Tên</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <Text style={styles.label}>Tỉnh/Thành phố, Quận/Huyện, Phường/Xã</Text>
                <TextInput
                    style={[styles.input, { height: 70 }]}
                    value={province}
                    onChangeText={setProvince}
                    multiline
                />

                <Text style={styles.label}>Tên đường, Tòa nhà, Số nhà</Text>
                <TextInput style={styles.input} value={street} onChangeText={setStreet} />

                <Text style={styles.label}>Loại địa chỉ</Text>
                <View>
                    {/* Nút mở dropdown */}
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

                    {/* Danh sách dropdown */}
                    {showDropdown && (
                        <View style={styles.dropdown}>
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
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => setShowDelete(true)}
                    disabled={deleting}
                >
                    <Text style={styles.deleteText}>Xóa địa chỉ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.saveText}>Hoàn thành</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* POPUP XÓA */}
            <Modal transparent visible={showDelete} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.alertCard}>
                        <View style={[styles.alertHeader, { backgroundColor: "#AF0000" }]}>
                            <View style={styles.iconCircle}>
                                <MaterialIcons name="error-outline" size={28} color="#AF0000" />
                            </View>
                            <Text style={styles.alertHeaderText}>
                                Bạn có chắc chắn muốn xóa địa chỉ này?
                            </Text>
                        </View>

                        <View style={styles.alertBody}>
                            <TouchableOpacity
                                style={[styles.alertPrimaryBtn, { backgroundColor: "#AF0000" }]}
                                onPress={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.alertPrimaryBtnText}>Xóa</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.alertSecondaryBtn}
                                onPress={() => setShowDelete(false)}
                                disabled={deleting}
                            >
                                <Text style={styles.alertSecondaryBtnText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* POPUP THÀNH CÔNG */}
            <Modal transparent visible={showSuccess} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.alertCard}>
                        <View style={[styles.alertHeader, { backgroundColor: "#229B00" }]}>
                            <View style={styles.iconCircle}>
                                <MaterialIcons name="check" size={28} color="#229B00" />
                            </View>
                            <Text style={styles.alertHeaderText}>
                                Sửa địa chỉ thành công!
                            </Text>
                        </View>

                        <View style={styles.alertBody}>
                            <TouchableOpacity
                                style={[styles.alertPrimaryBtn, { backgroundColor: "#229B00" }]}
                                onPress={() => {
                                    setShowSuccess(false);
                                    router.back();
                                }}
                            >
                                <Text style={styles.alertPrimaryBtnText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
