// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.0.176.156:3001/api';

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    role?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

// 1. Thêm interface cho dữ liệu đặt lại mật khẩu
export interface ResetPasswordData {
    email: string;
    password: string;
    otp?: string; // Tùy backend, có thể cần gửi kèm OTP để xác thực lần cuối
}

export interface AuthResponse {
    message: string;
    user: {
        id: string;
        email: string;
        username: string;
        role: string;
        createdAt: string;
    };
    token: string;
}

export const authService = {
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đăng ký thất bại');
        }

        return response.json();
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.message || 'Đăng nhập thất bại');
            // Attach additional error info for handling
            (error as any).requiresVerification = errorData.requiresVerification;
            throw error;
        }

        return response.json();
    },

    getMe: async (token: string) => {
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

    sendOtp: async (email: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gửi OTP thất bại');
        }
        return response.json();
    },

    verifyOtp: async (email: string, otp: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Xác thực OTP thất bại');
        }
        return response.json();
    },

    resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đặt lại mật khẩu thất bại');
        }

        return response.json();
    },
};