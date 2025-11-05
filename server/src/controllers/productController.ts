import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import cloudinary from "../config/cloudinary";

const prisma = new PrismaClient();

// Multer lưu file tạm thời
const upload = multer({ dest: "tmp/" });

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { storeId, categoryId, title, description, price, oldPrice, quantity } = req.body; // [THÊM] quantity
    const files = req.files as Express.Multer.File[];
    const imageUrls: { url: string; alt: string | null }[] = [];

    if (!storeId || !title || !price || !quantity) { // [SỬA] Thêm kiểm tra quantity
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: storeId, title, price, quantity.",
      });
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `products/${storeId}`,
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
        description: description || null,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        quantity: Number(quantity), // [THÊM] Lưu quantity
        images: { create: imageUrls },
      },
      include: { images: true, category: true },
    });

    console.log("Created product:", product); // [THÊM] Log để debug

    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi tạo sản phẩm." });
  }
};

export const getProductsByStore = async (req: Request, res: Response) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId) {
      return res.status(400).json({ success: false, message: "Thiếu storeId trong URL." });
    }

    const products = await prisma.product.findMany({
      where: { storeId },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
    });

    console.log("Products fetched for store:", storeId, "Count:", products.length); // [THÊM] Log để debug

    return res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách sản phẩm." });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => { // [THÊM] Hàm mới
  try {
    const categoryId = Number(req.params.categoryId);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: "ID danh mục không hợp lệ." });
    }

    const products = await prisma.product.findMany({
      where: { categoryId },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
    });

    console.log("Products fetched for category:", categoryId, "Count:", products.length);

    return res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách sản phẩm theo danh mục." });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ." });
    }

    const { storeId, categoryId, title, description, price, oldPrice, quantity } = req.body; // [THÊM] quantity
    const files = req.files as Express.Multer.File[];
    const imageUrls: { url: string; alt: string | null }[] = [];

    if (files && files.length > 0 && storeId) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `products/${storeId}`,
        });
        imageUrls.push({ url: result.secure_url, alt: null });
        fs.unlinkSync(file.path);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: title?.trim(),
        description,
        price: price ? Number(price) : undefined,
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        quantity: quantity ? Number(quantity) : undefined, // [THÊM] Cập nhật quantity
        storeId: storeId ? String(storeId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        images: imageUrls.length > 0
          ? { deleteMany: {}, create: imageUrls }
          : undefined,
      },
      include: { images: true, category: true },
    });

    console.log("Updated product:", updatedProduct); // [THÊM] Log để debug

    return res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi cập nhật sản phẩm." });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ." });
    }

    const images = await prisma.productImage.findMany({ where: { productId: id } });

    for (const img of images) {
      const publicId = img.url.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }
    }

    await prisma.productImage.deleteMany({ where: { productId: id } });

    await prisma.product.delete({ where: { id } });

    console.log("Deleted product:", id); // [THÊM] Log để debug

    return res.json({ success: true, message: "Xóa sản phẩm thành công." });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi xóa sản phẩm." });
  }
};

export const uploadImages = upload.array("images", 10); // tối đa 10 file