import { API_BASE_URL } from '../config/api';

export interface CreateStoreData {
    storeName: string;
    description?: string;
    phoneNumber: string;
    email: string;
    address: string;
}

export interface Store {
    id: string;
    userId: string;
    storeName: string;
    slug: string;
    description?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    businessCategory?: string;
    rating: number;
    revenue: number;
    totalOrders: number;
    totalReviews: number;
    totalProducts: number;
    followersCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    user: {
        id: string;
        username: string;
        email: string;
        role: string;
    };
}

export const storeService = {
    createStore: async (data: CreateStoreData, token: string): Promise<{ message: string; store: Store }> => {
        const response = await fetch(`${API_BASE_URL}/store/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Tạo cửa hàng thất bại');
        }

        return response.json();
    },

    getMyStore: async (token: string): Promise<{ store: Store }> => {
        const response = await fetch(`${API_BASE_URL}/store/my-store`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy thông tin cửa hàng thất bại');
        }

        return response.json();
    },

    updateStore: async (data: Partial<CreateStoreData>, token: string): Promise<{ message: string; store: Store }> => {
        const response = await fetch(`${API_BASE_URL}/store/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật cửa hàng thất bại');
        }

        return response.json();
    },

    checkStoreExists: async (token: string): Promise<boolean> => {
        try {

            const response = await fetch(`${API_BASE_URL}/store/my-store`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });


            if (response.status === 404) {
                return false;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('API Error:', errorData);
                throw new Error(errorData.message || 'Lỗi khi kiểm tra cửa hàng');
            }

            const storeData = await response.json();
            return true;
        } catch (error) {
            console.error('Error checking store existence:', error);
            console.error('Error type:', typeof error);
            console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');

            return false;
        }
    },

    getSellerStats: async (token: string): Promise<{ success: boolean; data: { totalRevenue: number; totalOrders: number; totalProducts: number; rating: number } }> => {
        const response = await fetch(`${API_BASE_URL}/store/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy thống kê thất bại');
        }

        return response.json();
    },

    getBestSellingProducts: async (token: string): Promise<{ success: boolean; data: { id: number; name: string; price: number; sold: number; image: string | null; rating: number }[] }> => {
        const response = await fetch(`${API_BASE_URL}/store/best-selling`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy sản phẩm bán chạy thất bại');
        }

        return response.json();
    }
};