import { prisma } from '../db';

// Tạm thời cast để tránh lỗi type khi Prisma client chưa generate trên máy Windows
const db: any = prisma as any;

export async function findOrCreateOneToOneConversation(userAId: string, userBId: string) {
    // Tìm conversation có đủ 2 participants userA và userB
    const existing = await db.conversation.findFirst({
        where: {
            participants: {
                some: { userId: userAId }
            }
        },
        include: { participants: true }
    });

    if (existing) {
        const hasBoth = existing.participants.some((p: any) => p.userId === userAId) && existing.participants.some((p: any) => p.userId === userBId);
        if (hasBoth) return existing;
    }

    const conv = await db.conversation.create({ data: {} });
    await db.conversationParticipant.createMany({
        data: [
            { conversationId: conv.id, userId: userAId },
            { conversationId: conv.id, userId: userBId }
        ]
    });
    return conv;
}

export async function saveMessage(conversationId: number, senderId: string, body: string) {
    const message = await db.message.create({
        data: {
            conversationId,
            senderId,
            body
        }
    });
    await db.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });
    return message;
}

export async function listMessages(conversationId: number, cursorId?: number, limit = 20) {
    try {
        const where: any = { conversationId };
        if (cursorId) where.id = { lt: cursorId };
        const items = await db.message.findMany({
            where,
            orderBy: { id: 'desc' },
            take: limit
        });
        const nextCursor = items.length === limit ? items[items.length - 1].id : null;
        return { items: items.reverse(), nextCursor };
    } catch (error: any) {
        console.error('listMessages error:', error);
        let msg = 'Failed to list messages';
        try {
            if (typeof error === 'string') msg = error;
            else if (error && typeof error === 'object' && 'message' in error) msg = (error as any).message || msg;
        } catch { }
        throw new Error(msg);
    }
}

export async function listUserConversations(userId: string) {
    return db.conversation.findMany({
        where: { participants: { some: { userId } } },
        orderBy: { updatedAt: 'desc' },
        include: {
            participants: { include: { user: true } },
            messages: { orderBy: { id: 'desc' }, take: 1 }
        }
    });
}

export async function markRead(conversationId: number, userId: string) {
    await db.conversationParticipant.updateMany({
        where: { conversationId, userId },
        data: { lastReadAt: new Date() }
    });
    await db.message.updateMany({
        where: { conversationId, readAt: null, NOT: { senderId: userId } },
        data: { readAt: new Date() }
    });
}


