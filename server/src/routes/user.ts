import express from "express";
import { updateAvatar, updateTotalSpent, uploadAvatar } from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.use(authMiddleware);

router.post("/avatar", uploadAvatar, updateAvatar);
router.put("/total-spent", updateTotalSpent);

export default router;
