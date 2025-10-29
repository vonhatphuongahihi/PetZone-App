import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    
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
                {/* Header */}
                <View style={userInfoStyles.header}>
                    <TouchableOpacity 
                        style={userInfoStyles.backButton}
                        onPress={() => router.back()}
                    >
                        <MaterialIcons name="arrow-back-ios" size={20} color="#FFB400" />
                    </TouchableOpacity>
                    <Text style={userInfoStyles.headerTitle}>Thông tin tài khoản</Text>
                </View>

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
                {/* Header */}
                <View style={userInfoStyles.header}>
                    <TouchableOpacity 
                        style={userInfoStyles.backButton}
                        onPress={() => router.back()}
                    >
                        <MaterialIcons name="arrow-back-ios" size={20} color="#FFB400" />
                    </TouchableOpacity>
                    <Text style={userInfoStyles.headerTitle}>Thông tin tài khoản</Text>
                </View>

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

    return (
        <SafeAreaView style={userInfoStyles.container}>
            {/* Header */}
            <View style={userInfoStyles.header}>
                <TouchableOpacity 
                    style={userInfoStyles.backButton}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-back-ios" size={20} color="#FFB400" />
                </TouchableOpacity>
                <Text style={userInfoStyles.headerTitle}>Thông tin tài khoản</Text>
            </View>

            <ScrollView style={userInfoStyles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={userInfoStyles.avatarSection}>
                    <View style={userInfoStyles.avatarWrapper}>
                        <Image 
                            source={require('../../../assets/images/icon.png')}
                            style={userInfoStyles.avatar}
                        />
                        <TouchableOpacity 
                            style={userInfoStyles.editAvatarButton}
                            onPress={() => {
                                // TODO: Implement image picker
                                Alert.alert('Thông báo', 'Tính năng đổi ảnh đại diện sẽ có trong phiên bản sau');
                            }}
                        >
                            <MaterialIcons name="camera-alt" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={userInfoStyles.usernameText}>{userInfo.username}</Text>
                    <Text style={userInfoStyles.roleText}>{getRoleDisplayName(userInfo.role)}</Text>
                    <Text style={userInfoStyles.memberSinceText}>
                        Thành viên từ {formatDate(userInfo.createdAt)}
                    </Text>
                </View>

                {/* User Info Form */}
                <View style={userInfoStyles.formSection}>
                    <Text style={userInfoStyles.sectionTitle}>Thông tin cá nhân</Text>
                    <Text style={userInfoStyles.sectionSubtitle}>
                        Quản lý thông tin cá nhân của bạn
                    </Text>

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