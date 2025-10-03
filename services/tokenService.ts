import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

export interface UserData {
    id: string;
    email: string;
    username: string;
    role: string;
    createdAt: string;
}

export const tokenService = {
    // Save token and user data
    saveAuthData: async (token: string, user: UserData): Promise<void> => {
        try {
            await AsyncStorage.multiSet([
                [TOKEN_KEY, token],
                [USER_KEY, JSON.stringify(user)]
            ]);
        } catch (error) {
            console.error('Error saving auth data:', error);
            throw new Error('Không thể lưu thông tin đăng nhập');
        }
    },

    // Get stored token
    getToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    // Get stored user data
    getUser: async (): Promise<UserData | null> => {
        try {
            const userData = await AsyncStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    // Clear all auth data
    clearAuthData: async (): Promise<void> => {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    },

    // Check if user is authenticated
    isAuthenticated: async (): Promise<boolean> => {
        try {
            const token = await tokenService.getToken();
            return token !== null;
        } catch (error) {
            return false;
        }
    }
};
