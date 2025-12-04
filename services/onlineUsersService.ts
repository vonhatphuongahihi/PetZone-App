import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://192.168.1.162:3001/api';

let onlineUsersCache: string[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000;

export const getOnlineUsers = async (forceRefresh: boolean = false): Promise<string[]> => {
    try {
        const now = Date.now();

        if (!forceRefresh && now - lastFetchTime < CACHE_DURATION && onlineUsersCache.length >= 0) {
            return onlineUsersCache;
        }

        const token = await AsyncStorage.getItem('jwt_token');
        if (!token) {
            return [];
        }

        const response = await axios.get(`${API_BASE_URL}/chat/online-users`, {
            headers: { Authorization: `Bearer ${token}` }
        });


        if (response.data && Array.isArray(response.data.onlineUsers)) {
            onlineUsersCache = response.data.onlineUsers;
            lastFetchTime = now;
            return onlineUsersCache;
        }

        return [];
    } catch (error) {
        console.error('[onlineUsersService] Error fetching online users:', error);
        return onlineUsersCache;
    }
};

export const isUserOnline = async (userId: string): Promise<boolean> => {
    const onlineUsers = await getOnlineUsers();
    return onlineUsers.includes(userId);
};

export const clearOnlineUsersCache = () => {
    onlineUsersCache = [];
    lastFetchTime = 0;
};
