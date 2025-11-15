import UserInfoScreen from "@/components/user/user-info/UserInfoScreen";
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserInfoPage() {
    const handleGoBack = () => {
        router.replace('/profile');
    };

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: 'Thông tin tài khoản',
                    headerShown: false // Hide default header since we have custom header
                }} 
            />
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={handleGoBack}
                        style={styles.backButton}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
                </View>
                <UserInfoScreen />
            </SafeAreaView>
        </>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: '#000',
        flex: 1,
    },
};