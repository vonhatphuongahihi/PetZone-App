import express from "express";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getHotProducts,
    getNewProducts,
    getProductById,
    getProductsByCategory,
    getProductsByStore,
    getTodayProducts,
    updateProduct,
    uploadImages,
} from "../controllers/productController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Áp dụng authentication middleware cho tất cả routes
router.use(authMiddleware);

router.get('/', getAllProducts);

router.get('/today', getTodayProducts);

router.get('/new', getNewProducts);

router.get('/hot', getHotProducts);

router.post("/", uploadImages, createProduct);

router.get('/category/:categoryId', getProductsByCategory);

router.get("/store/:storeId", getProductsByStore);

router.get("/:id", getProductById);

router.put("/:id", uploadImages, updateProduct);

router.delete("/:id", deleteProduct);

export default router;