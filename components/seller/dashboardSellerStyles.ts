import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const dashboardSellerStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 0,
    },
    scrollView: {
        flex: 1,
    },

    // Header Banner
    headerBanner: {
        backgroundColor: '#FFF8E1',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    storeNameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FBBC05',
    },
    helloImage: {
        width: 80,
        height: 60,
        borderRadius: 10,
    },

    // KPI Cards
    kpiContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        gap: 12,
    },
    kpiCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    kpiLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    kpiIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#FBBC05',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    kpiInfo: {
        flex: 1,
    },
    kpiTitle: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 4,
    },
    kpiValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 4,
    },
    kpiTrend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendUp: {
        fontSize: 12,
        color: '#FBBC05',
        marginRight: 4,
    },
    trendUpText: {
        fontSize: 12,
        color: '#FBBC05',
        fontWeight: '500',
    },
    trendDown: {
        fontSize: 12,
        color: '#E74C3C',
        marginRight: 4,
    },
    trendDownText: {
        fontSize: 12,
        color: '#E74C3C',
        fontWeight: '500',
    },
    arrowIcon: {
        fontSize: 20,
        color: '#7F8C8D',
        fontWeight: 'bold',
    },

    // Products Section
    productsSection: {
        backgroundColor: '#FFF8E1',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
    },
    productsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 16,
        textAlign: 'left',
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E1E8ED',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
        minHeight: 60,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2C3E50',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    productRating: {
        fontSize: 12,
        color: '#7F8C8D',
        marginRight: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E74C3C',
    },
    productBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    soldButton: {
        backgroundColor: '#FDE8A5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },
    soldText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2C3E50',
    },
});
