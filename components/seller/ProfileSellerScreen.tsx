import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SellerBottomNavigation } from './SellerBottomNavigation';
import { SellerTopNavigation } from './SellerTopNavigation';

export default function ProfileSellerScreen() {
    const router = useRouter();

    const [storeInfo, setStoreInfo] = useState({
        storeName: 'PET SHOP',
        description: 'Cửa hàng chuyên cung cấp đồ dùng cho chó mèo như là đồ ăn thức uống, cát vệ sinh, đồ chơi cho thú cưng, áo quần đồ thời trang cho chó mèo, dây chuyền cổ... Phuong Shop cam kết mang lại chất lượng tốt.',
        phoneNumber: '0123456789',
        email: 'shop@example.com',
        address: 'Khu phố 6, phường Linh Trung, thành phố Thủ Đức, TP. HCM'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [coverUri, setCoverUri] = useState<string | null>(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleImageUpload = () => {
        // Placeholder for image picker functionality
        // In a real app, you would use expo-image-picker or react-native-image-picker
        console.log('Upload avatar image');
    };

    const handleCoverUpload = () => {
        // Placeholder for cover photo picker functionality
        console.log('Upload cover photo');
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        setShowLogoutModal(false);
        try {
            // Xóa token khỏi AsyncStorage
            const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('jwt_token');

            // Disconnect Socket.IO
            const { disconnectSocket } = await import('../../services/socket');
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

    return (
        <SafeAreaView style={styles.container}>
            <SellerTopNavigation />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Cover Photo Section */}
                <View style={styles.coverContainer}>
                    <Image
                        source={
                            coverUri
                                ? { uri: coverUri }
                                : require('@/assets/images/banner.png')
                        }
                        style={styles.coverPhoto}
                    />
                    <TouchableOpacity
                        style={styles.coverEditButton}
                        onPress={handleCoverUpload}
                    >
                        <Text style={styles.coverEditIcon}>📷</Text>
                        <Text style={styles.coverEditText}>Đổi ảnh bìa</Text>
                    </TouchableOpacity>

                    {/* Avatar overlapping cover photo */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={
                                    avatarUri
                                        ? { uri: avatarUri }
                                        : require('@/assets/images/icon.png')
                                }
                                style={styles.avatarImage}
                            />
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={handleImageUpload}
                            >
                                <Text style={styles.cameraIcon}>📷</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Rating Section */}
                <View style={styles.ratingSection}>
                    <Text style={styles.shopName}>{storeInfo.storeName}</Text>
                    <View style={styles.starsContainer}>
                        <Text style={styles.star}>★</Text>
                        <Text style={styles.star}>★</Text>
                        <Text style={styles.star}>★</Text>
                        <Text style={styles.star}>★</Text>
                        <Text style={styles.star}>★</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/seller/rating')}>
                        <Text style={styles.reviewButton}>Xem đánh giá shop</Text>
                    </TouchableOpacity>
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


                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mô tả cửa hàng</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={storeInfo.description}
                            onChangeText={(text) => setStoreInfo({ ...storeInfo, description: text })}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            editable={isEditing}
                        />
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Số điện thoại *</Text>
                        <TextInput
                            style={styles.input}
                            value={storeInfo.phoneNumber}
                            onChangeText={(text) => setStoreInfo({ ...storeInfo, phoneNumber: text })}
                            keyboardType="phone-pad"
                            editable={isEditing}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={storeInfo.email}
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
                            value={storeInfo.address}
                            onChangeText={(text) => setStoreInfo({ ...storeInfo, address: text })}
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
                                    onPress={() => setIsEditing(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={() => setIsEditing(false)}
                                >
                                    <Text style={styles.saveButtonText}>Lưu thông tin</Text>
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
                            source={require("../../assets/images/icon.png")}
                            style={styles.modalCatImage}
                        />

                        {/* Modal Text */}
                        <Text style={styles.modalTitle}>Đăng xuất khỏi PetZone?</Text>

                        {/* Modal Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancelButton} onPress={cancelLogout}>
                                <Text style={styles.modalCancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmLogout}>
                                <Text style={styles.modalConfirmButtonText}>Đăng xuất</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollView: {
        flex: 1,
        paddingBottom: 80,
    },

    // Header Section
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },

    // Cover Photo Section
    coverContainer: {
        position: 'relative',
        marginBottom: 60, // Space for overlapping avatar
    },
    coverPhoto: {
        width: '100%',
        height: 120,
        backgroundColor: '#E0E0E0',
        resizeMode: 'cover',
    },
    coverEditButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    coverEditIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    coverEditText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '500',
    },

    // Avatar Section (overlapping cover photo)
    avatarContainer: {
        position: 'absolute',
        bottom: -50, // Half of avatar height to overlap
        left: '50%',
        transform: [{ translateX: -50 }], // Center horizontally
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFF',
        backgroundColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFB400',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    cameraIcon: {
        fontSize: 16,
    },

    // Rating Section
    ratingSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    star: {
        fontSize: 20,
        color: '#FFB400',
        marginHorizontal: 2,
    },
    reviewButton: {
        fontSize: 12,
        color: '#FFB400',
        fontWeight: '500',
    },

    // Form Section
    formSection: {
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        minHeight: 48,
    },
    disabledInput: {
        backgroundColor: '#F5F5F5',
        borderColor: '#D0D0D0',
        color: '#999',
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    addressInput: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: 12,
    },

    // Buttons
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20,
        gap: 12,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#FFB400',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#FFB400',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#FFE4E1',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: {
        color: '#E74C3C',
        fontSize: 16,
        fontWeight: '600',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        width: '80%',
        maxWidth: 300,
    },
    modalCatImage: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    modalCancelButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    modalCancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    modalConfirmButton: {
        backgroundColor: '#FBBC05',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    modalConfirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    shopName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
});
