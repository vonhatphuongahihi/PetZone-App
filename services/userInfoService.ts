// User Info Service
// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.20.3.212:3001/api';

export interface UserInfo {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    dateofBirth?: string;
    totalSpent?: number;
}

export interface UpdateUserData {
    username?: string;
    dateofBirth?: string;
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

    // Get user info by ID
    getUserInfoById: async (userId: string, token?: string): Promise<{ user: UserInfo }> => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers,
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

    // Update user avatar
    updateUserAvatar: async (imageUri: string, token: string, platform: 'web' | 'mobile' = 'mobile'): Promise<{ success: boolean; data: { avatarUrl: string; user: UserInfo } }> => {
        const formData = new FormData();

        try {
            // Both web and mobile - convert URI to blob
            const response = await fetch(imageUri);
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            const blob = await response.blob();
            const filename = imageUri.split('/').pop() || 'avatar.jpg';
            const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
            formData.append('avatar', file);
        } catch (error) {
            console.error('Error processing image:', error);
            throw new Error('Không thể xử lý tệp ảnh');
        }

        const uploadResponse = await fetch(`${API_BASE_URL}/users/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.message || 'Cập nhật ảnh đại diện thất bại');
        }

        return uploadResponse.json();
    },

    // Update total spent
    updateTotalSpent: async (totalSpent: number, token: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/users/total-spent`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ totalSpent }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật tổng chi tiêu thất bại');
        }

        return response.json();
    }
};