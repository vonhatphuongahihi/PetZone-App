import { API_BASE_URL } from '../config/api';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

export interface Product {
    id: string;
    title: string;
    price: number;
    description?: string;
    imageUrl?: string;
    category?: string;
    storeName?: string;
}

export interface ChatbotResponse {
    message: string;
    products: Product[];
    conversationHistory: ChatMessage[];
}

export const chatbotService = {
    // Chat với chatbot
    chat: async (message: string, conversationHistory: ChatMessage[] = [], token: string): Promise<ChatbotResponse> => {
        const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                message,
                conversationHistory,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể kết nối với chatbot');
        }

        const data = await response.json();
        return data.data;
    },

    // Lấy lịch sử chat
    getHistory: async (token: string): Promise<ChatMessage[]> => {
        const response = await fetch(`${API_BASE_URL}/chatbot/history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể lấy lịch sử chat');
        }

        const data = await response.json();
        return data.data || [];
    },

    // Xóa lịch sử chat
    deleteHistory: async (token: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/chatbot/history`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể xóa lịch sử chat');
        }
    },
};
