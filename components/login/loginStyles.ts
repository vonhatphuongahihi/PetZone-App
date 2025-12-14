import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const loginStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    topSection: {
        flex: 0.25,
        position: 'relative',
    },
    bubbleLeft: {
        position: 'absolute',
        top: -35,
        left: 0,
        width: 270,
        height: 216,
    },
    bubbleRight: {
        position: 'absolute',
        top: -30,
        right: 0,
        width: 216,
        height: 180,
    },
    dogFeet: {
        position: 'absolute',
        top: 45,
        right: 20,
        width: 50,
        height: 50,
    },
    middleSection: {
        flex: 0.75,
        paddingHorizontal: 20,
        paddingTop: 30,
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
        fontSize: 16,
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
    forgotPassword: {
        textAlign: 'right',
        color: '#666',
        fontSize: 14,
        marginBottom: 30,
        textDecorationLine: 'underline',
    },
    loginButton: {
        backgroundColor: '#FBBC05',
        borderRadius: 58,
        height: 48,
        alignItems: 'center',
        marginBottom: 30,
        justifyContent: 'center',
    },
    loginButtonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dividerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },

    registerContainer: {
        alignItems: 'center',
    },
    registerText: {
        fontSize: 14,
        color: '#666',
    },
    registerLink: {
        color: '#FFD54F',
        fontWeight: '600',
    },
});
