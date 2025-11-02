import express from 'express';
import { authController } from '../controllers/authController';

const router = express.Router();

// Public routes (không cần authentication)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes (cần authentication)
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.put('/update-profile', authController.updateProfile);

export default router;
