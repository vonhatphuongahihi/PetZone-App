// import { PrismaClient } from '@prisma/client';
// import { Request, Response } from 'express';
// import { redis } from '../utils/redisClient';

// const prisma = new PrismaClient();

// // ===== CUSTOMER: tạo review =====
// export const createReview = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

//     const { productId, orderId, rating, content, images } = req.body;

//     const review = await prisma.reviews.create({
//       data: {
//         user_id: userId,
//         product_id: Number(productId),
//         order_id: orderId || null,
//         rating: Number(rating),
//         content,
//         images: images || [],
//         updated_at: new Date(),
//       },
//     });

//     res.json({ success: true, review });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ===== SELLER: trả lời review (lưu vào Redis) =====
// export const replyReview = async (req: Request, res: Response) => {
//   try {
//     const sellerId = req.user?.id;
//     if (!sellerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

//     const { reviewId } = req.params;
//     const { replyText } = req.body;

//     // Kiểm tra review tồn tại
//     const review = await prisma.reviews.findUnique({
//       where: { id: reviewId },
//       include: { products: true },
//     });
//     if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

//     // Kiểm tra sản phẩm thuộc seller
//     if ((review.products as any).storeId !== sellerId) {
//       return res.status(403).json({ success: false, message: 'Not allowed to reply this review' });
//     }

//     // Lưu reply vào Redis, key = reviewId
//     await redis.set(`review:reply:${reviewId}`, replyText);

//     res.json({ success: true, reviewId, replyText });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ===== GET reviews theo product (kèm reply từ Redis) =====
// export const getProductReviews = async (req: Request, res: Response) => {
//   try {
//     const { productId } = req.params;

//     const reviews = await prisma.reviews.findMany({
//       where: { product_id: Number(productId) },
//       include: { users: true },
//       orderBy: { created_at: 'desc' },
//     });

//     // Lấy reply từ Redis
//     const reviewsWithReplies = await Promise.all(
//       reviews.map(async r => {
//         const replyText = await redis.get(`review:reply:${r.id}`);
//         return { ...r, sellerReply: replyText || null };
//       })
//     );

//     res.json({ success: true, reviews: reviewsWithReplies });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
