import { loginStyles } from '@/components/login/loginStyles';
import { authService } from '@/services/authService';
import { Image } from 'expo-image';
// 1. Thêm Stack vào import
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ForgotPasswordFormData {
    email: string;
}

export default function ForgotPasswordScreen() {
    // ... (phần logic giữ nguyên) ...
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        defaultValues: {
            email: '',
        },
    });

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await authService.sendOtp(data.email);
            router.push({
                pathname: '/otp-verify',
                params: { email: data.email, type: 'forget-password' }
            });
        } catch (error) {
            Alert.alert('Lỗi', error instanceof Error ? error.message : 'Gửi OTP thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.push('/login');
    };

    return (
        <SafeAreaView style={loginStyles.container}>
            {/* 2. Thêm dòng này để ẩn header */}
            <Stack.Screen options={{ headerShown: false }} />

            <View style={loginStyles.topSection}>
                {/* ... (phần giao diện giữ nguyên) ... */}
                <Image
                    source={require('@/assets/images/bubble-left.png')}
                    style={loginStyles.bubbleLeft}
                    contentFit="contain"
                />
                <Image
                    source={require('@/assets/images/bubble-right.png')}
                    style={loginStyles.bubbleRight}
                    contentFit="contain"
                />
                <Image
                    source={require('@/assets/images/dog-feet.png')}
                    style={loginStyles.dogFeet}
                    contentFit="contain"
                />
            </View>

            <View style={loginStyles.middleSection}>
                <Text style={loginStyles.title}>
                    <Text style={loginStyles.titleFirst}>Quên </Text>
                    <Text style={loginStyles.titleSecond}>mật khẩu</Text>
                </Text>

                <Text style={[loginStyles.inputLabel, { textAlign: 'center', marginBottom: 20 }]}>
                    Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
                </Text>

                <View style={loginStyles.inputContainer}>
                    <Text style={loginStyles.inputLabel}>Email</Text>
                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: "Bạn cần nhập email của mình",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Email không hợp lệ",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={[
                                loginStyles.inputField,
                                errors.email && loginStyles.inputFieldError
                            ]}>
                                <Text style={loginStyles.inputIcon}>✉️</Text>
                                <TextInput
                                    style={loginStyles.inputText}
                                    placeholder="Nhập email của bạn"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        )}
                    />
                    {errors.email && (
                        <Text style={loginStyles.errorText}>{errors.email.message}</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[loginStyles.loginButton, isLoading && loginStyles.loginButtonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    <Text style={loginStyles.loginButtonText}>
                        {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleBackToLogin}>
                    <Text style={[loginStyles.forgotPassword, { textAlign: 'center', marginTop: 20 }]}>
                        Quay lại đăng nhập
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}