import { Router } from "express";
import multer from "multer";
import {
    addCategory,
    deleteCategory,
    getAllCategories,
} from "../controllers/categoryController";

const router = Router();

const upload = multer({ dest: "tmp/" });

router.post("/", upload.single("image"), addCategory);

router.get("/", getAllCategories);

router.delete("/:id", deleteCategory);

export default router;
