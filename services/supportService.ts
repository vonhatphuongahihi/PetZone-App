// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.20.3.212:3001/api';

export interface SupportRequest {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const supportService = {
    // Gửi yêu cầu hỗ trợ
    submitSupport: async (data: SupportRequest): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gửi yêu cầu hỗ trợ thất bại');
        }

        return response.json();
    },
};