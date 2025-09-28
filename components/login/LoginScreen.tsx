import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginStyles } from './loginStyles';

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginScreen() {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = (data: LoginFormData) => {
        // TODO: Implement actual login logic
        Alert.alert('Thành công', 'Đăng nhập thành công!', [
            { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
    };

    const handleGoogleLogin = () => {
        Alert.alert('Google Login', 'Tính năng đang phát triển');
    };

    const handleRegister = () => {
        router.push('/signup');
    };

    const handleForgotPassword = () => {
        Alert.alert('Quên mật khẩu', 'Tính năng đang phát triển');
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

                <TouchableOpacity style={loginStyles.loginButton} onPress={handleSubmit(onSubmit)}>
                    <Text style={loginStyles.loginButtonText}>Đăng nhập</Text>
                </TouchableOpacity>

                <View style={loginStyles.dividerContainer}>
                    <View style={loginStyles.dividerLine} />
                    <Text style={loginStyles.dividerText}>Hoặc đăng nhập bằng</Text>
                </View>

                <TouchableOpacity onPress={handleGoogleLogin}>
                    <Image
                        source={require('@/assets/images/google-login.png')}
                        style={loginStyles.googleIcon}
                        contentFit="contain"
                    />
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
