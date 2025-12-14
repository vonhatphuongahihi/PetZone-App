import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { storeService } from '../../services/storeService';
import { loginStyles } from './loginStyles';

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginScreen() {
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await authService.login({
                email: data.email,
                password: data.password,
            });

            // Save token and user data to storage
            await AsyncStorage.setItem("jwt_token", response.token);
            await AsyncStorage.setItem("user_data", JSON.stringify(response.user));
            console.log("TOKEN ĐÃ LƯU THÀNH CÔNG:", response.token);

            // Initialize socket connection immediately after login to mark user as online
            try {
                const { getSocket } = await import('../../services/socket');
                const socket = await getSocket();
                console.log('[LoginScreen] Socket initialized, user will be marked as online');

                // Wait for socket to actually connect (important for mobile)
                const waitForConnection = () => {
                    return new Promise<void>((resolve) => {
                        if (socket.connected) {
                            console.log('[LoginScreen] Socket already connected');
                            resolve();
                            return;
                        }

                        const timeout = setTimeout(() => {
                            console.log('[LoginScreen] Socket connection timeout, proceeding anyway');
                            resolve();
                        }, 2000);

                        socket.once('connect', () => {
                            console.log('[LoginScreen] Socket connected after login');
                            clearTimeout(timeout);
                            resolve();
                        });
                    });
                };

                await waitForConnection();
                // Additional delay to ensure backend processes the connection
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (socketError) {
                console.error('[LoginScreen] Error initializing socket:', socketError);
                // Continue with navigation even if socket fails
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            // Check user role and redirect accordingly
            if (response.user.role === 'SELLER') {
                // For sellers, check if they have a store
                try {
                    console.log('Checking if seller has store...');
                    const hasStore = await storeService.checkStoreExists(response.token);
                    console.log('Store exists:', hasStore);

                    if (hasStore) {
                        // Seller has a store, go to seller dashboard
                        console.log('Redirecting to seller dashboard');
                        router.replace('/seller/dashboard');
                    } else {
                        // Seller doesn't have a store, redirect to create-store
                        console.log('Redirecting to create store');
                        router.replace('/create-store');
                    }
                } catch (storeError) {
                    // If error checking store, redirect to create-store
                    console.error('Error checking store:', storeError);
                    console.log('Error occurred, redirecting to create store');
                    router.replace('/create-store');
                }
            } else {
                // For regular users, go to main app
                console.log('Regular user, redirecting to main app');
                router.replace('/(tabs)');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại';

            // Check if error is due to unverified email
            if (errorMessage.includes('Email chưa được xác thực') || errorMessage.includes('xác thực email')) {
                Alert.alert(
                    'Email chưa được xác thực',
                    'Vui lòng xác thực email trước khi đăng nhập. Bạn có muốn chuyển đến trang xác thực OTP không?',
                    [
                        {
                            text: 'Hủy',
                            style: 'cancel'
                        },
                        {
                            text: 'Xác thực ngay',
                            onPress: () => {
                                // Get email from form
                                const email = watch('email');
                                if (email) {
                                    router.push({
                                        pathname: '/otp-verify',
                                        params: { email, type: 'signup' }
                                    });
                                } else {
                                    Alert.alert('Lỗi', 'Vui lòng nhập email để xác thực');
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Lỗi', errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        Alert.alert('Google Login', 'Tính năng đang phát triển');
    };

    const handleRegister = () => {
        router.push('/signup');
    };

    const handleForgotPassword = () => {
        router.push('/forgot-password');
    };

    return (
        <SafeAreaView style={loginStyles.container}>
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
                    <Text style={loginStyles.titleFirst}>Đăng </Text>
                    <Text style={loginStyles.titleSecond}>nhập</Text>
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

                <View style={loginStyles.inputContainer}>
                    <Text style={loginStyles.inputLabel}>Mật khẩu</Text>
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
                                    placeholder="Nhập mật khẩu của bạn"
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

                <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={loginStyles.forgotPassword}>Bạn quên mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[loginStyles.loginButton, isLoading && loginStyles.loginButtonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    <Text style={loginStyles.loginButtonText}>
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Text>
                </TouchableOpacity>


                <View style={loginStyles.registerContainer}>
                    <Text style={loginStyles.registerText}>
                        Bạn chưa có tài khoản?{' '}
                        <Text style={loginStyles.registerLink} onPress={handleRegister}>
                            Đăng ký
                        </Text>
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}