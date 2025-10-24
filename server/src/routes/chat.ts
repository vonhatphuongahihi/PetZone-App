import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Tạo hoặc tìm conversation giữa 2 users
router.post('/conversations', authMiddleware as any, chatController.createOrFindConversation);

// Lấy danh sách conversations của user
router.get('/conversations', authMiddleware as any, chatController.getUserConversations);

// Lấy thông tin chi tiết của conversation
router.get('/conversations/:conversationId', authMiddleware as any, chatController.getConversationDetail);

// Lấy tin nhắn trong conversation
router.get('/messages/:conversationId', authMiddleware as any, chatController.getMessages);

// Đánh dấu tin nhắn đã đọc
router.patch('/conversations/:conversationId/read', authMiddleware as any, chatController.markAsRead);

// Tạo tin nhắn mới (for testing via REST)
router.post('/messages', authMiddleware as any, chatController.createMessage);

// Upload image và tạo tin nhắn
router.post('/upload-image', authMiddleware as any, chatController.uploadImage);

// Cập nhật theme conversation
router.patch('/conversations/:conversationId/theme', authMiddleware as any, chatController.updateConversationTheme);

// Xóa conversation
router.delete('/conversations/:conversationId', authMiddleware as any, chatController.deleteConversation);

export default router;


