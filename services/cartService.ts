// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.20.3.212:3001/api';

export interface CartItem {
    id: string;
    userId: string;
    productId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    product: {
        id: number;
        title: string;
        price: number;
        oldPrice?: number;
        images: Array<{ url: string }>;
        store: {
            id: string;
            storeName: string;
            avatarUrl?: string;
        };
        category?: {
            id: number;
            name: string;
        };
    };
}

export const cartService = {
    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (token: string, productId: number, quantity: number = 1) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Cart API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                });
                throw new Error(data.message || 'Thêm vào giỏ hàng thất bại');
            }

            return data;
        } catch (error: any) {
            console.error('Cart service error:', error);
            throw error;
        }
    },

    // Lấy giỏ hàng
    getCart: async (token: string): Promise<{ success: boolean; data: CartItem[] }> => {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy giỏ hàng thất bại');
        }

        return response.json();
    },

    // Cập nhật số lượng
    updateQuantity: async (token: string, cartItemId: string, quantity: number) => {
        const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/quantity`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật số lượng thất bại');
        }

        return response.json();
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeItem: async (token: string, cartItemId: string) => {
        const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Xóa khỏi giỏ hàng thất bại');
        }

        return response.json();
    },
};

