import PrivacyPoliciesScreen from '@/components/user/privacy-policies/PrivacyPoliciesScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPoliciesPage() {
    const handleGoBack = () => {
        router.replace('/profile');
    };

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: 'Chính sách bảo mật',
                    headerShown: false
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
                    <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
                </View>
                <PrivacyPoliciesScreen />
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