import express from "express";
import {
    createProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    getProductsByStore,
    updateProduct,
    uploadImages,
} from "../controllers/productController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Áp dụng authentication middleware cho tất cả routes
router.use(authMiddleware);

router.post("/", uploadImages, createProduct);

router.get("/store/:storeId", getProductsByStore);

router.get("/category/:categoryId", getProductsByCategory);

router.get("/:id", getProductById);

router.put("/:id", uploadImages, updateProduct);

router.delete("/:id", deleteProduct);

export default router;
