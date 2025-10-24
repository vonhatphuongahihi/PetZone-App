const API_BASE_URL = 'http://192.168.1.147:3001/api';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: number;
    createdAt: string;
    updatedAt: string;
    children?: Category[];
    parent?: Category;
}

// Interface này không còn cần thiết vì chúng ta sử dụng FormData trực tiếp

export const categoryService = {
    createCategory: async (formData: FormData, token: string): Promise<{ success: boolean; data: Category }> => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Tạo danh mục thất bại');
        }

        return response.json();
    },

    getAllCategories: async (token: string): Promise<{ success: boolean; data: Category[] }> => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lấy danh sách danh mục thất bại');
        }

        return response.json();
    },

    deleteCategory: async (id: number, token: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/category/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Xóa danh mục thất bại');
        }

        return response.json();
    },
};
