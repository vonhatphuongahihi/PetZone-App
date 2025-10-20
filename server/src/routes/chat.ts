import { Response, Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { listMessages, listUserConversations, saveMessage } from '../services/chatService';

const router = Router();

router.get('/conversations', authMiddleware as any, async (req: any, res: Response) => {
    const data = await listUserConversations(req.user.id);
    res.json(data);
});

router.get('/messages/:conversationId', authMiddleware as any, async (req: any, res: Response) => {
    const conversationId = Number(req.params.conversationId);
    const cursorId = req.query.cursorId ? Number(req.query.cursorId) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const data = await listMessages(conversationId, cursorId, limit);
    res.json(data);
});

export default router;

// Create message (for testing via REST)
router.post('/messages', authMiddleware as any, async (req: any, res: Response) => {
    try {
        const { conversationId, body } = req.body || {};
        if (!conversationId || !body || !String(body).trim()) {
            return res.status(400).json({ error: 'BadRequest', message: 'conversationId và body là bắt buộc' });
        }
        const saved = await saveMessage(Number(conversationId), req.user.id, String(body).trim());
        res.status(201).json(saved);
    } catch (e: any) {
        res.status(500).json({ error: 'Lỗi!', message: e?.message || 'Không thể tạo message' });
    }
});


