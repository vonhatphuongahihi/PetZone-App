import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Order, orderService } from '../../services/orderService';
import { SellerBottomNavigation } from './SellerBottomNavigation';
import { SellerTopNavigation } from './SellerTopNavigation';

export default function OrdersSellerScreen() {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'cancelled'>('all');
    const [showDropdown, setShowDropdown] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadOrders();
    }, [selectedFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('jwt_token');
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                return;
            }

            // Load all orders for counting
            const allResponse = await orderService.getStoreOrders(token, undefined);
            setAllOrders(allResponse.data || []);

            // Load filtered orders
            const status = selectedFilter === 'all' ? undefined : selectedFilter;
            const response = await orderService.getStoreOrders(token, status);
            setOrders(response.data || []);
        } catch (error: any) {
            console.error('Error loading orders:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN').replace(/,/g, '.') + 'đ';
    };

    const getOrderCount = (status: string) => {
        if (status === 'all') {
            return allOrders.length;
        }
        return allOrders.filter(order => order.status === status).length;
    };

    const getFilterText = (filter: string) => {
        const filterMap = {
            'all': 'Tất cả đơn hàng',
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đang giao hàng',
            'shipped': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };
        const baseText = filterMap[filter as keyof typeof filterMap] || filter;
        const count = getOrderCount(filter);
        return `${baseText} (${count})`;
    };

    const getStatusText = (status: string) => {
        const statusMap = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đang giao hàng',
            'shipped': 'Đã giao hàng',
            'cancelled': 'Đã hủy',
        };
        return statusMap[status as keyof typeof statusMap] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap = {
            'pending': '#FBBC05',
            'confirmed': '#2196F3',
            'shipped': '#4CAF50',
            'cancelled': '#E53935',
        };
        return colorMap[status as keyof typeof colorMap] || '#666';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleConfirmOrder = async (orderId: string) => {
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                return;
            }

            await orderService.updateOrderStatus(orderId, 'confirmed', token);
            setSuccessMessage('Đơn hàng đã được xác nhận và đang giao hàng!');
            setShowSuccessModal(true);
            loadOrders();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể xác nhận đơn hàng');
        }
    };

    const handleDeliverOrder = async (orderId: string) => {
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                return;
            }

            await orderService.updateOrderStatus(orderId, 'shipped', token);
            setSuccessMessage('Đơn hàng đã được đánh dấu là đang giao!');
            setShowSuccessModal(true);
            loadOrders();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật trạng thái đơn hàng');
        }
    };

    const renderOrderItem = (order: Order) => {
        const customerName = order.user?.username || 'Khách hàng';
        const customerPhone = order.user?.email || 'N/A';
        const orderDate = formatDate(order.createdAt);

        return (
            <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <Text style={styles.customerInfo}>Khách hàng: {customerName}</Text>
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
                <Text style={styles.orderDate}>Ngày đặt: {orderDate}</Text>

                {order.orderItems?.map((item: any, index: number) => {
                    const imageUri = item.product?.images?.[0]?.url;
                    return (
                        <View key={item.id || index} style={styles.itemContainer}>
                            <Image
                                source={imageUri ? { uri: imageUri } : require('@/assets/images/icon.png')}
                                style={styles.productImage}
                            />
                            <View style={styles.itemInfo}>
                                <Text style={styles.productName}>{item.title}</Text>

                                <View style={styles.priceSection}>
                                    <Text style={styles.currentPrice}>{formatPrice(Number(item.unitPrice))}</Text>
                                    <Text style={styles.quantity}>x{item.quantity}</Text>
                                </View>

                                <Text style={styles.discountInfo}>
                                    Thành tiền: {formatPrice(Number(item.totalPrice))}
                                </Text>
                            </View>
                        </View>
                    );
                })}

                <View style={styles.orderFooter}>
                    <Text style={styles.totalAmount}>Tổng tiền: {formatPrice(Number(order.total))}</Text>
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
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
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
                        {['all', 'pending', 'confirmed', 'shipped', 'cancelled'].map((filter) => (
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
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FBBC05" />
                    <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {orders.map(renderOrderItem)}
                </ScrollView>
            )}

            <SellerBottomNavigation />

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalIconContainer}>
                            <Text style={styles.modalIcon}>✓</Text>
                        </View>
                        <Text style={styles.modalTitle}>Thành công!</Text>
                        <Text style={styles.modalMessage}>{successMessage}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowSuccessModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
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
        marginBottom: 8,
    },
    statusBadge: {
        backgroundColor: '#FFFBEA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FBBC05',
    },
    statusText: {
        color: '#FBBC05',
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '500',
    },
    customerInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 0,
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
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },

    // Success Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '80%',
        maxWidth: 320,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#8BC34A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalIcon: {
        fontSize: 36,
        color: 'white',
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButton: {
        backgroundColor: '#FBBC05',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
