import { Router } from "express";
import multer from "multer";
import {
    addCategory,
    deleteCategory,
    getAllCategories,
} from "../controllers/categoryController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const upload = multer({ dest: "tmp/" });

// Áp dụng authentication middleware cho tất cả routes
router.use(authMiddleware);

router.post("/", upload.single("image"), addCategory);

router.get("/", getAllCategories);

router.delete("/:id", deleteCategory);

export default router;
