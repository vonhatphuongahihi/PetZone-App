import { Request, Response } from 'express';
import { prisma } from '../index';

export const reviewController = {
    // Tạo review mới
    createReview: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { productId, orderId, rating, content, images } = req.body;

            if (!productId || !rating || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID and rating (1-5) are required'
                });
            }

            if (orderId) {
                const existingReview = await prisma.review.findFirst({
                    where: {
                        userId,
                        productId: parseInt(productId),
                        orderId
                    }
                });

                if (existingReview) {
                    return res.status(409).json({
                        success: false,
                        message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi'
                    });
                }
            }

            // Tạo review
            const review = await prisma.review.create({
                data: {
                    userId,
                    productId: parseInt(productId),
                    orderId: orderId || null,
                    rating: parseInt(rating),
                    content: content || null,
                    images: images || []
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true
                        }
                    },
                    product: {
                        select: {
                            id: true,
                            title: true,
                            images: {
                                take: 1
                            }
                        }
                    }
                }
            });

            // Cập nhật avgRating và totalReviews của product
            const productReviews = await prisma.review.findMany({
                where: { productId: parseInt(productId) }
            });

            const totalReviews = productReviews.length;
            const avgRating = totalReviews > 0
                ? productReviews.reduce((sum: number, r) => sum + r.rating, 0) / totalReviews
                : 0;

            await prisma.product.update({
                where: { id: parseInt(productId) },
                data: {
                    avgRating: avgRating,
                    totalReviews: totalReviews
                }
            });

            res.json({
                success: true,
                message: 'Đánh giá thành công',
                data: review
            });
        } catch (error: any) {
            console.error('Create review error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while creating review'
            });
        }
    },

    // Lấy tất cả reviews của user
    getUserReviews: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const reviews = await prisma.review.findMany({
                where: { userId },
                include: {
                    product: {
                        include: {
                            images: {
                                take: 1
                            }
                        }
                    },
                    order: {
                        select: {
                            id: true,
                            orderNumber: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: reviews
            });
        } catch (error: any) {
            console.error('Get user reviews error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching reviews'
            });
        }
    },

    // Lấy reviews của một sản phẩm
    getProductReviews: async (req: Request, res: Response) => {
        try {
            const { productId } = req.params;

            const reviews = await prisma.review.findMany({
                where: { productId: parseInt(productId) },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: reviews
            });
        } catch (error: any) {
            console.error('Get product reviews error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching reviews'
            });
        }
    },

    //seller reply
    replyToReview: async (req: Request, res: Response) => {
        try {
            const { reviewId } = req.params;
            const { reply } = req.body;
            const userId = (req as any).user?.id;

            // Kiểm tra user là owner store của product
            const review = await prisma.review.findUnique({
                where: { id: reviewId },
                include: { product: true },
            });
            if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

            const store = await prisma.store.findUnique({
                where: { id: review.product.storeId },
            });

            if (store?.userId !== userId) {
                return res.status(403).json({ success: false, message: 'Chỉ chủ cửa hàng mới trả lời được' });
            }

            const updatedReview = await prisma.review.update({
                where: { id: reviewId },
                data: {
                    sellerReply: reply,
                    replyAt: new Date(),
                },
            });

            res.json({ success: true, data: updatedReview });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi khi trả lời review' });
        }
    }
};

