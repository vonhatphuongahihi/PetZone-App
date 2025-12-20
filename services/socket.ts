import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { SocketEventEmitter } from './socketEventEmitter';

// === IP của backend server ===
const SERVER_BASE_URL = 'http://10.10.3.71:3001';

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
    const base = SERVER_BASE_URL;

    console.log('[Socket Client] Connecting to:', base);

    socket = io(base, {
        transports: ['websocket'],
        auth: token ? { token: `Bearer ${token}` } : undefined
    });

    // Setup listeners - always setup to ensure they're active
    // Remove old listeners first if they exist
    if (listenersSetup && socket) {
        socket.removeAllListeners();
    }

    // Listen for global online/offline events
    socket.on('user_online', (data: { userId: string }) => {
        SocketEventEmitter.emit('user_online', data);
    });

    socket.on('user_offline', (data: { userId: string }) => {
        SocketEventEmitter.emit('user_offline', data);
    });

    socket.on('connect', () => {
        console.log('[Socket Client] Connected to server');
        if (socket) {
            console.log('[Socket Client] Socket ID:', socket.id);
        }
    });

    socket.on('disconnect', () => {
        console.log('[Socket Client] Disconnected from server');
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket Client] Connection error:', error.message);
        console.error('[Socket Client] Attempted to connect to:', base);
    });

    socket.on('error', (error) => {
        console.error('[Socket Client] Socket error:', error);
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

    // Listen for order notifications
    socket.on('order:new', (data: any) => {
        console.log('[Socket Client] Received order:new event:', data);
        SocketEventEmitter.emit('order:new', data);
    });

    socket.on('order:created', (data: any) => {
        SocketEventEmitter.emit('order:created', data);
    });

    socket.on('order:status_changed', (data: any) => {
        SocketEventEmitter.emit('order:status_changed', data);
    });

    socket.on('order:delivered', (data: any) => {
        console.log('[Socket Client] Received order:delivered event:', data);
        SocketEventEmitter.emit('order:delivered', data);
    });

    socket.on('order:cancelled', (data: any) => {
        SocketEventEmitter.emit('order:cancelled', data);
    });

    listenersSetup = true;

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        listenersSetup = false;
    }
}


