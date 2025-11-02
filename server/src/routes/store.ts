import express from 'express';
import multer from 'multer';
import { storeController } from '../controllers/storeController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    dest: 'tmp/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh'));
        }
    }
});

router.use(authMiddleware);

// Store management
router.post('/create', storeController.createStore);
router.get('/my-store', storeController.getMyStore);
router.put('/update', storeController.updateStore);

// Seller Profile endpoints
router.get('/profile', storeController.getSellerProfile);
router.put('/profile', storeController.updateSellerProfile);
router.put('/profile/avatar', upload.single('avatar'), storeController.updateAvatar);
router.get('/stats', storeController.getSellerStats);

export default router;
