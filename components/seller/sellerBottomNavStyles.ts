import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const sellerBottomNavStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8D93A5',
        marginTop: 2,
    },
    navLabelActive: {
        color: '#FBBC05',
    },
});