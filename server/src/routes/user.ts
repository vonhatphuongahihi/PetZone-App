import express from "express";
import { updateAvatar, uploadAvatar } from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.use(authMiddleware);

router.post("/avatar", uploadAvatar, updateAvatar);

export default router;
