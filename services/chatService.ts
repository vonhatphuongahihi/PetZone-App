// Chat Service for Frontend
const API_BASE_URL = 'http://10.0.180.200:3001/api';

export interface User {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
}

export interface ConversationParticipant {
    id: number;
    conversationId: number;
    userId: string;
    lastReadAt?: string;
    user: User;
}

export interface Message {
    id: number;
    conversationId: number;
    senderId: string;
    body: string;
    imageUrl?: string;
    readAt?: string | null;
    createdAt: string;
    sender?: User;
}

export interface Conversation {
    id: number;
    createdAt: string;
    updatedAt?: string;
    theme?: string;
    participants: ConversationParticipant[];
    messages?: Message[];
}

export interface CreateConversationData {
    otherUserId: string;
}

export interface CreateMessageData {
    conversationId: number;
    body: string;
}

export interface MessagesResponse {
    items: Message[];
    nextCursor?: number;
}

export const chatService = {
    // Tìm user trong các conversations
    searchUser: async (query: string, token: string): Promise<User[]> => {
        const response = await fetch(`${API_BASE_URL}/chat/users/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể tìm kiếm user');
        }

        return response.json();
    },

    // Upload image và gửi tin nhắn
    uploadImageAndSendMessage: async (imageUri: string, conversationId: number, token: string): Promise<{ imageUrl: string }> => {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'image.jpg',
        } as any);
        formData.append('conversationId', String(conversationId));

        const response = await fetch(`${API_BASE_URL}/chat/upload-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        return response.json();
    },

    // Cập nhật theme conversation
    updateConversationTheme: async (conversationId: number, theme: string, token: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/theme`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ theme }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể thay đổi màu chat');
        }
    },

    // Xóa conversation
    deleteConversation: async (conversationId: number, token: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể xóa đoạn chat');
        }
    },

    // Tạo hoặc tìm conversation giữa 2 users
    createOrFindConversation: async (data: CreateConversationData, token: string): Promise<Conversation> => {
        const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể tạo conversation');
        }

        return response.json();
    },

    // Lấy danh sách conversations của user
    getUserConversations: async (token: string): Promise<Conversation[]> => {
        const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể lấy danh sách conversation');
        }

        return response.json();
    },

    // Lấy thông tin chi tiết của conversation
    getConversationDetail: async (conversationId: number, token: string): Promise<Conversation> => {
        const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể lấy thông tin conversation');
        }

        return response.json();
    },

    // Lấy tin nhắn trong conversation
    getMessages: async (conversationId: number, token: string, cursorId?: number, limit: number = 20): Promise<MessagesResponse> => {
        let url = `${API_BASE_URL}/chat/messages/${conversationId}?limit=${limit}`;
        if (cursorId) {
            url += `&cursorId=${cursorId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể lấy tin nhắn');
        }

        return response.json();
    },

    // Đánh dấu tin nhắn đã đọc
    markAsRead: async (conversationId: number, token: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể đánh dấu đã đọc');
        }

        return response.json();
    },

    // Tạo tin nhắn mới
    createMessage: async (data: CreateMessageData, token: string): Promise<Message> => {
        const response = await fetch(`${API_BASE_URL}/chat/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể gửi tin nhắn');
        }

        return response.json();
    },
};
