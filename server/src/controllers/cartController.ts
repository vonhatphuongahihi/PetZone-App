import { Request, Response } from 'express';
import { prisma } from '../index';

export const cartController = {
    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
            }

            const { productId, quantity = 1 } = req.body;

            if (!productId) {
                return res.status(400).json({ success: false, message: 'Thiếu productId' });
            }

            // Kiểm tra sản phẩm có tồn tại không
            const product = await prisma.product.findUnique({
                where: { id: Number(productId) },
            });

            if (!product) {
                return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
            }

            // Kiểm tra sản phẩm đã có trong giỏ chưa
            const existingCartItem = await prisma.cartItem.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId: Number(productId),
                    },
                },
            });

            let cartItem;
            if (existingCartItem) {
                // Nếu đã có, cập nhật quantity
                cartItem = await prisma.cartItem.update({
                    where: { id: existingCartItem.id },
                    data: { quantity: existingCartItem.quantity + quantity },
                    include: {
                        product: {
                            include: {
                                images: true,
                                store: {
                                    select: {
                                        id: true,
                                        storeName: true,
                                        avatarUrl: true,
                                    },
                                },
                                category: true,
                            },
                        },
                    },
                });
            } else {
                // Nếu chưa có, tạo mới
                cartItem = await prisma.cartItem.create({
                    data: {
                        userId,
                        productId: Number(productId),
                        quantity,
                    },
                    include: {
                        product: {
                            include: {
                                images: true,
                                store: {
                                    select: {
                                        id: true,
                                        storeName: true,
                                        avatarUrl: true,
                                    },
                                },
                                category: true,
                            },
                        },
                    },
                });
            }

            return res.json({
                success: true,
                message: 'Đã thêm vào giỏ hàng',
                data: cartItem,
            });
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            // Log chi tiết lỗi để debug
            if (error.code) {
                console.error('Prisma error code:', error.code);
                console.error('Prisma error message:', error.message);
            }
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Lấy giỏ hàng của user
    getCart: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
            }

            const cartItems = await prisma.cartItem.findMany({
                where: { userId },
                include: {
                    product: {
                        include: {
                            images: true,
                            store: {
                                select: {
                                    id: true,
                                    storeName: true,
                                    avatarUrl: true,
                                },
                            },
                            category: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return res.json({
                success: true,
                data: cartItems,
            });
        } catch (error: any) {
            console.error('Error getting cart:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // Cập nhật số lượng
    updateQuantity: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
            }

            const { cartItemId } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity < 1) {
                return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' });
            }

            // Kiểm tra cart item thuộc về user
            const cartItem = await prisma.cartItem.findUnique({
                where: { id: cartItemId },
            });

            if (!cartItem || cartItem.userId !== userId) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }

            const updated = await prisma.cartItem.update({
                where: { id: cartItemId },
                data: { quantity },
                include: {
                    product: {
                        include: {
                            images: true,
                            store: {
                                select: {
                                    id: true,
                                    storeName: true,
                                    avatarUrl: true,
                                },
                            },
                            category: true,
                        },
                    },
                },
            });

            return res.json({
                success: true,
                data: updated,
            });
        } catch (error: any) {
            console.error('Error updating cart:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeItem: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
            }

            const { cartItemId } = req.params;

            // Kiểm tra cart item thuộc về user
            const cartItem = await prisma.cartItem.findUnique({
                where: { id: cartItemId },
            });

            if (!cartItem || cartItem.userId !== userId) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }

            await prisma.cartItem.delete({
                where: { id: cartItemId },
            });

            return res.json({
                success: true,
                message: 'Đã xóa khỏi giỏ hàng',
            });
        } catch (error: any) {
            console.error('Error removing from cart:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },
};
