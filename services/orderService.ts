// Order Service
// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.20.3.212:3001/api';

export interface OrderItem {
    productId: number;
    storeId: string;
    title: string;
    sku?: string;
    price: number;
    quantity: number;
}

export interface CreateOrderData {
    items: OrderItem[];
    addressId: string;
    paymentMethod: string;
    shippingFee?: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    storeId: string | null;
    status: string;
    subtotal: number;
    shippingFee: number;
    total: number;
    paymentMethod: string | null;
    paymentStatus: string;
    shippedAt: string | null;
    deliveredAt: string | null;
    cancelledAt: string | null;
    estimatedDeliveryDate: string | null;
    createdAt: string;
    updatedAt: string;
    orderItems: any[];
    store: any;
    user?: {
        id: string;
        username: string;
        email: string;
    };
    payments: any[];
}

export const orderService = {
    // Tạo đơn hàng
    createOrder: async (data: CreateOrderData, token: string): Promise<{ success: boolean; message: string; data: Order[] }> => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Tạo đơn hàng thất bại');
        }

        return response.json();
    },

    // Lấy danh sách đơn hàng của user
    getUserOrders: async (token: string, status?: string): Promise<{ success: boolean; data: Order[] }> => {
        const url = status
            ? `${API_BASE_URL}/orders?status=${status}`
            : `${API_BASE_URL}/orders`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy danh sách đơn hàng thất bại');
        }

        return response.json();
    },

    // Lấy chi tiết đơn hàng
    getOrderById: async (orderId: string, token: string): Promise<{ success: boolean; data: Order }> => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy chi tiết đơn hàng thất bại');
        }

        return response.json();
    },

    // Hủy đơn hàng
    cancelOrder: async (orderId: string, token: string): Promise<{ success: boolean; message: string; data: Order }> => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Hủy đơn hàng thất bại');
        }

        return response.json();
    },

    // Lấy danh sách đơn hàng của store (cho seller)
    getStoreOrders: async (token: string, status?: string): Promise<{ success: boolean; data: Order[] }> => {
        const url = status
            ? `${API_BASE_URL}/orders/store?status=${status}`
            : `${API_BASE_URL}/orders/store`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy danh sách đơn hàng của store thất bại');
        }

        return response.json();
    },

    // Cập nhật trạng thái đơn hàng (cho seller)
    updateOrderStatus: async (orderId: string, status: string, token: string): Promise<{ success: boolean; message: string; data: Order }> => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật trạng thái đơn hàng thất bại');
        }

        return response.json();
    },
};

