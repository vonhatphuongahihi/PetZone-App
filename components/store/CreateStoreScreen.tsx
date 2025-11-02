import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeService } from '../../services/storeService';
import { tokenService } from '../../services/tokenService';

export default function CreateStoreScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        phoneNumber: '',
        email: '',
        address: ''
    });

    const handleCreate = async () => {
        // Validate
        if (!formData.storeName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên cửa hàng');
            return;
        }
        if (!formData.phoneNumber.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
            return;
        }
        if (!formData.email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }
        if (!formData.address.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
            return;
        }

        try {
            setLoading(true);
            const token = await tokenService.getToken();
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                router.replace('/login');
                return;
            }

            await storeService.createStore(formData, token);
            
            Alert.alert(
                'Thành công',
                'Tạo cửa hàng thành công!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/seller/dashboard')
                    }
                ]
            );
        } catch (error: any) {
            console.error('Create store error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tạo cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Hủy tạo cửa hàng',
            'Bạn có chắc chắn muốn hủy?',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Có',
                    onPress: async () => {
                        await tokenService.clearAuthData();
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Tạo Cửa Hàng</Text>
                    <Text style={styles.subtitle}>
                        Hãy cung cấp thông tin để tạo cửa hàng của bạn
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formSection}>
                    {/* Store Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên cửa hàng *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.storeName}
                            onChangeText={(text) => setFormData({...formData, storeName: text})}
                            placeholder="Nhập tên cửa hàng"
                            placeholderTextColor="#999"
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
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholder="Mô tả về cửa hàng của bạn..."
                            placeholderTextColor="#999"
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
                            placeholder="Nhập số điện thoại"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({...formData, email: text})}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="Nhập email"
                            placeholderTextColor="#999"
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
                            placeholder="Nhập địa chỉ cửa hàng"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.createButton, loading && styles.disabledButton]}
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.createButtonText}>Tạo cửa hàng</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
        backgroundColor: '#FFF',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    formSection: {
        paddingHorizontal: 20,
        paddingBottom: 30,
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
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    addressInput: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        flex: 1,
        backgroundColor: '#FFB400',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
});
