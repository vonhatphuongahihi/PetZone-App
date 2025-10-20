import { API_BASE_URL } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
    if (socket && socket.connected) return socket;
    const token = await AsyncStorage.getItem('jwt_token');
    const base = (process.env.EXPO_PUBLIC_API_URL as string) || (API_BASE_URL?.replace(/\/api$/, ''));
    socket = io(base, {
        transports: ['websocket'],
        auth: token ? { token: `Bearer ${token}` } : undefined
    });
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}


