import express from 'express';
import { authController } from '../controllers/authController';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

export default router;
