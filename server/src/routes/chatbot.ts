import express from 'express';
import { chatWithBot, deleteChatbotHistory, getChatbotHistory } from '../controllers/chatbotController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Chat với chatbot
router.post('/chat', chatWithBot);

// Lấy lịch sử chat
router.get('/history', getChatbotHistory);

// Xóa lịch sử chat
router.delete('/history', deleteChatbotHistory);

export default router;
