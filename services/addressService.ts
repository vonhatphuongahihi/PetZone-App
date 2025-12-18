// Address Service
// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.11.1.141:3001/api';

export interface UserAddress {
    id: string;
    userId: string;
    name: string;
    phoneNumber: string;
    province: string;
    street: string;
    type: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressData {
    name: string;
    phoneNumber: string;
    province: string;
    street: string;
    type?: string;
    isDefault?: boolean;
}

export interface UpdateAddressData {
    name?: string;
    phoneNumber?: string;
    province?: string;
    street?: string;
    type?: string;
    isDefault?: boolean;
}

export const addressService = {
    // Lấy danh sách địa chỉ
    getUserAddresses: async (token: string): Promise<{ success: boolean; data: UserAddress[] }> => {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy danh sách địa chỉ thất bại');
        }

        return response.json();
    },

    // Thêm địa chỉ mới
    addAddress: async (data: CreateAddressData, token: string): Promise<{ success: boolean; message: string; data: UserAddress }> => {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Thêm địa chỉ thất bại');
        }

        return response.json();
    },

    // Cập nhật địa chỉ
    updateAddress: async (id: string, data: UpdateAddressData, token: string): Promise<{ success: boolean; message: string; data: UserAddress }> => {
        const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật địa chỉ thất bại');
        }

        return response.json();
    },

    // Xóa địa chỉ
    deleteAddress: async (id: string, token: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Xóa địa chỉ thất bại');
        }

        return response.json();
    },

    // Đặt địa chỉ mặc định
    setDefaultAddress: async (id: string, token: string): Promise<{ success: boolean; message: string; data: UserAddress }> => {
        const response = await fetch(`${API_BASE_URL}/addresses/${id}/default`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đặt địa chỉ mặc định thất bại');
        }

        return response.json();
    },
};