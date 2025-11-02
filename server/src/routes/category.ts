import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
    addCategory,
    deleteCategory,
    getAllCategories,
    getChildCategories,
} from "../controllers/categoryController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Chỉ chấp nhận file ảnh (.jpg, .jpeg, .png, .webp)"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

router.use(authMiddleware);

router.post("/", upload.single("image"), addCategory);
router.get("/", getAllCategories);
router.get("/child-categories", getChildCategories);
router.delete("/:id", deleteCategory);

export default router;