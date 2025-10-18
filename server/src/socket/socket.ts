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

    io.on('connection', (socket) => {
        const userId = socket.data.userId as number | undefined;
        if (!userId) {
            socket.disconnect(true);
            return;
        }

        socket.on('join_conversation', (conversationId: number) => {
            if (!conversationId) return;
            socket.join(`conversation:${conversationId}`);
            socket.to(`conversation:${conversationId}`).emit('presence:online', { userId });
        });

        socket.on('leave_conversation', (conversationId: number) => {
            if (!conversationId) return;
            socket.leave(`conversation:${conversationId}`);
            socket.to(`conversation:${conversationId}`).emit('presence:offline', { userId });
        });

        socket.on('send_message', async (payload: { conversationId: number; body: string }) => {
            try {
                if (!payload?.conversationId || !payload?.body?.trim()) return;
                const { conversationId, body } = payload;
                if (!userId) return;
                const saved = await saveMessage(conversationId, String(userId), body.trim());
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
                readAt: new Date().toISOString()
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

        socket.on('disconnect', () => {
            // phát offline cho tất cả phòng hội thoại mà socket này đang tham gia
            for (const room of socket.rooms) {
                if (room.startsWith('conversation:')) {
                    socket.to(room).emit('presence:offline', { userId });
                }
            }
        });
    });

    return io;
}


