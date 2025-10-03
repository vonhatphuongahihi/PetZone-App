import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authService } from '../../services/authService';
import { otpStyles } from './otpStyles';

interface OTPVerificationScreenProps {
    username?: string;
    email?: string;
}

export default function OTPVerificationScreen({
    username: usernameProp,
    email: emailProp
}: OTPVerificationScreenProps) {
    const params = useLocalSearchParams<{ username?: string; email?: string }>();
    const username = (params.username as string) || usernameProp || 'bạn';
    const email = (params.email as string) || emailProp || '';
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const inputRefs = useRef<TextInput[]>([]);

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 4) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP');
            return;
        }

        setIsLoading(true);

        try {
            await authService.verifyOtp(email, otpCode);
            router.replace('/login');
        } catch (error) {
            Alert.alert('Lỗi', 'Mã OTP không đúng hoặc đã hết hạn');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            await authService.sendOtp(email);
            Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể gửi lại mã OTP');
        }
    };

    return (
        <View style={otpStyles.container}>
            <View style={otpStyles.topSection}>
                <Image
                    source={require('@/assets/images/bubble-left.png')}
                    style={otpStyles.bubbleLeft}
                    contentFit="contain"
                />

                <Image
                    source={require('@/assets/images/bubble-right.png')}
                    style={otpStyles.bubbleRight}
                    contentFit="contain"
                />

                <Image
                    source={require('@/assets/images/dog-feet.png')}
                    style={otpStyles.dogFeet}
                    contentFit="contain"
                />
            </View>

            <View style={otpStyles.middleSection}>
                <Image
                    source={require('@/assets/images/cat-verify-otp.png')}
                    style={otpStyles.catImage}
                    contentFit="contain"
                />

                <Text style={otpStyles.title}>
                    <Text style={otpStyles.titleFirst}>Xác thực </Text>
                    <Text style={otpStyles.titleSecond}>OTP</Text>
                </Text>

                <Text style={otpStyles.message}>
                    Xin chào {username}! Chúng tôi đã gửi mã xác thực OTP tới email {email}
                </Text>

                <View style={otpStyles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                if (ref) inputRefs.current[index] = ref;
                            }}
                            style={[
                                otpStyles.otpInput,
                                focusedIndex === index && otpStyles.otpInputFocused
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                            onFocus={() => setFocusedIndex(index)}
                            onBlur={() => setFocusedIndex(null)}
                            keyboardType="numeric"
                            maxLength={1}
                            textAlign="center"
                            selectTextOnFocus
                            autoFocus={index === 0}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[otpStyles.verifyButton, isLoading && otpStyles.verifyButtonDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={isLoading}
                >
                    <Text style={otpStyles.verifyButtonText}>
                        {isLoading ? 'Đang xác thực...' : 'Xác thực OTP'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={otpStyles.resendText}>
                        Bạn chưa nhận được mã? <Text style={otpStyles.resendLink}>Gửi lại</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
