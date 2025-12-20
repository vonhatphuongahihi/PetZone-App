import { Request, Response } from 'express';
import { prisma } from '../index';

// Generate unique order number
function generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
}

export const orderController = {
    // Tạo đơn hàng
    createOrder: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { items, addressId, paymentMethod, shippingFee } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Items are required'
                });
            }

            if (!addressId) {
                return res.status(400).json({
                    success: false,
                    message: 'Address ID is required'
                });
            }

            // Verify address belongs to user
            const address = await prisma.userAddress.findFirst({
                where: {
                    id: addressId,
                    userId: userId
                }
            });

            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: 'Address not found'
                });
            }

            // Group items by store
            const itemsByStore = items.reduce((acc: any, item: any) => {
                const storeId = item.storeId;
                if (!acc[storeId]) {
                    acc[storeId] = [];
                }
                acc[storeId].push(item);
                return acc;
            }, {});

            const createdOrders: any[] = [];

            // Create order for each store
            for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
                const orderItems = storeItems as any[];

                // Calculate totals
                const subtotal = orderItems.reduce((sum, item) => {
                    return sum + (Number(item.price) * item.quantity);
                }, 0);

                const totalShippingFee = shippingFee || 30000;
                const total = subtotal + totalShippingFee;

                // Create order
                const order = await prisma.order.create({
                    data: {
                        orderNumber: generateOrderNumber(),
                        userId,
                        storeId: storeId || null,
                        status: 'pending', // Chờ xác nhận (mặc định)
                        subtotal,
                        shippingFee: totalShippingFee,
                        total,
                        paymentMethod: paymentMethod || 'cash',
                        paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'unpaid',
                        orderItems: {
                            create: orderItems.map((item: any) => ({
                                productId: item.productId,
                                title: item.title,
                                sku: item.sku || null,
                                quantity: item.quantity,
                                unitPrice: item.price,
                                totalPrice: item.price * item.quantity
                            }))
                        },
                        payments: {
                            create: {
                                paymentProvider: paymentMethod === 'cash' ? 'cod' : paymentMethod || 'cod',
                                amount: total,
                                currency: 'VND',
                                method: paymentMethod || 'cash',
                                status: paymentMethod === 'cash' ? 'initiated' : 'initiated'
                            }
                        }
                    },
                    include: {
                        orderItems: {
                            include: {
                                product: {
                                    include: {
                                        images: true
                                    }
                                }
                            }
                        },
                        store: true,
                        payments: true
                    }
                });

                createdOrders.push(order);

                // Cập nhật totalOrders của store khi tạo order
                if (storeId) {
                    await prisma.store.update({
                        where: { id: storeId },
                        data: {
                            totalOrders: {
                                increment: 1
                            }
                        }
                    });
                }
            }

            // Xóa các sản phẩm đã đặt hàng khỏi giỏ hàng
            const productIds = items.map((item: any) => item.productId);
            await prisma.cartItem.deleteMany({
                where: {
                    userId,
                    productId: {
                        in: productIds
                    }
                }
            });

            // Emit socket notification cho seller khi có đơn hàng mới
            try {
                const { getSocketInstance } = await import('../index');
                const io = getSocketInstance();

                // Lấy thông tin user để gửi notification
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { username: true }
                });

                // Gửi notification cho mỗi store owner
                for (const order of createdOrders) {
                    if (order.storeId) {
                        const store = await prisma.store.findUnique({
                            where: { id: order.storeId },
                            select: { userId: true, storeName: true }
                        });

                        if (store?.userId) {
                            // Tìm tất cả sockets của store owner
                            const storeOwnerSockets = Array.from(io.sockets.sockets.values())
                                .filter(s => s.data.userId === store.userId);

                            storeOwnerSockets.forEach(socket => {
                                socket.emit('order:new', {
                                    orderId: order.id,
                                    orderNumber: order.orderNumber,
                                    storeId: order.storeId,
                                    customerName: user?.username || 'Khách hàng',
                                    total: order.total,
                                    status: order.status,
                                    createdAt: order.createdAt
                                });
                            });

                            console.log(`📦 [Socket] New order notification sent to store owner ${store.userId} for order ${order.id}`);
                        }
                    }
                }

                // Gửi notification cho customer (đặt hàng thành công)
                const customerSockets = Array.from(io.sockets.sockets.values())
                    .filter(s => s.data.userId === userId);

                customerSockets.forEach(socket => {
                    socket.emit('order:created', {
                        orders: createdOrders.map(order => ({
                            orderId: order.id,
                            orderNumber: order.orderNumber,
                            storeName: (order.store as any)?.storeName || 'Cửa hàng',
                            total: order.total,
                            status: order.status,
                            createdAt: order.createdAt
                        }))
                    });
                });

                console.log(`📦 [Socket] Order created notification sent to customer ${userId}`);
            } catch (socketError) {
                console.error('Error emitting socket notification:', socketError);
                // Không throw error, chỉ log để không ảnh hưởng đến việc tạo order
            }

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: createdOrders
            });
        } catch (error: any) {
            console.error('Error creating order:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create order'
            });
        }
    },

    // Lấy danh sách đơn hàng của user
    getUserOrders: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { status } = req.query;

            const where: any = {
                userId,
                deletedAt: null
            };

            if (status) {
                where.status = status;
            }

            const orders = await prisma.order.findMany({
                where,
                include: {
                    orderItems: {
                        include: {
                            product: {
                                include: {
                                    images: true
                                }
                            }
                        }
                    },
                    store: true,
                    payments: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: orders
            });
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch orders'
            });
        }
    },

    // Lấy danh sách đơn hàng của store (cho seller)
    getStoreOrders: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Lấy store của user đang đăng nhập
            const store = await prisma.store.findFirst({
                where: {
                    userId,
                    deletedAt: null
                }
            });

            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            const { status } = req.query;

            const where: any = {
                storeId: store.id,
                deletedAt: null
            };

            if (status) {
                where.status = status;
            }

            const orders = await prisma.order.findMany({
                where,
                include: {
                    orderItems: {
                        include: {
                            product: {
                                include: {
                                    images: true
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    store: true,
                    payments: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: orders
            });
        } catch (error: any) {
            console.error('Error fetching store orders:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch store orders'
            });
        }
    },

    // Lấy chi tiết đơn hàng
    getOrderById: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { id } = req.params;

            const order = await prisma.order.findFirst({
                where: {
                    id,
                    userId,
                    deletedAt: null
                },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                include: {
                                    images: true
                                }
                            }
                        }
                    },
                    store: true,
                    payments: true
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error: any) {
            console.error('Error fetching order:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch order'
            });
        }
    },

    // Cập nhật trạng thái đơn hàng (cho seller/admin)
    updateOrderStatus: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { id } = req.params;
            const { status } = req.body;

            // Validate status
            const validStatuses = ['pending', 'confirmed', 'shipped', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            // Verify order belongs to user or user is store owner
            const order = await prisma.order.findFirst({
                where: {
                    id,
                    OR: [
                        { userId },
                        { store: { userId } }
                    ],
                    deletedAt: null
                },
                include: {
                    store: true
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Update order status
            const updateData: any = {
                status
            };

            // Set timestamps based on status
            if (status === 'confirmed') {
                // Calculate estimated delivery date based on address when confirmed (đang giao hàng)
                // Get user's default address
                const userWithAddress = await prisma.user.findUnique({
                    where: { id: order.userId },
                    include: {
                        addresses: {
                            where: { isDefault: true },
                            take: 1
                        }
                    }
                });

                if (userWithAddress?.addresses?.[0]) {
                    const address = userWithAddress.addresses[0];
                    const province = address.province || '';
                    const isHoChiMinh = province.toLowerCase().includes('hồ chí minh') ||
                        province.toLowerCase().includes('ho chi minh') ||
                        province.toLowerCase().includes('tp.hcm') ||
                        province.toLowerCase().includes('tphcm') ||
                        province.toLowerCase().includes('hcm');

                    const confirmedDate = new Date();
                    const estimatedDate = new Date(confirmedDate);
                    estimatedDate.setDate(estimatedDate.getDate() + (isHoChiMinh ? 3 : 5));
                    updateData.estimatedDeliveryDate = estimatedDate;
                }
            } else if (status === 'shipped' && !order.shippedAt) {
                updateData.shippedAt = new Date();
                // Auto update payment status to paid when shipped (đã nhận hàng)
                if (order.paymentStatus === 'unpaid') {
                    updateData.paymentStatus = 'paid';
                }
            } else if (status === 'cancelled' && !order.cancelledAt) {
                updateData.cancelledAt = new Date();
            }

            const updatedOrder = await prisma.order.update({
                where: { id },
                data: updateData,
                include: {
                    orderItems: {
                        include: {
                            product: {
                                include: {
                                    images: true
                                }
                            }
                        }
                    },
                    store: true,
                    payments: true
                }
            });

            // Cập nhật soldCount khi đơn hàng chuyển thành shipped
            if (status === 'shipped' && !order.shippedAt) {
                for (const orderItem of updatedOrder.orderItems) {
                    await prisma.product.update({
                        where: { id: Number(orderItem.productId) },
                        data: {
                            soldCount: {
                                increment: Number(orderItem.quantity) || 0
                            }
                        }
                    });
                }
                console.log('Successfully updated soldCount for all products in order');
            }

            // Emit socket notification cho customer khi trạng thái đơn hàng thay đổi
            try {
                const { getSocketInstance } = await import('../index');
                const io = getSocketInstance();

                // Lấy thông tin store để gửi notification
                const store = updatedOrder.store;

                // Map status sang tiếng Việt
                const statusMessages: { [key: string]: string } = {
                    'pending': 'đang chờ xác nhận',
                    'confirmed': 'đã được xác nhận và đang giao hàng',
                    'shipped': 'đã được giao hàng',
                    'cancelled': 'đã bị hủy'
                };

                // Gửi notification cho customer
                const customerSockets = Array.from(io.sockets.sockets.values())
                    .filter(s => s.data.userId === updatedOrder.userId);

                customerSockets.forEach(socket => {
                    socket.emit('order:status_changed', {
                        orderId: updatedOrder.id,
                        orderNumber: updatedOrder.orderNumber,
                        storeName: (store as any)?.storeName || 'Cửa hàng',
                        oldStatus: order.status,
                        newStatus: status,
                        statusMessage: statusMessages[status] || status,
                        total: updatedOrder.total,
                        updatedAt: updatedOrder.updatedAt
                    });
                });

                console.log(`📦 [Socket] Order status change notification sent to customer ${updatedOrder.userId} for order ${updatedOrder.id}`);
            } catch (socketError) {
                console.error('Error emitting socket notification:', socketError);
                // Không throw error, chỉ log để không ảnh hưởng đến việc update order
            }

            res.json({
                success: true,
                message: 'Order status updated successfully',
                data: updatedOrder
            });
        } catch (error: any) {
            console.error('Error updating order status:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update order status'
            });
        }
    },

    // Hủy đơn hàng (chỉ user mới có thể hủy đơn hàng của mình)
    cancelOrder: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { id } = req.params;

            // Verify order belongs to user and is still pending
            const order = await prisma.order.findFirst({
                where: {
                    id,
                    userId,
                    status: 'pending', // Chỉ có thể hủy đơn hàng đang chờ xác nhận
                    deletedAt: null
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or cannot be cancelled'
                });
            }

            // Update order status to cancelled
            const updatedOrder = await prisma.order.update({
                where: { id },
                data: {
                    status: 'cancelled',
                    cancelledAt: new Date()
                },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                include: {
                                    images: true
                                }
                            }
                        }
                    },
                    store: true,
                    payments: true
                }
            });

            // Emit socket notification cho seller khi đơn hàng bị hủy
            try {
                const { getSocketInstance } = await import('../index');
                const io = getSocketInstance();

                const store = updatedOrder.store;
                if (store?.userId) {
                    // Gửi notification cho store owner
                    const storeOwnerSockets = Array.from(io.sockets.sockets.values())
                        .filter(s => s.data.userId === store.userId);

                    storeOwnerSockets.forEach(socket => {
                        socket.emit('order:status_changed', {
                            orderId: updatedOrder.id,
                            orderNumber: updatedOrder.orderNumber,
                            storeName: (store as any)?.storeName || 'Cửa hàng',
                            oldStatus: 'pending',
                            newStatus: 'cancelled',
                            statusMessage: 'đã bị hủy bởi khách hàng',
                            total: updatedOrder.total,
                            updatedAt: updatedOrder.updatedAt
                        });
                    });

                    console.log(`📦 [Socket] Order cancelled notification sent to store owner ${store.userId} for order ${updatedOrder.id}`);
                }

                // Gửi notification cho customer
                const customerSockets = Array.from(io.sockets.sockets.values())
                    .filter(s => s.data.userId === userId);

                customerSockets.forEach(socket => {
                    socket.emit('order:status_changed', {
                        orderId: updatedOrder.id,
                        orderNumber: updatedOrder.orderNumber,
                        storeName: (store as any)?.storeName || 'Cửa hàng',
                        oldStatus: 'pending',
                        newStatus: 'cancelled',
                        statusMessage: 'đã được hủy thành công',
                        total: updatedOrder.total,
                        updatedAt: updatedOrder.updatedAt
                    });
                });

                console.log(`📦 [Socket] Order cancelled notification sent to customer ${userId} for order ${updatedOrder.id}`);
            } catch (socketError) {
                console.error('Error emitting socket notification:', socketError);
            }

            res.json({
                success: true,
                message: 'Order cancelled successfully',
                data: updatedOrder
            });
        } catch (error: any) {
            console.error('Error cancelling order:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to cancel order'
            });
        }
    }
};

