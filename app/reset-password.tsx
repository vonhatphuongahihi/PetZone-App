import { Image } from 'expo-image';
// 1. Import Stack từ expo-router
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginStyles } from '../components/login/loginStyles';
import { authService } from '../services/authService';

interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

export default function ResetPasswordScreen() {
    const params = useLocalSearchParams<{ email?: string }>();
    const email = (params.email as string) || '';

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const password = watch('password');

    // ... existing code ...

const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
        // 1. Gọi API
        await authService.resetPassword({
            email: email, 
            password: data.password
        });

        // 2. Tự động chuyển về trang login
        router.replace('/login');
    } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
        setIsLoading(false);
    }
};

    return (
        <SafeAreaView style={loginStyles.container}>
            {/* 2. Thêm dòng này để ẩn header mặc định */}
            <Stack.Screen options={{ headerShown: false }} />

            <View style={loginStyles.topSection}>
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
                    <Text style={loginStyles.titleFirst}>Đặt lại </Text>
                    <Text style={loginStyles.titleSecond}>mật khẩu</Text>
                </Text>

                <Text style={[loginStyles.inputLabel, { textAlign: 'center', marginBottom: 20 }]}>
                    Nhập mật khẩu mới cho tài khoản {email}
                </Text>

                <View style={loginStyles.inputContainer}>
                    <Text style={loginStyles.inputLabel}>Mật khẩu mới</Text>
                    <Controller
                        control={control}
                        name="password"
                        rules={{
                            required: "Bạn cần nhập mật khẩu",
                            minLength: {
                                value: 6,
                                message: "Mật khẩu phải có ít nhất 6 ký tự",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={[
                                loginStyles.inputField,
                                errors.password && loginStyles.inputFieldError
                            ]}>
                                <Text style={loginStyles.inputIcon}>🔒</Text>
                                <TextInput
                                    style={loginStyles.inputText}
                                    placeholder="Nhập mật khẩu mới"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={loginStyles.eyeIcon}
                                >
                                    <Text style={loginStyles.eyeIconText}>
                                        {showPassword ? '🙉' : '🙈'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    {errors.password && (
                        <Text style={loginStyles.errorText}>{errors.password.message}</Text>
                    )}
                </View>

                <View style={loginStyles.inputContainer}>
                    <Text style={loginStyles.inputLabel}>Nhập lại mật khẩu</Text>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        rules={{
                            required: "Bạn cần nhập lại mật khẩu",
                            validate: (value) =>
                                value === password || "Mật khẩu không khớp",
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={[
                                loginStyles.inputField,
                                errors.confirmPassword && loginStyles.inputFieldError
                            ]}>
                                <Text style={loginStyles.inputIcon}>🔒</Text>
                                <TextInput
                                    style={loginStyles.inputText}
                                    placeholder="Nhập lại mật khẩu"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={loginStyles.eyeIcon}
                                >
                                    <Text style={loginStyles.eyeIconText}>
                                        {showConfirmPassword ? '🙉' : '🙈'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    {errors.confirmPassword && (
                        <Text style={loginStyles.errorText}>{errors.confirmPassword.message}</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[loginStyles.loginButton, isLoading && loginStyles.loginButtonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    <Text style={loginStyles.loginButtonText}>
                        {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}