import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const sellerBottomNavStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E1E8ED',
        paddingTop: 8,
        paddingBottom: 34,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    navLabel: {
        fontSize: 12,
        color: '#7F8C8D',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500',
    },
    navLabelActive: {
        color: '#FBBC05',
        fontWeight: '600',
    },
    safeArea: {
        backgroundColor: '#fff', 
    }
});