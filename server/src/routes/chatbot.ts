import express from 'express';
import { chatWithBot, getChatbotHistory } from '../controllers/chatbotController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Chat với chatbot
router.post('/chat', chatWithBot);

// Lấy lịch sử chat
router.get('/history', getChatbotHistory);

export default router;
