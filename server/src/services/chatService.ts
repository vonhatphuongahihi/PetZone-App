import { prisma } from '../db';

// Tạm thời cast để tránh lỗi type khi Prisma client chưa generate trên máy Windows
const db: any = prisma as any;

export async function findOrCreateOneToOneConversation(userAId: string, userBId: string) {
    // Tìm conversation có đúng 2 participants: userA và userB
    const existing = await db.conversation.findFirst({
        where: {
            participants: {
                every: {
                    userId: {
                        in: [userAId, userBId]
                    }
                }
            }
        },
        include: { 
            participants: true,
            _count: {
                select: { participants: true }
            }
        }
    });

    // Kiểm tra xem conversation có đúng 2 participants và đúng 2 users cần tìm không
    if (existing && existing._count.participants === 2) {
        const participantIds = existing.participants.map((p: any) => p.userId);
        if (participantIds.includes(userAId) && participantIds.includes(userBId)) {
            return existing;
        }
    }

    // Tạo conversation mới nếu chưa có
    const conv = await db.conversation.create({ 
        data: {},
        include: { participants: true }
    });
    
    await db.conversationParticipant.createMany({
        data: [
            { conversationId: conv.id, userId: userAId },
            { conversationId: conv.id, userId: userBId }
        ]
    });

    // Trả về conversation với participants
    return await db.conversation.findUnique({
        where: { id: conv.id },
        include: { participants: true }
    });
}

export async function saveMessage(conversationId: number, senderId: string, body: string, imageUrl?: string) {
    const message = await db.message.create({
        data: {
            conversationId,
            senderId,
            body,
            imageUrl
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