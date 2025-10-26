import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SellerProfile, sellerService } from '../../services/sellerService';
import { tokenService } from '../../services/tokenService';
import { SellerBottomNavigation } from './SellerBottomNavigation';
import { SellerTopNavigation } from './SellerTopNavigation';

export default function ProfileSellerScreen() {
    const router = useRouter();
    
    const [profile, setProfile] = useState<SellerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
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

            console.log('Fetching profile with token:', token);
            const response = await sellerService.getProfile(token);
            console.log('Profile response:', JSON.stringify(response, null, 2));
            
            if (!response.profile) {
                throw new Error('Profile data not found in response');
            }
            
            setProfile(response.profile);
            
            // Set form data
            setFormData({
                storeName: response.profile.store.storeName,
                description: response.profile.store.description || '',
                phoneNumber: response.profile.store.phoneNumber || '',
                address: response.profile.store.address || '',
                ownerName: response.profile.user.username || ''
            });

        } catch (error: any) {
            console.error('Load profile error:', error);
            console.error('Error message:', error.message);
            
            // Handle specific error cases
            if (error.message?.includes('404') || error.message?.includes('Store not found')) {
                // User doesn't have a store yet
                Alert.alert(
                    'Chưa có cửa hàng',
                    'Bạn chưa tạo cửa hàng. Vui lòng tạo cửa hàng trước.',
                    [
                        {
                            text: 'Tạo cửa hàng',
                            onPress: () => router.replace('/create-store')
                        }
                    ]
                );
            } else if (error.message?.includes('401') || error.message?.includes('Token')) {
                // Token invalid or expired
                Alert.alert(
                    'Phiên đăng nhập hết hạn',
                    'Vui lòng đăng nhập lại',
                    [
                        {
                            text: 'Đăng nhập',
                            onPress: async () => {
                                await tokenService.clearAuthData();
                                router.replace('/login');
                            }
                        }
                    ]
                );
            } else if (error.message?.includes('kết nối') || error.message?.includes('network')) {
                // Network error
                Alert.alert(
                    'Lỗi kết nối',
                    'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                    [
                        { text: 'Thử lại', onPress: loadProfile }
                    ]
                );
            } else {
                // General error
                Alert.alert(
                    'Lỗi',
                    error.message || 'Không thể tải thông tin profile',
                    [
                        { text: 'Thử lại', onPress: loadProfile }
                    ]
                );
            }
        } finally {
            setLoading(false);
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
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        await tokenService.clearAuthData();
                        router.replace('/login');
                    }
                }
            ]
        );
    };





    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <SellerTopNavigation />
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#FFB400" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Đang tải thông tin...</Text>
                </View>
                <SellerBottomNavigation />
            </SafeAreaView>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={styles.container}>
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
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SellerTopNavigation />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={
                                profile.store.avatarUrl 
                                    ? { uri: profile.store.avatarUrl }
                                    : require('@/assets/images/icon.png')
                            }
                            style={styles.avatarImage}
                        />
                    </View>
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
                            onChangeText={(text) => setFormData({...formData, ownerName: text})}
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
                            onChangeText={(text) => setFormData({...formData, storeName: text})}
                            editable={isEditing}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mô tả cửa hàng</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({...formData, description: text})}
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
                            onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
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
                            onChangeText={(text) => setFormData({...formData, address: text})}
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

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#FFF',
        marginBottom: 20,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#FFB400',
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
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
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
        fontSize: 18,
    },

    // Rating Section
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
    
    // Additional styles
    retryButton: {
        backgroundColor: '#FFB400',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 12,
        paddingVertical: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#7F8C8D',
        textAlign: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
});
