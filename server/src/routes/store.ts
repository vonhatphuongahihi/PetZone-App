import express from 'express';
import { storeController } from '../controllers/storeController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// Store management
router.post('/create', storeController.createStore);
router.get('/my-store', storeController.getMyStore);
router.put('/update', storeController.updateStore);

// Seller Profile endpoints
router.get('/profile', storeController.getSellerProfile);
router.put('/profile', storeController.updateSellerProfile);
router.get('/stats', storeController.getSellerStats);

export default router;
