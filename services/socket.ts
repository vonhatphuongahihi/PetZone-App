import { API_BASE_URL } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let listenersSetup = false;

export async function getSocket(): Promise<Socket> {
    // Only reconnect if socket doesn't exist or is disconnected
    if (socket && socket.connected) {
        return socket;
    }

    // Disconnect existing socket if it exists but is not connected
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    const token = await AsyncStorage.getItem('jwt_token');
    const base = (process.env.EXPO_PUBLIC_API_URL as string) || (API_BASE_URL?.replace(/\/api$/, ''));


    socket = io(base, {
        transports: ['websocket'],
        auth: token ? { token: `Bearer ${token}` } : undefined
    });

    // Setup listeners only once to avoid duplicates
    if (!listenersSetup) {

        // Listen for global online/offline events
        socket.on('user_online', (data: { userId: string }) => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('user_online', { detail: data }));
            }
        });

        socket.on('user_offline', (data: { userId: string }) => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('user_offline', { detail: data }));
            }
        });

        socket.on('connect', () => {
            console.log('[Socket Client] Connected to server');
        });

        socket.on('disconnect', () => {
            console.log('[Socket Client] Disconnected from server');
        });

        // Listen for unread conversation notifications
        socket.on('conversation:unread', (data: any) => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('conversation:unread', { detail: data }));
            }
        });

        // Listen for conversation read events
        socket.on('conversation:read', (data: any) => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('conversation:read', { detail: data }));
            }
        });

        // Listen for typing events
        socket.on('typing', (data: any) => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('conversation:typing', { detail: data }));
            }
        });

        socket.on('stop_typing', (data: any) => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('conversation:stop_typing', { detail: data }));
            }
        });

        listenersSetup = true;
    }

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        listenersSetup = false;
    }
}


