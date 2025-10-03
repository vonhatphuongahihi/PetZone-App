import express from 'express';
import { storeController } from '../controllers/storeController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/create', storeController.createStore);
router.get('/my-store', storeController.getMyStore);
router.put('/update', storeController.updateStore);

export default router;
