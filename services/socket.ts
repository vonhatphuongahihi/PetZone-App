import { API_BASE_URL } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { SocketEventEmitter } from './socketEventEmitter';

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
            SocketEventEmitter.emit('user_online', data);
        });

        socket.on('user_offline', (data: { userId: string }) => {
            SocketEventEmitter.emit('user_offline', data);
        });

        socket.on('connect', () => {
            console.log('[Socket Client] Connected to server');
        });

        socket.on('disconnect', () => {
            console.log('[Socket Client] Disconnected from server');
        });

        // Listen for unread conversation notifications
        socket.on('conversation:unread', (data: any) => {
            SocketEventEmitter.emit('conversation:unread', data);
        });

        // Listen for conversation read events
        socket.on('conversation:read', (data: any) => {
            SocketEventEmitter.emit('conversation:read', data);
        });

        // Listen for typing events
        socket.on('typing', (data: any) => {
            SocketEventEmitter.emit('conversation:typing', data);
        });

        socket.on('stop_typing', (data: any) => {
            SocketEventEmitter.emit('conversation:stop_typing', data);
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


