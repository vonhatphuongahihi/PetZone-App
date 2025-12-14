// Review Service
import { API_BASE_URL } from '../config/api';

export interface CreateReviewData {
    productId: number;
    orderId?: string;
    rating: number;
    content?: string;
    images?: string[];
}

export interface Review {
    id: string;
    userId: string;
    productId: number;
    orderId: string | null;
    rating: number;
    content: string | null;
    images: string[];
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
    product?: {
        id: number;
        title: string;
        images?: Array<{ url: string }>;
        store?: {
            id: string;
            storeName: string;
        };
    };
    order?: {
        id: string;
        orderNumber: string;
        createdAt: string;
    };
    sellerReply?: string | null;
    replyAt?: string | null;
}

export const reviewService = {
    // Tạo review
    createReview: async (data: CreateReviewData, token: string): Promise<{ success: boolean; message: string; data: Review }> => {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Tạo đánh giá thất bại');
        }

        return response.json();
    },

    // Lấy tất cả reviews của user
    getUserReviews: async (token: string): Promise<{ success: boolean; data: Review[] }> => {
        const response = await fetch(`${API_BASE_URL}/reviews/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy danh sách đánh giá thất bại');
        }

        return response.json();
    },

    // Lấy reviews của một sản phẩm
    getProductReviews: async (productId: number): Promise<{ success: boolean; data: Review[] }> => {
        const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy đánh giá sản phẩm thất bại');
        }

        return response.json();
    },

    // Trả lời đánh giá 
    replyReview: async (reviewId: string | number, reply: string, token: string): Promise<{ success: true; data: Review }> => {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reply }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gửi phản hồi thất bại');
        }

        return response.json();
    },
};

