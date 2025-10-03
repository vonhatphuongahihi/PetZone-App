import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeService } from '../../services/storeService';
import { tokenService } from '../../services/tokenService';
import { createStoreStyles } from './createStoreStyles';

interface CreateStoreFormData {
    storeName: string;
    description: string;
    phoneNumber: string;
    email: string;
    address: string;
}

export default function CreateStoreScreen() {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateStoreFormData>({
        defaultValues: {
            storeName: '',
            description: '',
            phoneNumber: '',
            email: '',
            address: '',
        },
    });

    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const getToken = async () => {
            try {
                const storedToken = await tokenService.getToken();
                if (!storedToken) {
                    router.replace('/login');
                    return;
                }
                setToken(storedToken);
            } catch (error) {
                console.error('Error getting token:', error);
                router.replace('/login');
            }
        };

        getToken();
    }, []);

    const onSubmit = async (data: CreateStoreFormData) => {
        if (!token) {
            Alert.alert('Lỗi', 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            router.replace('/login');
            return;
        }

        setIsLoading(true);
        try {
            const response = await storeService.createStore({
                storeName: data.storeName,
                description: data.description,
                phoneNumber: data.phoneNumber,
                email: data.email,
                address: data.address,
            }, token);

            Alert.alert('Thành công', 'Cửa hàng đã được tạo thành công!', [
                {
                    text: 'OK',
                    onPress: () => {
                        setTimeout(() => {
                            router.replace('/seller/dashboard');
                        }, 3000);
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể tạo cửa hàng. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={createStoreStyles.container}>
            <ScrollView
                style={createStoreStyles.scrollView}
                contentContainerStyle={createStoreStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={createStoreStyles.headerSection}>
                    <Image
                        source={require('@/assets/images/dog-feet.png')}
                        style={createStoreStyles.storeIcon}
                        contentFit="contain"
                    />
                    <Text style={createStoreStyles.title}>
                        <Text style={createStoreStyles.titleFirst}>Tạo Cửa </Text>
                        <Text style={createStoreStyles.titleSecond}>Hàng Mới</Text>
                    </Text>
                    <Text style={createStoreStyles.subtitle}>Điền thông tin để bắt đầu bán hàng</Text>
                </View>

                <View style={createStoreStyles.formCard}>
                    <Text style={createStoreStyles.sectionTitle}>Thông Tin Cửa Hàng</Text>
                    <Text style={createStoreStyles.sectionDescription}>
                        Hãy cung cấp thông tin cơ bản về cửa hàng của bạn
                    </Text>

                    <View style={createStoreStyles.inputContainer}>
                        <Text style={createStoreStyles.inputLabel}>Tên cửa hàng *</Text>
                        <Controller
                            control={control}
                            name="storeName"
                            rules={{
                                required: "Tên cửa hàng là bắt buộc",
                                minLength: {
                                    value: 2,
                                    message: "Tên cửa hàng phải có ít nhất 2 ký tự",
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        createStoreStyles.inputField,
                                        errors.storeName && createStoreStyles.inputFieldError
                                    ]}
                                    placeholder="VD: Shop Thời Trang ABC"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                        {errors.storeName && (
                            <Text style={createStoreStyles.errorText}>{errors.storeName.message}</Text>
                        )}
                    </View>

                    <View style={createStoreStyles.inputContainer}>
                        <Text style={createStoreStyles.inputLabel}>Mô tả cửa hàng</Text>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        createStoreStyles.textAreaField,
                                        errors.description && createStoreStyles.inputFieldError
                                    ]}
                                    placeholder="Mô tả ngắn gọn về cửa hàng của bạn..."
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            )}
                        />
                    </View>

                    <View style={createStoreStyles.inputContainer}>
                        <Text style={createStoreStyles.inputLabel}>Số điện thoại *</Text>
                        <Controller
                            control={control}
                            name="phoneNumber"
                            rules={{
                                required: "Số điện thoại là bắt buộc",
                                pattern: {
                                    value: /^[0-9]{10,11}$/,
                                    message: "Số điện thoại không hợp lệ",
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        createStoreStyles.inputField,
                                        errors.phoneNumber && createStoreStyles.inputFieldError
                                    ]}
                                    placeholder="0123456789"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="phone-pad"
                                />
                            )}
                        />
                        {errors.phoneNumber && (
                            <Text style={createStoreStyles.errorText}>{errors.phoneNumber.message}</Text>
                        )}
                    </View>

                    <View style={createStoreStyles.inputContainer}>
                        <Text style={createStoreStyles.inputLabel}>Email *</Text>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: "Email là bắt buộc",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Email không hợp lệ",
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        createStoreStyles.inputField,
                                        errors.email && createStoreStyles.inputFieldError
                                    ]}
                                    placeholder="shop@example.com"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            )}
                        />
                        {errors.email && (
                            <Text style={createStoreStyles.errorText}>{errors.email.message}</Text>
                        )}
                    </View>

                    <View style={createStoreStyles.inputContainer}>
                        <Text style={createStoreStyles.inputLabel}>Địa chỉ *</Text>
                        <Controller
                            control={control}
                            name="address"
                            rules={{
                                required: "Địa chỉ là bắt buộc",
                                minLength: {
                                    value: 10,
                                    message: "Địa chỉ phải có ít nhất 10 ký tự",
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        createStoreStyles.textAreaField,
                                        errors.address && createStoreStyles.inputFieldError
                                    ]}
                                    placeholder="Số nhà, đường, phường, quận, thành phố"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                        {errors.address && (
                            <Text style={createStoreStyles.errorText}>{errors.address.message}</Text>
                        )}
                    </View>


                    <TouchableOpacity
                        style={[
                            createStoreStyles.submitButton,
                            isLoading && createStoreStyles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}
                    >
                        <Text style={createStoreStyles.submitButtonText}>
                            {isLoading ? 'Đang tạo...' : 'Tạo Cửa Hàng'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
