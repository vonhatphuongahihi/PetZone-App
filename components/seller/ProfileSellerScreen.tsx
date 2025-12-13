import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { KeyboardTypeOptions } from 'react-native';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SellerProfile, sellerService } from '../../services/sellerService';
import { tokenService } from '../../services/tokenService';
import { userInfoService } from '../../services/userInfoService';
import { SellerBottomNavigation } from './SellerBottomNavigation';
import { SellerTopNavigation } from './SellerTopNavigation';

const { width } = Dimensions.get('window');

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
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    // Animations
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.3)).current;
    const scrollY = useRef(new Animated.Value(0)).current; // For header parallax effect

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
                router.replace('/login');
                return;
            }

            const [sellerResponse, userResponse] = await Promise.all([
                sellerService.getProfile(token),
                userInfoService.getUserInfo(token)
            ]);

            if (!sellerResponse.profile) {
                throw new Error('Profile data not found in response');
            }

            const sellerProfileData = sellerResponse.profile;
            const mergedProfile = {
                ...sellerProfileData,
                user: {
                    ...sellerProfileData.user,
                    avatarUrl: userResponse.user.avatarUrl
                }
            };

            setProfile(mergedProfile);

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
                router.replace('/create-store');
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
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(modalScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hideModal = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(modalOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(modalScale, {
                toValue: 0.8,
                duration: 150,
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
            if (!permissionResult.granted) return;
            setShowImagePickerModal(true);
            setTimeout(() => showModal(), 50);
        } catch (error) {
            console.error('Avatar permission error:', error);
        }
    };

    const handleImagePickerClose = () => hideModal(() => setShowImagePickerModal(false));

    const handlePickFromLibrary = () => {
        handleImagePickerClose();
        setTimeout(() => pickImageFromLibrary(), 300);
    };

    const handleTakePicture = () => {
        handleImagePickerClose();
        setTimeout(() => takePicture(), 300);
    };

    const handleSuccessModalClose = () => hideModal(() => setShowSuccessModal(false));

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
            console.error('Pick image error:', error);
        }
    };

    const takePicture = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) return;
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Take picture error:', error);
        }
    };

    const uploadAvatar = async (imageUri: string) => {
        try {
            setUploadingAvatar(true);
            const token = await tokenService.getToken();
            if (!token) {
                router.replace('/login');
                return;
            }
            const platform = 'mobile';
            const response = await userInfoService.updateUserAvatar(imageUri, token, platform);

            if (response.success) {
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
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = await tokenService.getToken();
            if (!token) {
                router.replace('/login');
                return;
            }
            await sellerService.updateProfile(formData, token);
            await loadProfile();
            setIsEditing(false);
        } catch (error: any) {
            console.error('Save profile error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (!profile) return;
        setFormData({
            storeName: profile.store.storeName,
            description: profile.store.description || '',
            phoneNumber: profile.store.phoneNumber || '',
            address: profile.store.address || '',
            ownerName: profile.user.username || ''
        });
        setIsEditing(false);
    };

    const handleLogout = () => setShowLogoutModal(true);

    // --- Components ---
    interface InputFieldProps {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        icon: ComponentProps<typeof MaterialIcons>["name"];
        editable?: boolean;
        multiline?: boolean;
        keyboardType?: KeyboardTypeOptions;
        placeholder?: string;
    }
    const InputField = ({ 
        label, 
        value, 
        onChangeText, 
        icon, 
        editable = true, 
        multiline = false,
        keyboardType = 'default',
        placeholder = ''
    }: InputFieldProps) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[
                styles.inputWrapper, 
                !editable && styles.inputWrapperDisabled,
                multiline && { alignItems: 'flex-start', paddingVertical: 12 }
            ]}>
                <MaterialIcons 
                    name={icon} 
                    size={22} 
                    color={editable ? "#FFB400" : "#A0AEC0"} 
                    style={[styles.inputIcon, multiline && { marginTop: 4 }]} 
                />
                <TextInput
                    style={[styles.input, multiline && styles.inputMultiline]}
                    value={value}
                    onChangeText={onChangeText}
                    editable={editable}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    placeholderTextColor="#A0AEC0"
                />
            </View>
        </View>
    );

    const ImagePickerModal = () => (
        <Modal visible={showImagePickerModal} transparent animationType="none" statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.modalContent, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
                    <Text style={styles.modalTitle}>Cập nhật ảnh đại diện</Text>
                    <View style={styles.modalGrid}>
                        <TouchableOpacity style={styles.modalOption} onPress={handlePickFromLibrary}>
                            <View style={[styles.modalIconBox, { backgroundColor: '#E6FFFA' }]}>
                                <MaterialIcons name="photo-library" size={28} color="#38B2AC" />
                            </View>
                            <Text style={styles.modalOptionText}>Thư viện</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleTakePicture}>
                            <View style={[styles.modalIconBox, { backgroundColor: '#FFF5F5' }]}>
                                <MaterialIcons name="camera-alt" size={28} color="#E53E3E" />
                            </View>
                            <Text style={styles.modalOptionText}>Chụp ảnh</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.modalCloseBtn} onPress={handleImagePickerClose}>
                        <Text style={styles.modalCloseText}>Hủy bỏ</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );

    const SuccessModal = () => (
        <Modal visible={showSuccessModal} transparent animationType="none" statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.modalContent, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
                    <MaterialIcons name="check-circle" size={60} color="#38A169" />
                    <Text style={styles.successTitle}>Thành công!</Text>
                    <Text style={styles.successMessage}>Ảnh đại diện của bạn đã được cập nhật.</Text>
                    <TouchableOpacity style={styles.successBtn} onPress={handleSuccessModalClose}>
                        <Text style={styles.successBtnText}>Đóng</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );

    const LogoutConfirmModal = () => (
        <Modal visible={showLogoutModal} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setShowLogoutModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.logoutIconBg}>
                        <MaterialIcons name="logout" size={32} color="#E53E3E" />
                    </View>
                    <Text style={styles.modalTitle}>Đăng xuất</Text>
                    <Text style={styles.modalText}>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</Text>
                    <View style={styles.modalActionRow}>
                        <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowLogoutModal(false)}>
                            <Text style={styles.modalBtnCancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalBtnDanger} onPress={async () => {
                            setShowLogoutModal(false);
                            await tokenService.clearAuthData();
                            router.replace('/login');
                        }}>
                            <Text style={styles.modalBtnDangerText}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFB400" />
            </View>
        );
    }

    if (!profile) return null;

    return (
        <View style={styles.container}>
            <SellerTopNavigation />
            <ImagePickerModal />
            <SuccessModal />
            <LogoutConfirmModal />

            <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* Decorative Header Background */}
                <View style={styles.headerBackground}>
                    <View style={styles.headerCurve} />
                </View>

                {/* Profile Header Card */}
                <View style={styles.profileHeaderContainer}>
                        <TouchableOpacity onPress={handleAvatarPress} disabled={uploadingAvatar} activeOpacity={0.9}>
                            <View style={styles.avatarWrapper}>
                                <Image
                                    source={profile.user.avatarUrl ? { uri: profile.user.avatarUrl } : require('@/assets/images/icon.png')}
                                    style={styles.avatarImage}
                                />
                                {uploadingAvatar && (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator color="#FFF" />
                                    </View>
                                )}
                                <View style={styles.editAvatarBadge}>
                                    <MaterialIcons name="camera-alt" size={14} color="#FFF" />
                                </View>
                            </View>
                        </TouchableOpacity>

                    <Text style={styles.shopName}>{profile.store.storeName}</Text>
                    
                    <View style={styles.ratingRow}>
                        <View style={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <MaterialIcons 
                                    key={i} 
                                    name={i < Math.floor(Number(profile.store.rating)) ? "star" : "star-border"} 
                                    size={18} 
                                    color="#FFB400" 
                                />
                            ))}
                        </View>
                        <Text style={styles.ratingText}>{profile.store.rating}/5</Text>
                        <View style={styles.dotSeparator} />
                        <TouchableOpacity onPress={() => router.push('/seller/rating')}>
                            <Text style={styles.reviewLink}>Xem đánh giá ({profile.store.totalReviews})</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Card */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.store.totalProducts}</Text>
                            <Text style={styles.statLabel}>Sản phẩm</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.store.totalOrders}</Text>
                            <Text style={styles.statLabel}>Đơn hàng</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.store.followersCount}</Text>
                            <Text style={styles.statLabel}>Theo dõi</Text>
                        </View>
                    </View>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Thông tin cửa hàng</Text>
                        <TouchableOpacity onPress={() => !isEditing && setIsEditing(true)}>
                            {!isEditing && <Text style={styles.editText}>Chỉnh sửa</Text>}
                        </TouchableOpacity>
                    </View>

                    <InputField
                        label="Tên quản trị viên"
                        value={formData.ownerName}
                        onChangeText={(t: string) => setFormData({...formData, ownerName: t})}
                        icon="person"
                        editable={isEditing}
                    />

                    <InputField
                        label="Tên cửa hàng"
                        value={formData.storeName}
                        onChangeText={(t: string) => setFormData({...formData, storeName: t})}
                        icon="store"
                        editable={isEditing}
                    />

                    <InputField
                        label="Số điện thoại"
                        value={formData.phoneNumber}
                        onChangeText={(t: string) => setFormData({...formData, phoneNumber: t})}
                        icon="phone"
                        keyboardType="phone-pad"
                        editable={isEditing}
                    />

                    <InputField
                        label="Email đăng ký"
                        value={profile.store.email || profile.user.email}
                        icon="email"
                        editable={false}
                        onChangeText={() => {}}
                    />

                    <InputField
                        label="Địa chỉ"
                        value={formData.address}
                        onChangeText={(t: string) => setFormData({...formData, address: t})}
                        icon="location-on"
                        editable={isEditing}
                        multiline
                    />

                    <InputField
                        label="Giới thiệu cửa hàng"
                        value={formData.description}
                        onChangeText={(t: string) => setFormData({...formData, description: t})}
                        icon="description"
                        editable={isEditing}
                        multiline
                        placeholder="Hãy viết đôi lời giới thiệu về shop của bạn..."
                    />

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        {isEditing ? (
                            <>
                                <TouchableOpacity style={styles.btnCancel} onPress={handleCancel} disabled={saving}>
                                    <Text style={styles.btnCancelText}>Hủy bỏ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
                                    {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSaveText}>Lưu thay đổi</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
                                <MaterialIcons name="logout" size={20} color="#E53E3E" style={{marginRight: 8}} />
                                <Text style={styles.btnLogoutText}>Đăng xuất</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={{height: 40}} />
            </ScrollView>
            <SellerBottomNavigation />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
    },
    scrollView: {
        flex: 1,
    },
    
    // Header Styling
    headerBackground: {
        height: 160,
        backgroundColor: '#FFB400',
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 0,
    },
    headerCurve: {
        position: 'absolute',
        bottom: -25,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: '#F7FAFC',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
    },
    profileHeaderContainer: {
        alignItems: 'center',
        paddingTop: 80, // Space for header
        paddingHorizontal: 20,
        marginBottom: 20,
        zIndex: 1,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: '#FFF',
        backgroundColor: '#FFF',
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#2D3748',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 6,
    },
    ratingText: {
        fontWeight: 'bold',
        color: '#2D3748',
        fontSize: 14,
    },
    dotSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E0',
        marginHorizontal: 8,
    },
    reviewLink: {
        color: '#718096',
        fontSize: 14,
        textDecorationLine: 'underline',
    },

    // Stats Card
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 10,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: '70%',
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D3748',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#718096',
        fontWeight: '500',
    },

    // Form Section
    formSection: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3748',
    },
    editText: {
        color: '#FFB400',
        fontWeight: '600',
        fontSize: 15,
    },

    // Inputs
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 8,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        minHeight: 50,
    },
    inputWrapperDisabled: {
        backgroundColor: '#EDF2F7',
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
        paddingVertical: 8,
    },
    inputMultiline: {
        height: 80,
        textAlignVertical: 'top',
    },

    // Buttons
    actionButtons: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    btnCancel: {
        flex: 1,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#CBD5E0',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#718096',
    },
    btnSave: {
        flex: 1,
        backgroundColor: '#FFB400',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: "#FFB400",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    btnSaveText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    btnLogout: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FED7D7',
        marginTop: 10,
    },
    btnLogoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E53E3E',
    },

    // Modal Common Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 12,
        marginTop: 10,
    },
    modalText: {
        fontSize: 15,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    
    // Image Picker Modal Specific
    modalGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginVertical: 20,
    },
    modalOption: {
        alignItems: 'center',
    },
    modalIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
    },
    modalCloseBtn: {
        marginTop: 10,
        padding: 10,
    },
    modalCloseText: {
        color: '#718096',
        fontSize: 16,
        fontWeight: '500',
    },

    // Success Modal Specific
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D3748',
        marginVertical: 10,
    },
    successMessage: {
        fontSize: 15,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 20,
    },
    successBtn: {
        backgroundColor: '#38A169',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 30,
    },
    successBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Logout Modal Specific
    logoutIconBg: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalActionRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtnCancel: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#EDF2F7',
        alignItems: 'center',
    },
    modalBtnCancelText: {
        fontWeight: '600',
        color: '#4A5568',
    },
    modalBtnDanger: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#E53E3E',
        alignItems: 'center',
    },
    modalBtnDangerText: {
        fontWeight: '600',
        color: '#FFF',
    },
});