import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const signupStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    topSection: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        zIndex: 1,
    },
    bubbleLeft: {
        position: 'absolute',
        top: -10,
        left: 0,
        width: 270,
        height: 216,
    },
    bubbleRight: {
        position: 'absolute',
        top: -5,
        right: 0,
        width: 216,
        height: 180,
    },
    dogFeet: {
        position: 'absolute',
        top: 70,
        right: 20,
        width: 50,
        height: 50,
    },
    middleSection: {
        flex: 1,
        marginTop: 180,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'PaytoneOne_400Regular',
    },
    titleFirst: {
        color: '#424242',
    },
    titleSecond: {
        color: '#FFD54F',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: '#424242',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputField: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#484444',
        borderRadius: 52,
        paddingHorizontal: 16,
        paddingVertical: 4,
        fontSize: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        marginRight: 12,
        width: 16,
        height: 16,
    },
    eyeIcon: {
        padding: 4,
    },
    eyeIconText: {
        fontSize: 16,
    },
    inputText: {
        flex: 1,
        fontSize: 15,
        color: '#424242',
    },
    placeholderText: {
        color: '#999',
    },
    inputFieldError: {
        borderColor: '#FF6B6B',
        borderWidth: 2,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    signupButton: {
        backgroundColor: '#FBBC05',
        borderRadius: 58,
        height: 48,
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
        justifyContent: 'center',
    },
    signupButtonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginContainer: {
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        color: '#666',
    },
    loginLink: {
        color: '#FFD54F',
        fontWeight: '600',
    },
    checkboxContainer: {
        marginBottom: 20,
        marginTop: 10,
    },
    checkboxWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#484444',
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxChecked: {
        backgroundColor: '#FBBC05',
        borderColor: '#FBBC05',
    },
    checkboxText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#424242',
        flex: 1,
    },

    // Test OTP Button
    testOTPButton: {
        backgroundColor: '#E0E0E0',
        borderRadius: 58,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        paddingHorizontal: 40,
    },

    testOTPButtonText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: 'bold',
    },

    otpModalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpModalCard: {
        width: '86%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    otpModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        color: '#333',
    },
    otpModalText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    otpModalEmail: {
        fontSize: 14,
        color: '#111',
        marginTop: 8,
        marginBottom: 16,
        fontWeight: '600',
    }
});
