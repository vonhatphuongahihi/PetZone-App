import express from 'express';
import { orderController } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tạo đơn hàng
router.post('/', authMiddleware, orderController.createOrder);

// Lấy danh sách đơn hàng của user
router.get('/', authMiddleware, orderController.getUserOrders);

// Lấy danh sách đơn hàng của store (cho seller)
router.get('/store', authMiddleware, orderController.getStoreOrders);

// Lấy chi tiết đơn hàng
router.get('/:id', authMiddleware, orderController.getOrderById);

// Cập nhật trạng thái đơn hàng
router.patch('/:id/status', authMiddleware, orderController.updateOrderStatus);

// Hủy đơn hàng
router.post('/:id/cancel', authMiddleware, orderController.cancelOrder);

export default router;

