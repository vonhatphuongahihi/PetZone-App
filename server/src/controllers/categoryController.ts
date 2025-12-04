import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import { Request, Response, Router } from "express";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import multer from "multer";
import "../config/cloudinary";

const prisma = new PrismaClient();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// CORS Middleware
const corsOptions = {
  origin: ['*', 'http://localhost:3001', 'http://192.168.1.162:3001'],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const addCategory = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        jwt.verify(token, process.env.JWT_SECRET || "your-secret");
        console.log("Token verified successfully");
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid token.",
        });
      }
    } else {
      console.log("No token provided, proceeding without auth");
    }

    const { mainCategory, subCategory } = req.body;
    const file = req.file;

    console.log("req.body:", req.body);
    console.log("req.file:", file || "No file received"); // [FIX] Corrected log statement

    if (!subCategory?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name is required.",
      });
    }

    if (!file?.path) {
      return res.status(400).json({
        success: false,
        message: "Category image is required.",
      });
    }

    let parentCategory = null;
    if (mainCategory?.trim()) {
      parentCategory = await prisma.category.findUnique({
        where: { name: mainCategory.trim() },
      });

      if (!parentCategory) {
        parentCategory = await prisma.category.create({
          data: {
            name: mainCategory.trim(),
            slug: mainCategory.toLowerCase().replace(/\s+/g, "-"),
          },
        });
        console.log("Created parent category:", parentCategory);
      }
    }

    let imageUrl = "";
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: `categories_${Date.now()}`,
        resource_type: "image",
      });
      imageUrl = uploadResult.secure_url;
      console.log("Cloudinary upload success:", uploadResult);
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({
        success: false,
        message: `Cloudinary upload failed: ${err.message || "Unknown error"}`,
      });
    } finally {
      try {
        await fs.unlink(file.path);
      } catch (unlinkErr) {
        console.warn("⚠️ Could not delete temp file:", unlinkErr);
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        name: subCategory.trim(),
        slug: subCategory.toLowerCase().replace(/\s+/g, "-"),
        image: imageUrl,
        parentId: parentCategory?.id || null,
      },
    });

    console.log("New category created:", newCategory);

    return res.status(201).json({
      success: true,
      message: "Subcategory added successfully.",
      data: newCategory,
    });
  } catch (error: any) {
    console.error("Add category error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding category.",
      error: error.message,
    });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
    });

    console.log("Categories fetched:", categories);

    return res.json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
    });
  } catch (error: any) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories.",
      error: error.message,
    });
  }
};

export const getChildCategories = async (req: Request, res: Response) => {
  try {
    const children = await prisma.category.findMany({
      where: { parentId: { not: null } },
      orderBy: { name: "asc" },
    });

    console.log("Child categories fetched:", children);
    console.log("Child categories count:", children.length);

    return res.json({
      success: true,
      message: "Subcategories fetched successfully.",
      data: children,
    });
  } catch (error: any) {
    console.error("Error fetching subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subcategories.",
      error: error.message || "Unknown error",
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    if (category.image) {
      const publicId = category.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`categories_${Date.now()}/${publicId}`);
        } catch (cloudErr) {
          console.warn("Could not delete Cloudinary image:", cloudErr);
        }
      }
    }

    await prisma.category.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting category.",
      error: error.message,
    });
  }
};

export const categoryRouter = Router();

categoryRouter.use(cors(corsOptions));
categoryRouter.post("/categories", upload.single("image"), addCategory);
categoryRouter.get("/categories", getAllCategories);
categoryRouter.get("/categories/child-categories", getChildCategories);
categoryRouter.delete("/categories/:id", deleteCategory);