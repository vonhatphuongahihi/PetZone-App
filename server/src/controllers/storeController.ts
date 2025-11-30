import { Request, Response } from 'express';
import { prisma } from '../index';

export const storeController = {
    createStore: async (req: Request, res: Response) => {
        try {
            const { storeName, description, phoneNumber, email, address } = req.body;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }

            if (!storeName || !phoneNumber || !email || !address) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'Store name, phone number, email, and address are required'
                });
            }

            // Check if user already has a store
            const existingStore = await prisma.store.findFirst({
                where: { userId, deletedAt: null }
            });

            if (existingStore) {
                return res.status(409).json({
                    error: 'Store already exists',
                    message: 'User already has a store'
                });
            }

            // Generate slug from store name
            const slug = storeName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            // Ensure slug is unique
            let finalSlug = slug;
            let counter = 1;
            while (await prisma.store.findUnique({ where: { slug: finalSlug } })) {
                finalSlug = `${slug}-${counter}`;
                counter++;
            }

            const store = await prisma.store.create({
                data: {
                    userId,
                    storeName,
                    slug: finalSlug,
                    description: description || null,
                    phoneNumber,
                    email,
                    address,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true
                        }
                    }
                }
            });

            res.status(201).json({
                message: 'Store created successfully',
                store
            });
        } catch (error) {
            console.error('Create store error:', error);
            res.status(500).json({
                error: 'Failed to create store',
                message: 'An error occurred while creating the store'
            });
        }
    },

    getMyStore: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }

            const store = await prisma.store.findFirst({
                where: { userId, deletedAt: null },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true
                        }
                    }
                }
            });

            if (!store) {
                return res.status(404).json({
                    error: 'Store not found',
                    message: 'No store found for this user'
                });
            }

            res.json({ store });
        } catch (error) {
            console.error('Get store error:', error);
            res.status(500).json({
                error: 'Failed to get store',
                message: 'An error occurred while fetching the store'
            });
        }
    },

    updateStore: async (req: Request, res: Response) => {
        try {
            const { storeName, description, phoneNumber, email, address } = req.body;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }

            const store = await prisma.store.findFirst({
                where: { userId, deletedAt: null }
            });

            if (!store) {
                return res.status(404).json({
                    error: 'Store not found',
                    message: 'No store found for this user'
                });
            }

            const updateData: any = {};
            if (storeName) updateData.storeName = storeName;
            if (description !== undefined) updateData.description = description;
            if (phoneNumber) updateData.phoneNumber = phoneNumber;
            if (email) updateData.email = email;
            if (address) updateData.address = address;

            // If store name changed, update slug
            if (storeName && storeName !== store.storeName) {
                const slug = storeName
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();

                let finalSlug = slug;
                let counter = 1;
                while (await prisma.store.findFirst({
                    where: {
                        slug: finalSlug,
                        id: { not: store.id }
                    }
                })) {
                    finalSlug = `${slug}-${counter}`;
                    counter++;
                }
                updateData.slug = finalSlug;
            }

            const updatedStore = await prisma.store.update({
                where: { id: store.id },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true
                        }
                    }
                }
            });

            res.json({
                message: 'Store updated successfully',
                store: updatedStore
            });
        } catch (error) {
            console.error('Update store error:', error);
            res.status(500).json({
                error: 'Failed to update store',
                message: 'An error occurred while updating the store'
            });
        }
    },

    // Profile Seller endpoints
    getSellerProfile: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }

            const store = await prisma.store.findFirst({
                where: { userId, deletedAt: null },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true,
                            createdAt: true
                        }
                    },
                    products: {
                        select: {
                            id: true
                        }
                    }
                }
            });

            if (!store) {
                return res.status(404).json({
                    error: 'Store not found',
                    message: 'No store found for this user'
                });
            }

            const profileData = {
                store: {
                    id: store.id,
                    storeName: store.storeName,
                    slug: store.slug,
                    description: store.description,
                    avatarUrl: store.avatarUrl,
                    phoneNumber: store.phoneNumber,
                    email: store.email,
                    address: store.address,
                    rating: store.rating,
                    revenue: store.revenue,
                    totalOrders: store.totalOrders,
                    totalReviews: store.totalReviews,
                    totalProducts: store.products.length,
                    followersCount: store.followersCount,
                    isActive: store.isActive,
                    createdAt: store.createdAt,
                    updatedAt: store.updatedAt
                },
                user: store.user
            };

            res.json({
                message: 'Seller profile fetched successfully',
                profile: profileData
            });
        } catch (error) {
            console.error('Get seller profile error:', error);
            res.status(500).json({
                error: 'Failed to get seller profile',
                message: 'An error occurred while fetching seller profile'
            });
        }
    },

    updateSellerProfile: async (req: Request, res: Response) => {
        try {
            const { storeName, description, phoneNumber, address, ownerName } = req.body;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }

            // Validation
            if (!storeName || !phoneNumber || !address) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'Store name, phone number, and address are required'
                });
            }

            const store = await prisma.store.findFirst({
                where: { userId, deletedAt: null }
            });

            if (!store) {
                return res.status(404).json({
                    error: 'Store not found',
                    message: 'No store found for this user'
                });
            }

            const updateData: any = {
                storeName,
                description: description || null,
                phoneNumber,
                address
            };

            // If store name changed, update slug
            if (storeName !== store.storeName) {
                const slug = storeName
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();

                let finalSlug = slug;
                let counter = 1;
                while (await prisma.store.findFirst({
                    where: {
                        slug: finalSlug,
                        id: { not: store.id }
                    }
                })) {
                    finalSlug = `${slug}-${counter}`;
                    counter++;
                }
                updateData.slug = finalSlug;
            }

            // Update store
            const updatedStore = await prisma.store.update({
                where: { id: store.id },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true
                        }
                    }
                }
            });

            // Update user's username if ownerName provided
            if (ownerName && ownerName.trim() !== '') {
                await prisma.user.update({
                    where: { id: userId },
                    data: { username: ownerName.trim() }
                });

                // Update the response to include new username
                updatedStore.user.username = ownerName.trim();
            }

            res.json({
                message: 'Seller profile updated successfully',
                store: updatedStore
            });
        } catch (error) {
            console.error('Update seller profile error:', error);
            res.status(500).json({
                error: 'Failed to update seller profile',
                message: 'An error occurred while updating seller profile'
            });
        }
    },

    getSellerStats: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const store = await prisma.store.findFirst({
                where: { userId, deletedAt: null }
            });

            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            // Count products
            const totalProducts = await prisma.product.count({
                where: { storeId: store.id }
            });

            // Get orders for this store
            const orders = await prisma.order.findMany({
                where: {
                    storeId: store.id,
                    deletedAt: null,
                    status: {
                        in: ['confirmed', 'shipped'] // Only count confirmed and shipped orders
                    }
                },
                include: {
                    orderItems: true
                }
            });

            // Calculate total revenue from orders
            const totalRevenue = orders.reduce((sum: number, order: any) => {
                return sum + Number(order.total);
            }, 0);

            // Count total orders
            const totalOrders = orders.length;

            // Calculate average rating (default to 4.8 if no reviews)
            const rating = store.rating || 4.8;

            const stats = {
                totalRevenue,
                totalOrders,
                totalProducts,
                rating
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get seller stats error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching seller stats'
            });
        }
    },

    getBestSellingProducts: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const store = await prisma.store.findFirst({
                where: { userId, deletedAt: null }
            });

            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            // Get all order items for this store
            const orderItems = await prisma.orderItem.findMany({
                where: {
                    order: {
                        storeId: store.id,
                        deletedAt: null,
                        status: {
                            in: ['confirmed', 'shipped']
                        }
                    }
                },
                include: {
                    product: {
                        include: {
                            images: true
                        }
                    }
                }
            });

            // Group by product and calculate total sold
            const productSales: any = {};
            orderItems.forEach((item: any) => {
                const productId = item.productId;
                if (!productId) return;

                if (!productSales[productId]) {
                    productSales[productId] = {
                        product: item.product,
                        totalSold: 0,
                        totalRevenue: 0
                    };
                }
                productSales[productId].totalSold += item.quantity;
                productSales[productId].totalRevenue += Number(item.totalPrice);
            });

            // Convert to array and sort by totalSold
            const bestSellingProducts = Object.values(productSales)
                .sort((a: any, b: any) => b.totalSold - a.totalSold)
                .slice(0, 3) // Top 3
                .map((item: any) => ({
                    id: item.product.id,
                    name: item.product.title,
                    price: Number(item.product.price),
                    sold: item.totalSold,
                    image: item.product.images?.[0]?.url || null,
                    rating: Number(item.product.avgRating) || 4.8
                }));

            res.json({
                success: true,
                data: bestSellingProducts
            });
        } catch (error) {
            console.error('Get best selling products error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching best selling products'
            });
        }
    },

    // Follow/Unfollow store (toggle)
    followStore: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const { storeId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            if (!storeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Store ID is required'
                });
            }

            // Check if store exists
            const store = await prisma.store.findUnique({
                where: { id: storeId }
            });

            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            // Check if already following
            const existingFollow = await prisma.storeFollow.findUnique({
                where: {
                    userId_storeId: {
                        userId,
                        storeId
                    }
                }
            });

            if (existingFollow) {
                // Unfollow if already following
                await prisma.storeFollow.delete({
                    where: {
                        userId_storeId: {
                            userId,
                            storeId
                        }
                    }
                });

                // Update followers count
                await prisma.store.update({
                    where: { id: storeId },
                    data: {
                        followersCount: {
                            decrement: 1
                        }
                    }
                });

                return res.json({
                    success: true,
                    message: 'Store unfollowed successfully',
                    isFollowing: false
                });
            } else {
                // Create follow
                await prisma.storeFollow.create({
                    data: {
                        userId,
                        storeId
                    }
                });

                // Update followers count
                await prisma.store.update({
                    where: { id: storeId },
                    data: {
                        followersCount: {
                            increment: 1
                        }
                    }
                });

                return res.json({
                    success: true,
                    message: 'Store followed successfully',
                    isFollowing: true
                });
            }
        } catch (error) {
            console.error('Follow/Unfollow store error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while following/unfollowing the store'
            });
        }
    },

    // Unfollow store
    unfollowStore: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const { storeId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            if (!storeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Store ID is required'
                });
            }

            // Check if following
            const existingFollow = await prisma.storeFollow.findUnique({
                where: {
                    userId_storeId: {
                        userId,
                        storeId
                    }
                }
            });

            if (!existingFollow) {
                return res.status(404).json({
                    success: false,
                    message: 'Not following this store'
                });
            }

            // Delete follow
            await prisma.storeFollow.delete({
                where: {
                    userId_storeId: {
                        userId,
                        storeId
                    }
                }
            });

            // Update followers count
            await prisma.store.update({
                where: { id: storeId },
                data: {
                    followersCount: {
                        decrement: 1
                    }
                }
            });

            res.json({
                success: true,
                message: 'Store unfollowed successfully'
            });
        } catch (error) {
            console.error('Unfollow store error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while unfollowing the store'
            });
        }
    },

    // Check if user is following a store
    checkFollowStatus: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const { storeId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            if (!storeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Store ID is required'
                });
            }

            const follow = await prisma.storeFollow.findUnique({
                where: {
                    userId_storeId: {
                        userId,
                        storeId
                    }
                }
            });

            res.json({
                success: true,
                data: {
                    isFollowing: !!follow
                }
            });
        } catch (error) {
            console.error('Check follow status error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while checking follow status'
            });
        }
    },

    // Get user's followed stores
    getFollowedStores: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const follows = await prisma.storeFollow.findMany({
                where: { userId },
                include: {
                    store: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const stores = follows.map((follow: any) => follow.store);

            res.json({
                success: true,
                data: stores
            });
        } catch (error) {
            console.error('Get followed stores error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching followed stores'
            });
        }
    },

    // Get store by ID (public endpoint - no auth required)
    getStoreById: async (req: Request, res: Response) => {
        try {
            const { storeId } = req.params;
            const userId = (req as any).user?.id || null; // Optional: to check follow status

            if (!storeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Store ID is required'
                });
            }

            const store = await prisma.store.findUnique({
                where: { id: storeId },
                select: {
                    id: true,
                    userId: true,
                    storeName: true,
                    slug: true,
                    description: true,
                    avatarUrl: true,
                    phoneNumber: true,
                    email: true,
                    address: true,
                    rating: true,
                    revenue: true,
                    totalOrders: true,
                    totalReviews: true,
                    totalProducts: true,
                    followersCount: true,
                    isActive: true,
                    deletedAt: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            });

            if (!store || store.deletedAt || !store.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            // Check follow status if user is logged in
            let isFollowing = false;
            if (userId) {
                const follow = await prisma.storeFollow.findUnique({
                    where: {
                        userId_storeId: {
                            userId,
                            storeId
                        }
                    }
                });
                isFollowing = !!follow;
            }

            res.json({
                success: true,
                data: {
                    ...store,
                    isFollowing
                }
            });
        } catch (error) {
            console.error('Get store by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching the store'
            });
        }
    },

    // Get top stores (public endpoint - no auth required)
    getTopStores: async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            // Get userId from request if authenticated (optional)
            const userId = (req as any).user?.id || null;

            // Get top stores by followers count
            const stores = await prisma.store.findMany({
                where: {
                    deletedAt: null,
                    isActive: true
                },
                select: {
                    id: true,
                    storeName: true,
                    slug: true,
                    avatarUrl: true,
                    description: true,
                    followersCount: true,
                    totalOrders: true,
                    rating: true,
                    totalProducts: true,
                    createdAt: true
                },
                orderBy: [
                    { followersCount: 'desc' },
                    { totalOrders: 'desc' }
                ],
                take: limit
            });

            // If user is logged in, check follow status for each store
            let storesWithFollowStatus = stores;
            if (userId) {
                const storeIds = stores.map(s => s.id);
                const follows = await prisma.storeFollow.findMany({
                    where: {
                        userId,
                        storeId: { in: storeIds }
                    },
                    select: {
                        storeId: true
                    }
                });

                const followedStoreIds = new Set(follows.map((f: any) => f.storeId));
                storesWithFollowStatus = stores.map(store => ({
                    ...store,
                    isFollowing: followedStoreIds.has(store.id)
                }));
            } else {
                storesWithFollowStatus = stores.map(store => ({
                    ...store,
                    isFollowing: false
                }));
            }

            res.json({
                success: true,
                data: storesWithFollowStatus
            });
        } catch (error) {
            console.error('Get top stores error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching top stores'
            });
        }
    }
};
