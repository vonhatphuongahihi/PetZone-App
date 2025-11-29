// src/controllers/productController.ts
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import cloudinary from "../config/cloudinary";

const prisma = new PrismaClient();

// Multer lưu tạm file
const upload = multer({ dest: "tmp/" });

// Hàm hỗ trợ: Tạo folder Cloudinary
const getCloudinaryFolder = (storeId: string) => `products/${storeId}`;

// === CREATE PRODUCT ===
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { storeId, categoryId, title, description, price, oldPrice, quantity } = req.body;
    const files = req.files as Express.Multer.File[];
    const imageUrls: { url: string; alt: string | null }[] = [];

    if (!storeId || !title || !price || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Thiếu: storeId, title, price, quantity.",
      });
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: getCloudinaryFolder(storeId),
          resource_type: "image",
        });
        imageUrls.push({ url: result.secure_url, alt: null });
        fs.unlinkSync(file.path);
      }
    }

    const product = await prisma.product.create({
      data: {
        storeId: String(storeId),
        categoryId: categoryId ? Number(categoryId) : null,
        title: title.trim(),
        slug: title.toLowerCase().trim().replace(/\s+/g, "-"),
        description: description?.trim() || null,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        quantity: Number(quantity),
        images: { create: imageUrls },
      },
      include: { images: true, category: true },
    });

    console.log("Created product:", product.id);
    return res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error("Error creating product:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === GET BY STORE ===
export const getProductsByStore = async (req: Request, res: Response) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId) return res.status(400).json({ success: false, message: "Thiếu storeId." });

    const products = await prisma.product.findMany({
      where: { storeId },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Error getProductsByStore:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === GET BY CATEGORY ===
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.categoryId);
    if (isNaN(categoryId)) return res.status(400).json({ success: false, message: "categoryId không hợp lệ." });

    const products = await prisma.product.findMany({
      where: { categoryId },
      include: {
        images: true,
        category: true,
        store: {
          select: {
            storeName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Error getProductsByCategory:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === UPDATE PRODUCT ===
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "ID không hợp lệ." });

    const { storeId, categoryId, title, description, price, oldPrice, quantity } = req.body;
    const files = req.files as Express.Multer.File[];
    const imageUrls: { url: string; alt: string | null }[] = [];

    if (files && files.length > 0 && storeId) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: getCloudinaryFolder(storeId),
        });
        imageUrls.push({ url: result.secure_url, alt: null });
        fs.unlinkSync(file.path);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: title?.trim() || undefined,
        description: description?.trim() || undefined,
        price: price ? Number(price) : undefined,
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        quantity: quantity ? Number(quantity) : undefined,
        storeId: storeId ? String(storeId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        images: imageUrls.length > 0 ? { deleteMany: {}, create: imageUrls } : undefined,
      },
      include: { images: true, category: true },
    });

    return res.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    console.error("Error updateProduct:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === DELETE PRODUCT ===
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "ID không hợp lệ." });

    // [THÊM] Lấy thông tin sản phẩm trước khi xóa để biết storeId
    const productToDelete = await prisma.product.findUnique({
      where: { id },
      select: { storeId: true }
    });

    if (!productToDelete) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại." });
    }

    const images = await prisma.productImage.findMany({ where: { productId: id } });

    for (const img of images) {
      const publicId = img.url.split("/").pop()?.split(".")[0];
      if (publicId) {
        const folder = img.url.split("/").slice(-2, -1)[0]; // Lấy storeId
        await cloudinary.uploader.destroy(`products/${folder}/${publicId}`);
      }
    }

    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return res.json({ success: true, message: "Xóa thành công." });
  } catch (error: any) {
    console.error("Error deleteProduct:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === GET BY ID ===
export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "ID không hợp lệ." });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        store: {
          select: {
            id: true,
            storeName: true,
            avatarUrl: true,
            rating: true,
            totalProducts: true,
            totalReviews: true,
            followersCount: true
          }
        }
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại." });
    }

    return res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Error getProductById:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === GET ALL ===
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Error getAllProducts:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === GET TODAY (3 NGÀY GẦN ĐÂY HOẶC GIẢM GIÁ) ===
export const getTodayProducts = async (req: Request, res: Response) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { createdAt: { gte: threeDaysAgo } },
          { oldPrice: { not: null } },
        ],
      },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return res.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Error getTodayProducts:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === GET NEW (7 NGÀY) ===
export const getNewProducts = async (req: Request, res: Response) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const products = await prisma.product.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return res.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Error getNewProducts:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === GET HOT (GIẢM GIÁ NHIỀU NHẤT) ===
export const getHotProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { oldPrice: { not: null } },
      include: { images: true, category: true },
      take: 50,
    });

    const sorted = products
      .filter(p => p.oldPrice !== null && p.oldPrice.toNumber() > p.price.toNumber())
      .map(p => ({
        ...p,
        discount: ((p.oldPrice!.toNumber() - p.price.toNumber()) / p.oldPrice!.toNumber()) * 100,
      }))
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 10)
      .map(({ discount, ...p }) => p);

    return res.json({ success: true, data: sorted });
  } catch (error: any) {
    console.error("Error getHotProducts:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// === MULTER MIDDLEWARE ===
export const uploadImages = upload.array("images", 10); // Tối đa 10 ảnh