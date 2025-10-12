import { StyleSheet } from 'react-native';

export const sellerTopNavStyles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 44, // Status bar height
        paddingBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storeIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    iconImage: {
        width: 20,
        height: 20,
    },
    homeIconImage: {
        width: 28,
        height: 28,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    petZoneText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginRight: 4,
    },
    sellerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FBBC05',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
