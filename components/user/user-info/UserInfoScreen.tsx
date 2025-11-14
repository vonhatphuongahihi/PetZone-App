import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokenService } from '../../../services/tokenService';
import { UserInfo, userInfoService } from '../../../services/userInfoService';
import { userInfoStyles } from './userInfoStyles';

export default function UserInfoScreen() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    
    // Custom modal states
    const [showImagePickerModal, setShowImagePickerModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalOpacity] = useState(new Animated.Value(0));
    const [modalScale] = useState(new Animated.Value(0.3));
    
    // Form data
    const [formData, setFormData] = useState({
        username: '',
    });

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            setLoading(true);
            const token = await tokenService.getToken();
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                router.replace('/login');
                return;
            }

            const response = await userInfoService.getUserInfo(token);
            setUserInfo(response.user);
            setFormData({
                username: response.user.username,
            });
        } catch (error: any) {
            console.error('Load user info error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tải thông tin user');
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

            // Kiểm tra xem có thay đổi gì không
            if (!userInfo || formData.username === userInfo.username) {
                setIsEditing(false);
                return;
            }

            await userInfoService.updateUserInfo(formData, token);
            await loadUserInfo(); // Reload để lấy data mới
            setIsEditing(false);
            Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
        } catch (error: any) {
            console.error('Save user info error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (!userInfo) return;
        
        // Reset form data
        setFormData({
            username: userInfo.username,
        });
        setIsEditing(false);
    };

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

    const handleAvatarPress = async () => {
        try {
            // Request permissions
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện!');
                return;
            }

            // Show custom modal to choose camera or gallery
            setShowImagePickerModal(true);
            setTimeout(() => showModal(), 100); // Delay to ensure modal is rendered
        } catch (error) {
            console.error('Avatar permission error:', error);
            Alert.alert('Lỗi', 'Không thể truy cập thư viện ảnh');
        }
    };

    const pickImageFromLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Pick image error:', error);
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
            console.error('Take picture error:', error);
            Alert.alert('Lỗi', 'Không thể chụp ảnh');
        }
    };

    const uploadAvatar = async (imageUri: string) => {
        try {
            setUploadingAvatar(true);
            const token = await tokenService.getToken();
            
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                return;
            }

            const platform = Platform.OS === 'web' ? 'web' : 'mobile';
            const response = await userInfoService.updateUserAvatar(imageUri, token, platform);
            
            if (response.success) {
                // Update local state
                setUserInfo(prev => prev ? { ...prev, avatarUrl: response.data.avatarUrl } : null);
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'USER': return 'Người dùng';
            case 'SELLER': return 'Người bán';
            case 'ADMIN': return 'Quản trị viên';
            default: return role;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={userInfoStyles.container}>
                <View style={userInfoStyles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFB400" />
                    <Text style={userInfoStyles.loadingText}>Đang tải thông tin...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!userInfo) {
        return (
            <SafeAreaView style={userInfoStyles.container}>
                <View style={userInfoStyles.errorContainer}>
                    <Text style={userInfoStyles.errorText}>
                        Không thể tải thông tin tài khoản
                    </Text>
                    <TouchableOpacity 
                        style={userInfoStyles.retryButton}
                        onPress={loadUserInfo}
                    >
                        <Text style={userInfoStyles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Custom Image Picker Modal
    const ImagePickerModal = () => (
        <Modal
            visible={showImagePickerModal}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
        >
            <View style={userInfoStyles.modalOverlay}>
                <Animated.View 
                    style={[
                        userInfoStyles.imagePickerModal,
                        {
                            opacity: modalOpacity,
                            transform: [{ scale: modalScale }]
                        }
                    ]}
                >
                    <View style={userInfoStyles.modalHeader}>
                        <Text style={userInfoStyles.modalTitle}>Chọn ảnh đại diện</Text>
                        <Text style={userInfoStyles.modalSubtitle}>Bạn muốn chọn ảnh từ đâu?</Text>
                    </View>
                    
                    <View style={userInfoStyles.modalButtons}>
                        <TouchableOpacity 
                            style={userInfoStyles.modalButton}
                            onPress={handlePickFromLibrary}
                        >
                            <MaterialIcons name="photo-library" size={24} color="#FFB400" />
                            <Text style={userInfoStyles.modalButtonText}>Thư viện ảnh</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={userInfoStyles.modalButton}
                            onPress={handleTakePicture}
                        >
                            <MaterialIcons name="camera-alt" size={24} color="#FFB400" />
                            <Text style={userInfoStyles.modalButtonText}>Chụp ảnh</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                        style={userInfoStyles.modalCancelButton}
                        onPress={handleImagePickerClose}
                    >
                        <Text style={userInfoStyles.modalCancelText}>Hủy</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );

    // Custom Success Modal
    const SuccessModal = () => (
        <Modal
            visible={showSuccessModal}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
        >
            <View style={userInfoStyles.modalOverlay}>
                <Animated.View 
                    style={[
                        userInfoStyles.successModal,
                        {
                            opacity: modalOpacity,
                            transform: [{ scale: modalScale }]
                        }
                    ]}
                >
                    <Text style={userInfoStyles.successTitle}>Thành công</Text>
                    <Text style={userInfoStyles.successMessage}>
                        Ảnh đại diện đã được cập nhật thành công
                    </Text>
                    
                    <TouchableOpacity 
                        style={userInfoStyles.successButton}
                        onPress={handleSuccessModalClose}
                    >
                        <Text style={userInfoStyles.successButtonText}>OK</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={userInfoStyles.container}>
            <ImagePickerModal />
            <SuccessModal />
            <ScrollView style={userInfoStyles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={userInfoStyles.avatarSection}>
                    <TouchableOpacity 
                        style={userInfoStyles.avatarWrapper}
                        onPress={handleAvatarPress}
                        disabled={uploadingAvatar}
                    >
                        <Image 
                            source={
                                userInfo.avatarUrl 
                                    ? { uri: userInfo.avatarUrl }
                                    : require('../../../assets/images/icon.png')
                            }
                            style={[
                                userInfoStyles.avatar,
                                uploadingAvatar && { opacity: 0.5 }
                            ]}
                        />
                        
                        {/* Upload loading indicator */}
                        {uploadingAvatar && (
                            <View style={userInfoStyles.uploadingOverlay}>
                                <ActivityIndicator size="large" color="#FFB400" />
                            </View>
                        )}
                        
                        {/* Camera icon overlay */}
                        <View style={userInfoStyles.cameraIconOverlay}>
                            <MaterialIcons name="camera-alt" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    
                    <Text style={userInfoStyles.usernameText}>{userInfo.username}</Text>
                    <Text style={userInfoStyles.roleText}>{getRoleDisplayName(userInfo.role)}</Text>
                    <Text style={userInfoStyles.memberSinceText}>
                        Thành viên từ {formatDate(userInfo.createdAt)}
                    </Text>
                </View>

                {/* User Info Form */}
                <View style={userInfoStyles.formSection}>
                    {/* Username */}
                    <View style={userInfoStyles.inputGroup}>
                        <Text style={userInfoStyles.label}>Tên người dùng</Text>
                        <TextInput
                            style={[
                                userInfoStyles.input,
                                focusedInput === 'username' && userInfoStyles.inputFocused,
                                !isEditing && userInfoStyles.disabledInput
                            ]}
                            value={formData.username}
                            onChangeText={(text) => setFormData({...formData, username: text})}
                            onFocus={() => setFocusedInput('username')}
                            onBlur={() => setFocusedInput(null)}
                            editable={isEditing}
                            placeholder="Nhập tên người dùng"
                        />
                    </View>

                    {/* Email */}
                    <View style={userInfoStyles.inputGroup}>
                        <Text style={userInfoStyles.label}>Email</Text>
                        <TextInput
                            style={[userInfoStyles.input, userInfoStyles.disabledInput]}
                            value={userInfo.email}
                            editable={false}
                            placeholder="Email không thể thay đổi"
                        />
                    </View>

                    {/* Role */}
                    <View style={userInfoStyles.inputGroup}>
                        <Text style={userInfoStyles.label}>Vai trò</Text>
                        <TextInput
                            style={[userInfoStyles.input, userInfoStyles.disabledInput]}
                            value={getRoleDisplayName(userInfo.role)}
                            editable={false}
                        />
                    </View>

                    {/* Account Status */}
                    <View style={userInfoStyles.inputGroup}>
                        <Text style={userInfoStyles.label}>Trạng thái tài khoản</Text>
                        <View style={[
                            userInfoStyles.statusBadge,
                            !userInfo.isActive && userInfoStyles.statusBadgeInactive
                        ]}>
                            <MaterialIcons 
                                name={userInfo.isActive ? "check-circle" : "cancel"} 
                                size={16} 
                                color={userInfo.isActive ? "#155724" : "#721C24"} 
                            />
                            <Text style={[
                                userInfoStyles.statusText,
                                !userInfo.isActive && userInfoStyles.statusTextInactive
                            ]}>
                                {userInfo.isActive ? "Hoạt động" : "Tạm khóa"}
                            </Text>
                        </View>
                    </View>

                    {/* Created Date */}
                    <View style={userInfoStyles.inputGroup}>
                        <Text style={userInfoStyles.label}>Ngày tạo tài khoản</Text>
                        <TextInput
                            style={[userInfoStyles.input, userInfoStyles.disabledInput]}
                            value={formatDate(userInfo.createdAt)}
                            editable={false}
                        />
                    </View>

                    {/* Last Updated */}
                    <View style={userInfoStyles.inputGroup}>
                        <Text style={userInfoStyles.label}>Lần cập nhật cuối</Text>
                        <TextInput
                            style={[userInfoStyles.input, userInfoStyles.disabledInput]}
                            value={formatDate(userInfo.updatedAt)}
                            editable={false}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={userInfoStyles.buttonContainer}>
                        {!isEditing ? (
                            <TouchableOpacity
                                style={userInfoStyles.editButton}
                                onPress={() => setIsEditing(true)}
                            >
                                <Text style={userInfoStyles.editButtonText}>Chỉnh sửa</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={userInfoStyles.cancelButton}
                                    onPress={handleCancel}
                                    disabled={saving}
                                >
                                    <Text style={userInfoStyles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        userInfoStyles.saveButton,
                                        saving && userInfoStyles.disabledButton
                                    ]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text style={userInfoStyles.saveButtonText}>Lưu</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

