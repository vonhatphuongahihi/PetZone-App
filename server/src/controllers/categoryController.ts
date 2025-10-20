import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import fs from "fs/promises";
import "../config/cloudinary";

const prisma = new PrismaClient();

/**
 * POST /api/categories
 * Body (multipart/form-data):
 *  - parentName (string, optional)
 *  - childName (string, required)
 *  - image (file, required)
 */
export const addCategory = async (req: Request, res: Response) => {
  try {
    const { parentName, childName } = req.body;
    const file = req.file;
    
    if (!childName?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Tên danh mục con không được để trống." });
    }

    if (!file?.path) {
      return res
        .status(400)
        .json({ success: false, message: "Ảnh danh mục là bắt buộc." });
    }

    let parentCategory = null;
    if (parentName?.trim()) {
      parentCategory = await prisma.category.findUnique({
        where: { name: parentName.trim() },
      });

      if (!parentCategory) {
        parentCategory = await prisma.category.create({
          data: {
            name: parentName.trim(),
            slug: parentName.toLowerCase().replace(/\s+/g, "-"),
          },
        });
      }
    }

    let imageUrl = "";
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "categories",
      });
      imageUrl = uploadResult.secure_url;
    } catch (err: any) {
      console.error("Lỗi upload Cloudinary:", err);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi khi upload ảnh danh mục." });
    } finally {
      try {
        await fs.unlink(file.path); 
      } catch (unlinkErr) {
        console.warn("⚠️ Không thể xóa file tạm:", unlinkErr);
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        name: childName.trim(),
        slug: childName.toLowerCase().replace(/\s+/g, "-"),
        image: imageUrl,
        parentId: parentCategory?.id || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Thêm danh mục con thành công.",
      data: newCategory,
    });
  } catch (error: any) {
    console.error("Add category error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm danh mục.",
      error: error.message,
    });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      message: "Lấy danh sách danh mục thành công.",
      data: categories,
    });
  } catch (error: any) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách danh mục.",
      error: error.message,
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID danh mục không hợp lệ." });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy danh mục." });
    }

    if (category.image) {
      const publicId = category.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`categories/${publicId}`);
        } catch (cloudErr) {
          console.warn("Không thể xóa ảnh Cloudinary:", cloudErr);
        }
      }
    }

    await prisma.category.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Xóa danh mục thành công.",
    });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa danh mục.",
      error: error.message,
    });
  }
};
