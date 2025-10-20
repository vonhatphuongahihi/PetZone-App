import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const createStoreStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    headerSection: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#FFD54F',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    storeIcon: {
        marginBottom: 20,
        width: 50,
        height: 50,
        marginTop: -20
    },
    title: {
        fontSize: 28,
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
    subtitle: {
        fontSize: 15,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 22,
        marginTop: -10
    },

    formCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 24,
        lineHeight: 20,
    },

    inputContainer: {
        marginBottom: 20,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    halfWidth: {
        width: '48%',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 8,
    },
    inputField: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E1E8ED',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#2C3E50',
        minHeight: 48,
    },
    textAreaField: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E1E8ED',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#2C3E50',
        minHeight: 150,
        textAlignVertical: 'top',
    },
    inputFieldError: {
        borderColor: '#E74C3C',
        borderWidth: 2,
    },
    errorText: {
        color: '#E74C3C',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },

    submitButton: {
        backgroundColor: '#FFD54F',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: '#FFD54F',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonDisabled: {
        backgroundColor: '#BDC3C7',
        shadowOpacity: 0.1,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    submitButtonIcon: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    
    previewButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        borderWidth: 2,
        borderColor: '#5A52E5',
    },
    previewButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
