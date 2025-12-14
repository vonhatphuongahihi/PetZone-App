// User Info Service
// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.10.3.142:3001/api';

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

        if (platform === 'web') {
            // Web platform - convert URI to File
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            formData.append('avatar', file);
        } else {
            // Mobile platform - create file object
            const filename = imageUri.split('/').pop() || 'avatar.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('avatar', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any);
        }

        const response = await fetch(`${API_BASE_URL}/users/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật ảnh đại diện thất bại');
        }

        return response.json();
    }
};