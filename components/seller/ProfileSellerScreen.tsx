import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SellerProfile, sellerService } from '../../services/sellerService';
// SỬA: Import service của user để update avatar cá nhân
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenService } from '../../services/tokenService';
import { userInfoService } from '../../services/userInfoService';
import { SellerBottomNavigation } from './SellerBottomNavigation';
import { SellerTopNavigation } from './SellerTopNavigation';

export default function ProfileSellerScreen() {
    const router = useRouter();

    const [profile, setProfile] = useState<SellerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // --- Avatar & Modal States ---
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showImagePickerModal, setShowImagePickerModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalOpacity] = useState(new Animated.Value(0));
    const [modalScale] = useState(new Animated.Value(0.3));

    // Form data for editing
    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        phoneNumber: '',
        address: '',
        ownerName: ''
    });

    // Load seller profile on component mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const token = await tokenService.getToken();
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                router.replace('/login');
                return;
            }

            // Gọi song song 2 API: Profile cửa hàng và Info cá nhân
            const [sellerResponse, userResponse] = await Promise.all([
                sellerService.getProfile(token),
                userInfoService.getUserInfo(token)
            ]);

            if (!sellerResponse.profile) {
                throw new Error('Profile data not found in response');
            }

            // Lấy profile từ seller service
            const sellerProfileData = sellerResponse.profile;

            // Gán đè avatarUrl từ user service (nơi chứa avatar chính xác nhất) vào seller profile
            // Điều này đảm bảo khi reload, avatar vẫn hiển thị
            const mergedProfile = {
                ...sellerProfileData,
                user: {
                    ...sellerProfileData.user,
                    avatarUrl: userResponse.user.avatarUrl // Lấy avatar từ UserInfo
                }
            };

            setProfile(mergedProfile);

            // Set form data
            setFormData({
                storeName: sellerProfileData.store.storeName,
                description: sellerProfileData.store.description || '',
                phoneNumber: sellerProfileData.store.phoneNumber || '',
                address: sellerProfileData.store.address || '',
                ownerName: sellerProfileData.user.username || ''
            });

        } catch (error: any) {
            console.error('Load profile error:', error);
            if (error.message?.includes('404')) {
                Alert.alert('Chưa có cửa hàng', 'Vui lòng tạo cửa hàng trước.', [
                    { text: 'Tạo cửa hàng', onPress: () => router.replace('/create-store') }
                ]);
            } else {
                Alert.alert('Lỗi', error.message || 'Không thể tải thông tin profile');
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Animation Logic ---
    const showModal = () => {
        Animated.parallel([
            Animated.timing(modalOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(modalScale, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hideModal = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(modalOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(modalScale, {
                toValue: 0.3,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            callback && callback();
        });
    };

    // --- Image Picker Logic ---
    const handleAvatarPress = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện!');
                return;
            }
            setShowImagePickerModal(true);
            setTimeout(() => showModal(), 100);
        } catch (error) {
            console.error('Avatar permission error:', error);
            Alert.alert('Lỗi', 'Không thể truy cập thư viện ảnh');
        }
    };

    const handleImagePickerClose = () => {
        hideModal(() => setShowImagePickerModal(false));
    };

    const handlePickFromLibrary = () => {
        handleImagePickerClose();
        setTimeout(() => pickImageFromLibrary(), 300);
    };

    const handleTakePicture = () => {
        handleImagePickerClose();
        setTimeout(() => takePicture(), 300);
    };

    const handleSuccessModalClose = () => {
        hideModal(() => setShowSuccessModal(false));
    };

    const pickImageFromLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    const takePicture = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert('Lỗi', 'Cần cấp quyền camera để chụp ảnh!');
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chụp ảnh');
        }
    };

    // SỬA: Hàm upload avatar sử dụng logic của UserInfo (avatar cá nhân)
    const uploadAvatar = async (imageUri: string) => {
        try {
            setUploadingAvatar(true);
            const token = await tokenService.getToken();
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                return;
            }

            const platform = Platform.OS === 'web' ? 'web' : 'mobile';

            // Gọi API update avatar của User
            const response = await userInfoService.updateUserAvatar(imageUri, token, platform);

            if (response.success) {
                // SỬA: Cập nhật state vào profile.user thay vì profile.store
                if (profile) {
                    setProfile({
                        ...profile,
                        user: {
                            ...profile.user,
                            avatarUrl: response.data.avatarUrl
                        }
                    });
                }
                setShowSuccessModal(true);
                setTimeout(() => showModal(), 100);
            }
        } catch (error: any) {
            console.error('Upload avatar error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật ảnh đại diện');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = await tokenService.getToken();
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                return;
            }

            await sellerService.updateProfile(formData, token);

            // Reload profile to get updated data
            await loadProfile();
            setIsEditing(false);

            Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
        } catch (error: any) {
            console.error('Save profile error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (!profile) return;

        // Reset form data to original values
        setFormData({
            storeName: profile.store.storeName,
            description: profile.store.description || '',
            phoneNumber: profile.store.phoneNumber || '',
            address: profile.store.address || '',
            ownerName: profile.user.username || ''
        });
        setIsEditing(false);
    };

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            // Web
            if (!window.confirm('Bạn có chắc chắn muốn đăng xuất?')) return;
            await confirmLogout();
        } else {
            // Mobile
            setShowLogoutModal(true);
        }
    };

    const confirmLogout = async () => {
        if (Platform.OS !== 'web') setShowLogoutModal(false);

        try {
            await tokenService.clearAuthData();
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('jwt_token');
        } catch (e) {
            console.error('Error during logout:', e);
        }

        router.replace('/login');
    };

    const cancelLogout = () => {
        if (Platform.OS !== 'web') setShowLogoutModal(false);
    };

    // --- Sub Components: Modals ---
    const ImagePickerModal = () => (
        <Modal
            visible={showImagePickerModal}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
        >
            <View style={styles.modalOverlay}>
                <Animated.View
                    style={[
                        styles.imagePickerModal,
                        {
                            opacity: modalOpacity,
                            transform: [{ scale: modalScale }]
                        }
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Đổi ảnh đại diện</Text>
                        <Text style={styles.modalSubtitle}>Bạn muốn chọn ảnh từ đâu?</Text>
                    </View>

                    <View style={styles.modalButtonsRow}>
                        <TouchableOpacity style={styles.modalButton} onPress={handlePickFromLibrary}>
                            <MaterialIcons name="photo-library" size={24} color="#FFB400" />
                            <Text style={styles.modalButtonText}>Thư viện ảnh</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButton} onPress={handleTakePicture}>
                            <MaterialIcons name="camera-alt" size={24} color="#FFB400" />
                            <Text style={styles.modalButtonText}>Chụp ảnh</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.modalCancelButton} onPress={handleImagePickerClose}>
                        <Text style={styles.modalCancelText}>Hủy</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );

    const SuccessModal = () => (
        <Modal
            visible={showSuccessModal}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
        >
            <View style={styles.modalOverlay}>
                <Animated.View
                    style={[
                        styles.successModal,
                        {
                            opacity: modalOpacity,
                            transform: [{ scale: modalScale }]
                        }
                    ]}
                >
                    <MaterialIcons name="check-circle" size={50} color="#28a745" style={{ marginBottom: 10 }} />
                    <Text style={styles.successTitle}>Thành công</Text>
                    <Text style={styles.successMessage}>Ảnh đại diện đã được cập nhật!</Text>

                    <TouchableOpacity style={styles.successButton} onPress={handleSuccessModalClose}>
                        <Text style={styles.successButtonText}>OK</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <SellerTopNavigation />
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#FFB400" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Đang tải thông tin...</Text>
                </View>
                <SellerBottomNavigation />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.container}>
                <SellerTopNavigation />
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#666', fontSize: 16 }}>Không thể tải thông tin profile</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={loadProfile}
                    >
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
                <SellerBottomNavigation />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SellerTopNavigation />
            <ImagePickerModal />
            <SuccessModal />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        onPress={handleAvatarPress}
                        disabled={uploadingAvatar}
                    >
                        {/* SỬA: Hiển thị avatar của User thay vì Store */}
                        <Image
                            source={
                                profile.user.avatarUrl
                                    ? { uri: profile.user.avatarUrl }
                                    : require('@/assets/images/icon.png')
                            }
                            style={[
                                styles.avatarImage,
                                uploadingAvatar && { opacity: 0.5 }
                            ]}
                        />
                        {/* Upload loading indicator */}
                        {uploadingAvatar && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator size="large" color="#FFB400" />
                            </View>
                        )}

                        {/* Camera icon overlay */}
                        <View style={styles.cameraIconOverlay}>
                            <MaterialIcons name="camera-alt" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Rating Section */}
                <View style={styles.ratingSection}>
                    <Text style={styles.shopName}>{profile.store.storeName}</Text>
                    <View style={styles.starsContainer}>
                        {[...Array(5)].map((_, index) => (
                            <Text
                                key={index}
                                style={[
                                    styles.star,
                                    { color: index < Math.floor(Number(profile.store.rating)) ? '#FFB400' : '#E0E0E0' }
                                ]}
                            >
                                ★
                            </Text>
                        ))}
                        <Text style={styles.ratingText}> ({profile.store.rating}/5)</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/seller/rating')}>
                        <Text style={styles.reviewButton}>
                            Xem đánh giá shop ({profile.store.totalReviews} đánh giá)
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{profile.store.totalProducts}</Text>
                        <Text style={styles.statLabel}>Sản phẩm</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{profile.store.totalOrders}</Text>
                        <Text style={styles.statLabel}>Đơn hàng</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{profile.store.followersCount}</Text>
                        <Text style={styles.statLabel}>Theo dõi</Text>
                    </View>
                </View>

                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text style={styles.sectionTitle}>Thông Tin Cửa Hàng</Text>
                    <Text style={styles.sectionSubtitle}>
                        Hãy cung cấp thông tin cơ bản về cửa hàng của bạn
                    </Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    {/* Owner Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên quản trị viên *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.ownerName}
                            onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
                            editable={isEditing}
                            placeholder="Tên của bạn"
                        />
                    </View>

                    {/* Store Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên cửa hàng *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.storeName}
                            onChangeText={(text) => setFormData({ ...formData, storeName: text })}
                            editable={isEditing}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mô tả cửa hàng</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            editable={isEditing}
                            placeholder="Mô tả về cửa hàng của bạn..."
                        />
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Số điện thoại *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phoneNumber}
                            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                            keyboardType="phone-pad"
                            editable={isEditing}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={profile.store.email || profile.user.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={false}
                            placeholder="Email đã đăng ký không thể thay đổi"
                        />
                    </View>

                    {/* Address */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Địa chỉ *</Text>
                        <TextInput
                            style={[styles.input, styles.addressInput]}
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={isEditing}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        {!isEditing ? (
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => setIsEditing(true)}
                            >
                                <Text style={styles.editButtonText}>Cập nhật</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                    disabled={saving}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, saving && styles.disabledButton]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Lưu thông tin</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SellerBottomNavigation />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Màu nền sáng và hiện đại hơn
    },
    scrollView: {
        flex: 1,
        paddingBottom: 100,
    },

    // --- Avatar Section ---
    avatarSection: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 30,
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 24,
        zIndex: 1,
    },
    avatarWrapper: {
        position: 'relative',
        width: 130,
        height: 130,
        marginBottom: 10,
    },
    avatarImage: {
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 4,
        borderColor: '#FFF', // Viền trắng tạo khoảng cách với nền
        backgroundColor: '#F0F0F0',
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#FFB400',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    // --- Rating Section ---
    ratingSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    shopName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A202C',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#FFF9E6', // Nền vàng nhạt cho sao
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    star: {
        fontSize: 18,
        color: '#FFB400',
        marginHorizontal: 1,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#B7791F',
        marginLeft: 6,
    },
    reviewButton: {
        fontSize: 14,
        color: '#FFB400',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // --- Stats Section ---
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 24,
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2D3748',
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // --- Header Section ---
    headerSection: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 15,
        color: '#718096',
        lineHeight: 22,
    },

    // --- Form Section ---
    formSection: {
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#2D3748',
        minHeight: 52,
    },
    disabledInput: {
        backgroundColor: '#EDF2F7',
        borderColor: '#CBD5E0',
        color: '#A0AEC0',
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    addressInput: {
        minHeight: 90,
        textAlignVertical: 'top',
        paddingTop: 16,
    },

    // --- Buttons ---
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 30,
        gap: 16,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#FFB400',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#718096',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#FFB400',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    logoutButton: {
        backgroundColor: '#FFF5F5', // Nền đỏ rất nhạt
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#FEB2B2',
    },
    logoutButtonText: {
        color: '#E53E3E',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    retryButton: {
        backgroundColor: '#FFB400',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        marginTop: 16,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // --- Modals ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Tối hơn một chút để tập trung
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePickerModal: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        width: '85%',
        maxWidth: 360,
        alignItems: 'center',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3748',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 15,
        color: '#718096',
        textAlign: 'center',
    },
    modalButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        borderRadius: 16,
        backgroundColor: '#FFFBF0', // Vàng rất nhạt
        borderWidth: 1,
        borderColor: '#FEEBC8',
    },
    modalButtonText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '700',
        color: '#D69E2E',
    },
    modalCancelButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#A0AEC0',
        fontWeight: '600',
    },

    // Success Modal
    successModal: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 40,
        width: '80%',
        maxWidth: 320,
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2D3748',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    successButton: {
        backgroundColor: '#38A169',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 30,
    },
    successButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
function setShowLogoutModal(arg0: boolean) {
    throw new Error('Function not implemented.');
}

