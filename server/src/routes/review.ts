// import { Router } from 'express';
// import { createReview, getProductReviews, replyReview } from '../controllers/reviewController';
// import { authMiddleware } from '../middleware/auth';

// const router = Router();

// // --- CUSTOMER: tạo review (auth required) ---
// router.post('/', authMiddleware, createReview);

// // --- SELLER: trả lời review (auth required) ---
// router.post('/:reviewId/reply', authMiddleware, replyReview);

// // --- GET reviews của 1 sản phẩm (public) ---
// router.get('/product/:productId', getProductReviews);

// export default router;
