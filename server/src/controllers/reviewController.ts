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
                // Kiểm tra đơn hàng tồn tại và thuộc về user
                const order = await prisma.order.findFirst({
                    where: {
                        id: orderId,
                        userId: userId,
                        deletedAt: null
                    }
                });

                if (!order) {
                    return res.status(404).json({
                        success: false,
                        message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn'
                    });
                }

                // Kiểm tra đơn hàng đã được shipped (hoàn thành) chưa
                if (order.status !== 'shipped') {
                    return res.status(400).json({
                        success: false,
                        message: 'Chỉ có thể đánh giá sau khi đơn hàng đã được hoàn thành (đã nhận hàng)'
                    });
                }

                // Kiểm tra sản phẩm có trong đơn hàng không
                const orderItem = await prisma.orderItem.findFirst({
                    where: {
                        orderId: orderId,
                        productId: parseInt(productId)
                    }
                });

                if (!orderItem) {
                    return res.status(400).json({
                        success: false,
                        message: 'Sản phẩm không có trong đơn hàng này'
                    });
                }

                // Kiểm tra đã đánh giá chưa
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

            // Cập nhật totalReviews của store khi tạo review
            const product = await prisma.product.findUnique({
                where: { id: parseInt(productId) },
                select: { storeId: true }
            });

            if (product?.storeId) {
                // Tính lại totalReviews và rating của store từ tất cả reviews của các sản phẩm thuộc store
                const storeProducts = await prisma.product.findMany({
                    where: { storeId: product.storeId },
                    select: { id: true }
                });

                const productIds = storeProducts.map(p => p.id);
                const storeReviews = await prisma.review.findMany({
                    where: {
                        productId: {
                            in: productIds
                        }
                    },
                    select: {
                        rating: true
                    }
                });

                const storeReviewsCount = storeReviews.length;
                const storeAvgRating = storeReviewsCount > 0
                    ? storeReviews.reduce((sum: number, r) => sum + r.rating, 0) / storeReviewsCount
                    : 0;

                await prisma.store.update({
                    where: { id: product.storeId },
                    data: {
                        totalReviews: storeReviewsCount,
                        rating: storeAvgRating
                    }
                });
            }

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

            const formattedReviews = reviews.map(review => {
                const { seller_reply, reply_at, ...rest } = review;
                return {
                    ...rest,
                    sellerReply: seller_reply,
                    replyAt: reply_at,
                    images: review.images || []
                };
            });

            res.json({
                success: true,
                data: formattedReviews
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
                    seller_reply: reply,
                    reply_at: new Date(),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true
                        }
                    }
                }
            });

            // Format response để match với frontend (camelCase)
            // Loại bỏ các field snake_case và chỉ giữ camelCase
            const { seller_reply, reply_at, ...rest } = updatedReview;
            const formattedReview = {
                ...rest,
                sellerReply: seller_reply,
                replyAt: reply_at,
                images: updatedReview.images || []
            };

            res.json({ success: true, data: formattedReview });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi khi trả lời review' });
        }
    }
};

