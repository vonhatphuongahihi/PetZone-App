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
    searchProducts,
    updateProduct,
    uploadImages,
} from "../controllers/productController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// PUBLIC ROUTES 
router.get("/search", searchProducts);
router.get("/", getAllProducts);
router.get("/today", getTodayProducts);
router.get("/new", getNewProducts);
router.get("/hot", getHotProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/store/:storeId", getProductsByStore); 
router.get("/:id", getProductById);

// PRIVATE ROUTES 
router.use(authMiddleware); 

router.post("/", uploadImages, createProduct);
router.put("/:id", uploadImages, updateProduct);
router.delete("/:id", deleteProduct);

export default router;