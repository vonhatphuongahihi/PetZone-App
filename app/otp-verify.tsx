import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import OTPVerificationScreen from '../components/otp/OTPVerificationScreen';

export default function OTPVerifyRoute() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <OTPVerificationScreen />
        </SafeAreaView>
    );
}
