import { StyleSheet } from 'react-native';

export const otpStyles = StyleSheet.create({
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
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    catImage: {
        width: 260,
        height: 260,
        zIndex: 5,
        marginTop: -65
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'PaytoneOne_400Regular',
        marginTop: -20
    },
    titleFirst: {
        color: '#424242',
    },
    titleSecond: {
        color: '#FFD54F',
    },

    message: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
        paddingHorizontal: 10,
        alignSelf: 'stretch',
    },

    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        paddingHorizontal: 16,
    },

    otpInput: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
        marginHorizontal: 8,
    },

    otpInputFilled: {
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
    },

    otpInputActive: {
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
    },

    otpInputFocused: {
        borderColor: '#FBBC05',
        backgroundColor: '#FFF9E6',
    },

    verifyButton: {
        backgroundColor: '#FBBC05',
        borderRadius: 58,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        paddingHorizontal: 40,
    },

    verifyButtonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },

    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },

    resendText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },

    resendLink: {
        color: '#FBBC05',
        fontWeight: 'bold',
    },
});
