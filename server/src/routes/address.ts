import express from 'express';
import { addressController } from '../controllers/addressController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Address routes
router.post('/', addressController.addAddress);                    // POST /api/addresses
router.get('/', addressController.getUserAddresses);               // GET /api/addresses
router.put('/:id', addressController.updateAddress);               // PUT /api/addresses/:id
router.delete('/:id', addressController.deleteAddress);            // DELETE /api/addresses/:id
router.put('/:id/default', addressController.setDefaultAddress);   // PUT /api/addresses/:id/default

export default router;