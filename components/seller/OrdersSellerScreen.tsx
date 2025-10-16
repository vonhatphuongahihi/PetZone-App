import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SellerBottomNavigation } from './SellerBottomNavigation';
import { SellerTopNavigation } from './SellerTopNavigation';

interface OrderItem {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    image: any;
    weight: string;
    customerName: string;
    orderDate: string;
    status: 'pending' | 'shipping' | 'delivered';
}

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    orderDate: string;
    totalAmount: number;
    status: 'pending' | 'shipping' | 'delivered';
    items: OrderItem[];
}

export default function OrdersSellerScreen() {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'shipping' | 'delivered'>('all');
    const [showDropdown, setShowDropdown] = useState(false);
    
    const [orders, setOrders] = useState<Order[]>([
        {
            id: '1',
            orderNumber: 'DH001',
            customerName: 'Nguyễn Văn A',
            customerPhone: '0901234567',
            orderDate: '2024-10-12',
            totalAmount: 243198,
            status: 'pending',
            items: [
                {
                    id: '1',
                    productName: 'Cát vệ sinh đậu nành Cats me',
                    price: 121599,
                    quantity: 2,
                    image: require('@/assets/images/icon.png'),
                    weight: 'Catsme Than',
                    customerName: 'Nguyễn Văn A',
                    orderDate: '2024-10-12',
                    status: 'pending'
                }
            ]
        },
        {
            id: '2',
            orderNumber: 'DH002',
            customerName: 'Trần Thị B',
            customerPhone: '0912345678',
            orderDate: '2024-10-11',
            totalAmount: 121599,
            status: 'shipping',
            items: [
                {
                    id: '2',
                    productName: 'Cát vệ sinh đậu nành Cats me',
                    price: 121599,
                    quantity: 1,
                    image: require('@/assets/images/icon.png'),
                    weight: 'Catsme Than',
                    customerName: 'Trần Thị B',
                    orderDate: '2024-10-11',
                    status: 'shipping'
                }
            ]
        },
        {
            id: '3',
            orderNumber: 'DH003',
            customerName: 'Lê Văn C',
            customerPhone: '0923456789',
            orderDate: '2024-10-10',
            totalAmount: 364797,
            status: 'delivered',
            items: [
                {
                    id: '3',
                    productName: 'Cát vệ sinh đậu nành Cats me',
                    price: 121599,
                    quantity: 3,
                    image: require('@/assets/images/icon.png'),
                    weight: 'Catsme Than',
                    customerName: 'Lê Văn C',
                    orderDate: '2024-10-10',
                    status: 'delivered'
                }
            ]
        }
    ]);

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN').replace(/,/g, '.') + 'đ';
    };

    const getFilteredOrders = () => {
        if (selectedFilter === 'all') {
            return orders;
        }
        return orders.filter(order => order.status === selectedFilter);
    };

    const getFilterText = (filter: string) => {
        const filterMap = {
            'all': 'Tất cả đơn hàng',
            'pending': 'Chờ xác nhận',
            'shipping': 'Đang giao',
            'delivered': 'Đã giao thành công'
        };
        return filterMap[filter as keyof typeof filterMap] || filter;
    };

    const getStatusText = (status: string) => {
        const statusMap = {
            'pending': 'Chờ xác nhận',
            'shipping': 'Đang giao',
            'delivered': 'Đã giao thành công',
        };
        return statusMap[status as keyof typeof statusMap] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap = {
            'pending': '#FBBC05',
            'shipping': '#2196F3',
            'delivered': '#8BC34A',
        };
        return colorMap[status as keyof typeof colorMap] || '#666';
    };

    const handleConfirmOrder = (orderId: string) => {
        Alert.alert(
            "Xác nhận đơn hàng",
            "Bạn có chắc chắn muốn xác nhận đơn hàng này?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xác nhận",
                    onPress: () => {
                        setOrders(orders.map(order => 
                            order.id === orderId 
                                ? { ...order, status: 'shipping' as const }
                                : order
                        ));
                    }
                }
            ]
        );
    };

    const handleDeliverOrder = (orderId: string) => {
        Alert.alert(
            "Xác nhận giao hàng",
            "Xác nhận đã giao hàng thành công?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Đã giao",
                    onPress: () => {
                        setOrders(orders.map(order => 
                            order.id === orderId 
                                ? { ...order, status: 'delivered' as const }
                                : order
                        ));
                    }
                }
            ]
        );
    };

    const renderOrderItem = (order: Order) => (
        <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                <View style={[
                    styles.statusBadge, 
                    { 
                        backgroundColor: order.status === 'pending' ? '#FFFBEA' : getStatusColor(order.status) + '20',
                        borderColor: getStatusColor(order.status)
                    }
                ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {getStatusText(order.status)}
                    </Text>
                </View>
            </View>
            
            <Text style={styles.customerInfo}>Khách hàng: {order.customerName}</Text>
            <Text style={styles.customerInfo}>SĐT: {order.customerPhone}</Text>
            <Text style={styles.orderDate}>Ngày đặt: {order.orderDate}</Text>
            
            {order.items.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                    <Image source={item.image} style={styles.productImage} />
                    <View style={styles.itemInfo}>
                        <Text style={styles.productName}>{item.productName}</Text>
                        <Text style={styles.brandName}>{item.weight}</Text>
                        
                        <View style={styles.priceSection}>
                            <Text style={styles.currentPrice}>{formatPrice(item.price)}</Text>
                            <Text style={styles.quantity}>x{item.quantity}</Text>
                        </View>
                        
                        <Text style={styles.discountInfo}>
                            Tổng số tiền ({item.quantity} sản phẩm): {formatPrice(item.price * item.quantity)}
                        </Text>
                    </View>
                </View>
            ))}
            
            <View style={styles.orderFooter}>
                <Text style={styles.totalAmount}>Tổng tiền: {formatPrice(order.totalAmount)}</Text>
            </View>
            
            <View style={styles.actionButtons}>
                {order.status === 'pending' && (
                    <TouchableOpacity 
                        style={styles.confirmButton}
                        onPress={() => handleConfirmOrder(order.id)}
                    >
                        <Text style={styles.confirmButtonText}>Xác nhận đơn hàng</Text>
                    </TouchableOpacity>
                )}
                {order.status === 'shipping' && (
                    <TouchableOpacity 
                        style={styles.deliverButton}
                        onPress={() => handleDeliverOrder(order.id)}
                    >
                        <Text style={styles.deliverButtonText}>Đã giao hàng</Text>
                    </TouchableOpacity>
                )}
                
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <SellerTopNavigation />
            
            {/* Filter Dropdown */}
            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={styles.filterButton}
                    onPress={() => setShowDropdown(!showDropdown)}
                >
                    <Text style={styles.filterButtonText}>{getFilterText(selectedFilter)}</Text>
                    <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                
                {showDropdown && (
                    <View style={styles.dropdownMenu}>
                        {['all', 'pending', 'shipping', 'delivered'].map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.dropdownItem,
                                    selectedFilter === filter && styles.dropdownItemSelected
                                ]}
                                onPress={() => {
                                    setSelectedFilter(filter as any);
                                    setShowDropdown(false);
                                }}
                            >
                                <Text style={[
                                    styles.dropdownItemText,
                                    selectedFilter === filter && styles.dropdownItemTextSelected
                                ]}>
                                    {getFilterText(filter)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
            
            {/* Orders List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {getFilteredOrders().map(renderOrderItem)}
            </ScrollView>
            
            <SellerBottomNavigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
        paddingBottom: 80,
        paddingTop: 16,
    },
    orderCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#FBBC05',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        backgroundColor: '#FFFBEA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FBBC05',
    },
    statusText: {
        color: '#FBBC05',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
    customerInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: 12,
    },
    itemContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    brandName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    quantity: {
        fontSize: 14,
        color: '#666',
    },
    discountInfo: {
        fontSize: 12,
        color: '#666',
        textAlign: 'left',
        marginTop: 4,
    },
    productWeight: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E53E3E',
    },

    orderFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
        marginBottom: 16,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E53E3E',
        textAlign: 'right',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#FBBC05',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    deliverButton: {
        flex: 1,
        backgroundColor: '#FBBC05',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    deliverButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    completedButton: {
        flex: 1,
        backgroundColor: '#8BC34A',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    completedButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    
    // Filter Dropdown Styles
    filterContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        position: 'relative',
        zIndex: 1000,
    },
    filterButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderRadius: 8,
    },
    filterButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#666',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: 8,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 1001,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownItemSelected: {
        backgroundColor: '#FFB40010',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownItemTextSelected: {
        color: '#FFB400',
        fontWeight: '600',
    },
});
