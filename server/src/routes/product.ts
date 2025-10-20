import express from "express";
import {
    createProduct,
    deleteProduct,
    getProductsByStore,
    updateProduct,
    uploadImages,
} from "../controllers/productController";

const router = express.Router();

router.post("/", uploadImages, createProduct);

router.get("/store/:storeId", getProductsByStore);

router.put("/:id", uploadImages, updateProduct);

router.delete("/:id", deleteProduct);

export default router;
