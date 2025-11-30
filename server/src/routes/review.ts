import express from 'express';
import { reviewController } from '../controllers/reviewController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tạo review
router.post('/', authMiddleware, reviewController.createReview);

// Lấy tất cả reviews của user
router.get('/user', authMiddleware, reviewController.getUserReviews);

// Lấy reviews của một sản phẩm
router.get('/product/:productId', reviewController.getProductReviews);

export default router;

