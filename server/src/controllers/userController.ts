import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import cloudinary from "../config/cloudinary";

const prisma = new PrismaClient();

// Multer lưu file tạm thời
const upload = multer({ dest: "tmp/" });

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không có file được tải lên." });
    }

    // Tải ảnh lên Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      public_id: `avatar_user_${userId}`,
      overwrite: true,
      transformation: [
        { width: 300, height: 300, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" }
      ]
    });

    // Xóa file tạm thời
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Cập nhật URL avatar trong cơ sở dữ liệu
    const updatedUser = await prisma.user.update({
      where: { id: String(userId) },
      data: { avatarUrl: result.secure_url },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true
      }
    });

    console.log("Avatar updated for user:", userId);
    return res.json({ 
      success: true, 
      message: "Cập nhật ảnh đại diện thành công.",
      data: {
        avatarUrl: result.secure_url,
        user: updatedUser
      }
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi cập nhật ảnh đại diện." });
  }
};

export const uploadAvatar = upload.single("avatar");

export const updateTotalSpent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
    }

    const { totalSpent } = req.body;
    if (totalSpent === undefined || totalSpent === null) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin totalSpent." });
    }

    // Cập nhật totalSpent trong cơ sở dữ liệu
    const updatedUser = await prisma.user.update({
      where: { id: String(userId) },
      data: { totalSpent: Math.round(totalSpent) },
      select: {
        id: true,
        username: true,
        email: true,
        totalSpent: true
      }
    });

    console.log("Total spent updated for user:", userId, "Amount:", totalSpent);
    return res.json({ 
      success: true, 
      message: "Cập nhật tổng chi tiêu thành công.",
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating total spent:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi cập nhật tổng chi tiêu." });
  }
};