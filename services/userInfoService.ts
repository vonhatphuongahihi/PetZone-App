// User Info Service
import { API_BASE_URL } from '../config/api';

export interface UserInfo {
    id: string;
    email: string;
    username: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserData {
    username?: string;
}

export const userInfoService = {
    // Get current user info
    getUserInfo: async (token: string): Promise<{ user: UserInfo }> => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy thông tin user thất bại');
        }

        return response.json();
    },

    // Update user info (có thể mở rộng sau)
    updateUserInfo: async (data: UpdateUserData, token: string): Promise<{ message: string; user: UserInfo }> => {
        const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật thông tin thất bại');
        }

        return response.json();
    },
};