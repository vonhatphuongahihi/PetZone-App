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
    }
};
