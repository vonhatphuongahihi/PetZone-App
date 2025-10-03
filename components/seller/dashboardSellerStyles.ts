import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const dashboardSellerStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },

    // Header Section
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#FFD54F',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerIcon: {
        width: 35,
        height: 35,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 5,
        fontFamily: 'PaytoneOne_400Regular',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'center',
    },

    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },

    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#FFD54F',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    emptyIcon: {
        fontSize: 50,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },

    // Actions
    actions: {
        paddingBottom: 30,
    },
    logoutButton: {
        backgroundColor: '#E74C3C',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E74C3C',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
