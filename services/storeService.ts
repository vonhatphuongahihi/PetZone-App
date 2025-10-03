// Store Service
const API_BASE_URL = 'http://10.0.113.97:3001/api';

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
            await storeService.getMyStore(token);
            return true;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return false;
            }
            throw error;
        }
    }
};
