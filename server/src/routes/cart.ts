import express from 'express';
import { cartController } from '../controllers/cartController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Thêm sản phẩm vào giỏ hàng
router.post('/', cartController.addToCart);

// Lấy giỏ hàng của user
router.get('/', cartController.getCart);

// Cập nhật số lượng
router.put('/:cartItemId/quantity', cartController.updateQuantity);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:cartItemId', cartController.removeItem);

export default router;

