// Store Service
const API_BASE_URL = 'http://10.11.2.22:3001/api';

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
            console.log('Checking store existence with token:', token ? 'Token exists' : 'No token');
            console.log('API URL:', `${API_BASE_URL}/store/my-store`);

            const response = await fetch(`${API_BASE_URL}/store/my-store`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.status === 404) {
                console.log('Store not found (404)');
                return false; // Store not found
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('API Error:', errorData);
                throw new Error(errorData.message || 'Lỗi khi kiểm tra cửa hàng');
            }

            const storeData = await response.json();
            console.log('Store found:', storeData);
            return true; // Store exists
        } catch (error) {
            // If it's a network error or other issue, assume store doesn't exist
            console.error('Error checking store existence:', error);
            console.error('Error type:', typeof error);
            console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');

            // For network errors, return false (assume no store)
            return false;
        }
    }
};