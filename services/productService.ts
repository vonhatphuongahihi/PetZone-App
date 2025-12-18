import { ReactNode } from "react";

// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://172.16.0.132:3001/api';

export interface ProductImage {
    id: number;
    productId: number;
    url: string;
    alt?: string;
    position?: number;
    createdAt: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Store {
    storeName: string;
    userId?: string;
    avatarUrl?: string;
    user?: {
        avatarUrl?: string;
    };
}

export interface Product {
    remainingQuantity: ReactNode;
    sold: ReactNode;
    id: number;
    storeId: string;
    categoryId?: number;
    title: string;
    slug: string;
    description?: string;
    price: number;
    oldPrice?: number;
    status: string;
    featured: boolean;
    quantity: number;
    soldCount?: number;
    tag?: string;
    avgRating: number;
    totalReviews: number;
    createdAt: string;
    updatedAt: string;
    images: ProductImage[];
    category?: Category;
    store?: Store;
}

export interface StoreDetail {
    id: string;
    userId: string;
    storeName: string;
    rating: number | string;
    totalProducts: number;
    totalReviews: number;
    followersCount: number;
    user?: {
        avatarUrl?: string;
    };
}

export interface ProductDetail {
    id: number;
    storeId: string;
    categoryId?: number;
    title: string;
    slug: string;
    description?: string;
    price: number;
    oldPrice?: number;
    status: string;
    featured: boolean;
    quantity: number;
    soldCount?: number;
    tag?: string;
    avgRating: number;
    totalReviews: number;
    createdAt: string;
    updatedAt: string;
    images: ProductImage[];
    category?: Category;
    store?: StoreDetail;
}

export interface CreateProductData {
    storeId: string;
    categoryId?: number;
    title: string;
    description?: string;
    price: number;
    oldPrice?: number;
    images?: File[];
}

export interface UpdateProductData {
    storeId?: string;
    categoryId?: number;
    title?: string;
    description?: string;
    price?: number;
    oldPrice?: number;
    images?: File[];
}

export const productService = {
    createProduct: async (data: CreateProductData, token: string): Promise<{ success: boolean; data: Product }> => {
        const formData = new FormData();
        formData.append('storeId', data.storeId);
        if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('price', data.price.toString());
        if (data.oldPrice) formData.append('oldPrice', data.oldPrice.toString());

        if (data.images && data.images.length > 0) {
            data.images.forEach((image, index) => {
                formData.append('images', image);
            });
        }

        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Tạo sản phẩm thất bại');
        }

        return response.json();
    },

    getProductsByStore: async (storeId: string, token: string): Promise<{ success: boolean; data: Product[] }> => {
        const response = await fetch(`${API_BASE_URL}/products/store/${storeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy danh sách sản phẩm thất bại');
        }

        return response.json();
    },

    getProductsByCategory: async (categoryId: number, token: string): Promise<{ success: boolean; data: Product[] }> => {
        const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy danh sách sản phẩm theo danh mục thất bại');
        }

        return response.json();
    },

    getProductById: async (id: number, token: string): Promise<{ success: boolean; data: ProductDetail }> => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy thông tin sản phẩm thất bại');
        }

        return response.json();
    },

    updateProduct: async (id: number, data: UpdateProductData, token: string): Promise<{ success: boolean; data: Product }> => {
        const formData = new FormData();
        if (data.storeId) formData.append('storeId', data.storeId);
        if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
        if (data.title) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.price) formData.append('price', data.price.toString());
        if (data.oldPrice !== undefined) formData.append('oldPrice', data.oldPrice.toString());

        if (data.images && data.images.length > 0) {
            data.images.forEach((image, index) => {
                formData.append('images', image);
            });
        }

        const response = await fetch(`${API_BASE_URL}/product/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật sản phẩm thất bại');
        }

        return response.json();
    },

    deleteProduct: async (id: number, token: string) => {
        console.log("Preparing to delete product");
        console.log("Product ID:", id);
        console.log("Token:", token);

        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log("Response status:", response.status);

            const text = await response.text();
            console.log("Response text:", text);

            if (response.ok || response.status === 204) {
                console.log("Delete success");
                return { success: true };
            }

            throw new Error(text || "Delete failed");
        } catch (err) {
            console.error("DeleteProduct error:", err);
            throw err;
        }
    },
    // --- LẤY SẢN PHẨM TRONG NGÀY ---
    getTodayProducts: async (token: string, limit?: number): Promise<{ success: boolean; data: Product[] }> => {
        const url = limit ? `${API_BASE_URL}/products/today?limit=${limit}` : `${API_BASE_URL}/products/today`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể tải sản phẩm hôm nay');
        }

        return response.json();
    },

    // --- LẤY SẢN PHẨM MỚI ---
    getNewProducts: async (token: string): Promise<{ success: boolean; data: Product[] }> => {
        const response = await fetch(`${API_BASE_URL}/products/new`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể tải sản phẩm mới');
        }

        return response.json();
    },

    // --- LẤY SẢN PHẨM HOT ---
    getHotProducts: async (token: string): Promise<{ success: boolean; data: Product[] }> => {
        const response = await fetch(`${API_BASE_URL}/products/hot`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể tải sản phẩm hot');
        }

        return response.json();
    },

    updateStock: async (id: number, newStock: number, token: string): Promise<{ success: boolean; data: Product }> => {
        const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock: newStock }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật stock thất bại');
        }

        return response.json();
    },

};