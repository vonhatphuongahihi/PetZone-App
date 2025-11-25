// Seller Service
import { API_BASE_URL } from '../config/api';

export interface SellerProfile {
    store: {
        id: string;
        storeName: string;
        slug: string;
        description?: string;
        avatarUrl?: string;
        phoneNumber?: string;
        email?: string;
        address?: string;
        rating: number;
        revenue: number;
        totalOrders: number;
        totalReviews: number;
        totalProducts: number;
        followersCount: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
    user: {
        id: string;
        username: string;
        email: string;
        role: string;
        createdAt: string;
    };
}

export interface UpdateSellerProfileData {
    storeName: string;
    description?: string;
    phoneNumber: string;
    address: string;
    ownerName?: string;
}

export interface SellerStats {
    storeName: string;
    rating: number;
    revenue: number;
    totalOrders: number;
    totalProducts: number;
    totalReviews: number;
    followersCount: number;
    memberSince: string;
}

export const sellerService = {
    // Get seller profile
    getProfile: async (token: string): Promise<{ profile: SellerProfile }> => {
        try {
            console.log('Calling API:', `${API_BASE_URL}/store/profile`);
            console.log('With token:', token);
            
            const response = await fetch(`${API_BASE_URL}/store/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error response:', errorData);
                
                // Provide specific error messages
                if (response.status === 404) {
                    throw new Error('Store not found - Bạn chưa tạo cửa hàng');
                } else if (response.status === 401) {
                    throw new Error('Token không hợp lệ hoặc đã hết hạn');
                } else {
                    throw new Error(errorData.message || `HTTP ${response.status}: Lấy thông tin profile thất bại`);
                }
            }

            const data = await response.json();
            console.log('Success response:', JSON.stringify(data, null, 2));
            return data;
        } catch (error: any) {
            console.error('getProfile error:', error);
            
            // Handle network errors
            if (error.message === 'Network request failed' || error.name === 'TypeError') {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            }
            
            throw error;
        }
    },

    // Update seller profile
    updateProfile: async (data: UpdateSellerProfileData, token: string): Promise<{ message: string; store: any }> => {
        const response = await fetch(`${API_BASE_URL}/store/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật profile thất bại');
        }

        return response.json();
    },

    // Get seller statistics
    getStats: async (token: string): Promise<{ stats: SellerStats }> => {
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
};