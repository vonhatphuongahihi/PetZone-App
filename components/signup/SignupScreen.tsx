import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signupStyles } from './signupStyles';

interface SignupFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function SignupScreen() {
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupFormData>({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const password = watch('password');

    const onSubmit = (data: SignupFormData) => {
        Alert.alert('Thành công', 'Đăng ký thành công!', [
            { text: 'OK', onPress: () => router.replace('/login') }
        ]);
    };

    const handleLogin = () => {
        router.push('/login');
    };

    return (
        <SafeAreaView style={signupStyles.container}>
            <View style={signupStyles.topSection}>
                <Image
                    source={require('@/assets/images/bubble-left.png')}
                    style={signupStyles.bubbleLeft}
                    contentFit="contain"
                />

                <Image
                    source={require('@/assets/images/bubble-right.png')}
                    style={signupStyles.bubbleRight}
                    contentFit="contain"
                />

                <Image
                    source={require('@/assets/images/dog-feet.png')}
                    style={signupStyles.dogFeet}
                    contentFit="contain"
                />
            </View>

            <ScrollView
                style={signupStyles.middleSection}
                contentContainerStyle={signupStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
                overScrollMode="never"
                scrollEventThrottle={16}
            >
                <Text style={signupStyles.title}>
                    <Text style={signupStyles.titleFirst}>Đăng </Text>
                    <Text style={signupStyles.titleSecond}>ký</Text>
                </Text>

                <View style={signupStyles.inputContainer}>
                    <Text style={signupStyles.inputLabel}>Tên đăng nhập</Text>
                    <Controller
                        control={control}
                        name="username"
                        rules={{
                            required: "Bạn cần nhập tên đăng nhập",
                            minLength: {
                                value: 3,
                                message: "Tên đăng nhập phải có ít nhất 3 ký tự",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={[
                                signupStyles.inputField,
                                errors.username && signupStyles.inputFieldError
                            ]}>
                                <Image
                                    source={require('@/assets/images/user-icon.png')}
                                    style={signupStyles.inputIcon}
                                    contentFit="contain"
                                />
                                <TextInput
                                    style={signupStyles.inputText}
                                    placeholder="Nhập tên đăng nhập của bạn"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    autoCapitalize="none"
                                />
                            </View>
                        )}
                    />
                    {errors.username && (
                        <Text style={signupStyles.errorText}>{errors.username.message}</Text>
                    )}
                </View>

                <View style={signupStyles.inputContainer}>
                    <Text style={signupStyles.inputLabel}>Email</Text>
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
                                signupStyles.inputField,
                                errors.email && signupStyles.inputFieldError
                            ]}>
                                <Text style={signupStyles.inputIcon}>✉️</Text>
                                <TextInput
                                    style={signupStyles.inputText}
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
                        <Text style={signupStyles.errorText}>{errors.email.message}</Text>
                    )}
                </View>

                <View style={signupStyles.inputContainer}>
                    <Text style={signupStyles.inputLabel}>Mật khẩu</Text>
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
                                signupStyles.inputField,
                                errors.password && signupStyles.inputFieldError
                            ]}>
                                <Text style={signupStyles.inputIcon}>🔒</Text>
                                <TextInput
                                    style={signupStyles.inputText}
                                    placeholder="Nhập mật khẩu của bạn"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={signupStyles.eyeIcon}
                                >
                                    <Text style={signupStyles.eyeIconText}>
                                        {showPassword ? '🙉' : '🙈'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    {errors.password && (
                        <Text style={signupStyles.errorText}>{errors.password.message}</Text>
                    )}
                </View>

                <View style={signupStyles.inputContainer}>
                    <Text style={signupStyles.inputLabel}>Nhập lại mật khẩu</Text>
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
                                signupStyles.inputField,
                                errors.confirmPassword && signupStyles.inputFieldError
                            ]}>
                                <Text style={signupStyles.inputIcon}>🔒</Text>
                                <TextInput
                                    style={signupStyles.inputText}
                                    placeholder="Nhập lại mật khẩu của bạn"
                                    placeholderTextColor="#999"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={signupStyles.eyeIcon}
                                >
                                    <Text style={signupStyles.eyeIconText}>
                                        {showConfirmPassword ? '🙉' : '🙈'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    {errors.confirmPassword && (
                        <Text style={signupStyles.errorText}>{errors.confirmPassword.message}</Text>
                    )}
                </View>

                <TouchableOpacity style={signupStyles.signupButton} onPress={handleSubmit(onSubmit)}>
                    <Text style={signupStyles.signupButtonText}>Đăng ký</Text>
                </TouchableOpacity>

                <View style={signupStyles.loginContainer}>
                    <Text style={signupStyles.loginText}>
                        Bạn đã có tài khoản?{' '}
                        <Text style={signupStyles.loginLink} onPress={handleLogin}>
                            Đăng nhập
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
