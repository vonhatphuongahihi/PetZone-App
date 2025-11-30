import express from 'express';
import { storeController } from '../controllers/storeController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = express.Router();

// Public endpoints - no auth required, but can accept optional auth
router.get('/top', optionalAuthMiddleware, storeController.getTopStores);

// All other routes require authentication
router.use(authMiddleware);

// Store management - MUST be before /:storeId to avoid route conflict
router.post('/create', storeController.createStore);
router.get('/my-store', storeController.getMyStore);
router.put('/update', storeController.updateStore);

// Seller Profile endpoints - MUST be before /:storeId to avoid route conflict
router.get('/profile', storeController.getSellerProfile);
router.put('/profile', storeController.updateSellerProfile);
router.get('/stats', storeController.getSellerStats);
router.get('/best-selling', storeController.getBestSellingProducts);

// Follow/Unfollow store endpoints - MUST be before /:storeId to avoid route conflict
router.get('/followed', storeController.getFollowedStores);
router.post('/follow/:storeId', storeController.followStore);
router.delete('/follow/:storeId', storeController.unfollowStore);
router.get('/follow/:storeId/status', storeController.checkFollowStatus);

// Public endpoint - must be LAST to avoid conflicts with specific routes
router.get('/:storeId', optionalAuthMiddleware, storeController.getStoreById);

export default router;
