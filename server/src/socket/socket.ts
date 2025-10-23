import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { markRead, saveMessage } from '../services/chatService';

type JwtPayload = { id: number; email?: string };

export function setupSocket(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            credentials: true
        }
    });

    io.use((socket, next) => {
        try {
            const raw = socket.handshake.headers['authorization'] as string | undefined;
            const authHeader = raw || (typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : undefined);
            let token: string | undefined;
            if (authHeader?.startsWith('Bearer ')) token = authHeader.slice('Bearer '.length);
            else if (typeof authHeader === 'string') token = authHeader;
            const secret = process.env.JWT_SECRET;
            if (!token || !secret) return next(new Error('Unauthorized'));
            const payload = jwt.verify(token, secret) as any;
            // @ts-ignore augment data (chấp nhận id hoặc userId)
            socket.data.userId = payload?.userId ?? payload?.id;
            next();
        } catch {
            next(new Error('Unauthorized'));
        }
    });

    // Track active users to prevent multiple connections
    const activeUsers = new Map<number, string>(); // userId -> socketId

    io.on('connection', (socket) => {
        const userId = socket.data.userId as number | undefined;
        if (!userId) {
            socket.disconnect(true);
            return;
        }

        // Disconnect ALL previous sockets for this user
        const allSockets = Array.from(io.sockets.sockets.values());
        const userOldSockets = allSockets.filter(s => 
            s.data.userId === userId && s.id !== socket.id
        );
        
        if (userOldSockets.length > 0) {
            console.log(`Found ${userOldSockets.length} old sockets for user ${userId}, disconnecting...`);
            userOldSockets.forEach(oldSocket => {
                oldSocket.disconnect(true);
            });
        }
        
        // Track this user's active socket
        activeUsers.set(userId, socket.id);
        console.log(`User ${userId} connected with socket ${socket.id}`);

        socket.on('join_conversation', (conversationId: number) => {
            if (!conversationId) return;
            console.log(`User ${userId} joining conversation ${conversationId}`);
            
            // Remove this user from this conversation room from any other sockets first
            const room = io.sockets.adapter.rooms.get(`conversation:${conversationId}`);
            if (room) {
                const userSocketsInRoom = Array.from(room).filter(socketId => {
                    const s = io.sockets.sockets.get(socketId);
                    return s && s.data.userId === userId && s.id !== socket.id;
                });
                
                if (userSocketsInRoom.length > 0) {
                    console.log(`Removing user ${userId} from ${userSocketsInRoom.length} old sockets in conversation ${conversationId}`);
                    userSocketsInRoom.forEach(socketId => {
                        const oldSocket = io.sockets.sockets.get(socketId);
                        if (oldSocket) {
                            oldSocket.leave(`conversation:${conversationId}`);
                        }
                    });
                }
            }
            
            // Always emit to existing users that this user joined (even if socket already in room)
            socket.to(`conversation:${conversationId}`).emit('peer_joined_conversation', { userId });
            
            // Check if this specific socket is already in room
            const alreadyInRoom = socket.rooms.has(`conversation:${conversationId}`);
            if (alreadyInRoom) {
                console.log(`Socket ${socket.id} already in conversation ${conversationId}, but still emitting presence`);
            } else {
                // Join the room if not already in
                socket.join(`conversation:${conversationId}`);
            }
            
            // Get unique users in this conversation room and emit their presence to this joining user
            const updatedRoom = io.sockets.adapter.rooms.get(`conversation:${conversationId}`);
            if (updatedRoom) {
                const uniqueUsers = new Set<number>();
                updatedRoom.forEach((socketId) => {
                    const otherSocket = io.sockets.sockets.get(socketId);
                    if (otherSocket && otherSocket.data.userId && otherSocket.data.userId !== userId) {
                        uniqueUsers.add(otherSocket.data.userId);
                    }
                });
                console.log(`Room conversation:${conversationId} has ${updatedRoom.size} sockets with ${uniqueUsers.size} unique users`);
                
                // Emit to this joining user that there are other users online
                uniqueUsers.forEach(otherUserId => {
                    socket.emit('peer_joined_conversation', { userId: otherUserId });
                });
            }
        });

        socket.on('leave_conversation', (conversationId: number) => {
            if (!conversationId) return;
            console.log(`User ${userId} leaving conversation ${conversationId}`);
            socket.leave(`conversation:${conversationId}`);
            // Emit to other users in the conversation that this user left
            socket.to(`conversation:${conversationId}`).emit('peer_left_conversation', { userId });
        });

        socket.on('user_online', (conversationId: number) => {
            if (!conversationId) return;
            // User explicitly sets themselves as online in this conversation
            socket.to(`conversation:${conversationId}`).emit('peer_joined_conversation', { userId });
        });

        socket.on('user_offline', (conversationId: number) => {
            if (!conversationId) return;
            // User explicitly sets themselves as offline in this conversation
            socket.to(`conversation:${conversationId}`).emit('peer_left_conversation', { userId });
        });

        socket.on('send_message', async (payload: { conversationId: number; body: string; imageUrl?: string }) => {
            try {
                if (!payload?.conversationId || (!payload?.body?.trim() && !payload?.imageUrl)) return;
                const { conversationId, body, imageUrl } = payload;
                if (!userId) return;
                const saved = await saveMessage(conversationId, String(userId), body?.trim() || '', imageUrl);
                io.to(`conversation:${conversationId}`).emit('message:new', saved);
            } catch (e) {
                socket.emit('message:error', { message: 'Không thể gửi tin nhắn' });
            }
        });

        socket.on('mark_read', async (conversationId: number) => {
            await markRead(conversationId, String(userId));
            io.to(`conversation:${conversationId}`).emit('message:read', {
                conversationId,
                userId,
                readAt: new Date().toISOString(),
                timestamp: Date.now()
            });
        });

        socket.on('typing', (conversationId: number) => {
            if (!conversationId) return;
            socket.to(`conversation:${conversationId}`).emit('typing', { userId });
        });

        socket.on('stop_typing', (conversationId: number) => {
            if (!conversationId) return;
            socket.to(`conversation:${conversationId}`).emit('stop_typing', { userId });
        });

        socket.on('theme_updated', (payload: { conversationId: number; theme: string }) => {
            if (!payload?.conversationId || !payload?.theme) return;
            const { conversationId, theme } = payload;
            // Broadcast theme update tới tất cả members trong conversation (trừ người gửi)
            socket.to(`conversation:${conversationId}`).emit('theme:updated', {
                conversationId,
                theme
            });
        });

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected`);
            // Remove user from active users map
            if (activeUsers.get(userId) === socket.id) {
                activeUsers.delete(userId);
            }
            // Emit offline cho tất cả phòng hội thoại mà socket này đang tham gia
            for (const room of socket.rooms) {
                if (room.startsWith('conversation:')) {
                    socket.to(room).emit('peer_left_conversation', { userId });
                }
            }
        });
    });

    return io;
}


