// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.0.3.40:3001/api';

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
  storeId?: string;
}

export const categoryService = {
  createCategory: async (formData: FormData, token: string, retries = 2): Promise<{ success: boolean; data: Category }> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Attempt ${attempt} - Sending request to: ${API_BASE_URL}/categories`);
        console.log("Token:", token);
        console.log("FormData sent:", {
          mainCategory: formData.get("mainCategory"),
          subCategory: formData.get("subCategory"),
          image: formData.get("image"),
        });

        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (!response.ok) {
          throw new Error(data.message || `Tạo danh mục thất bại: ${response.status}`);
        }

        return data;
      } catch (error: any) {
        console.error(`Attempt ${attempt} - Create category error:`, error.message);
        if (attempt === retries) {
          throw new Error(error.message || 'Không thể kết nối đến server.');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Không thể kết nối đến server sau nhiều lần thử');
  },

  getAllCategories: async (token: string): Promise<{ success: boolean; data: Category[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Status:', response.status, response.ok);
      const text = await response.text(); // đọc raw text
      let data;
      try {
        data = JSON.parse(text); // parse JSON nếu hợp lệ
        console.log('Parsed JSON:', data);
      } catch {
        console.error('Response is not JSON:', text);
        throw new Error('Response from server is not JSON');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Lấy danh sách danh mục thất bại');
      }

      return data;
    } catch (error: any) {
      console.error('Get categories error:', error.message);
      throw new Error(error.message || 'Không thể kết nối đến server');
    }
  },

  deleteCategory: async (id: number, token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Delete category response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Xóa danh mục thất bại');
      }

      return data;
    } catch (error: any) {
      console.error('Delete category error:', error.message);
      throw new Error(error.message || 'Không thể kết nối đến server');
    }
  },
};