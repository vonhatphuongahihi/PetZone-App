import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const addressController = {
    // Thêm địa chỉ mới
    addAddress: async (req: Request, res: Response) => {
        try {
            const { name, phoneNumber, province, street, type, isDefault } = req.body;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Validate required fields
            if (!name || !phoneNumber || !province || !street) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin địa chỉ'
                });
            }

            // Nếu đặt làm địa chỉ mặc định, bỏ default các địa chỉ khác
            if (isDefault) {
                await prisma.userAddress.updateMany({
                    where: { userId },
                    data: { isDefault: false }
                });
            }

            const address = await prisma.userAddress.create({
                data: {
                    userId,
                    name: name.trim(),
                    phoneNumber: phoneNumber.trim(),
                    province: province.trim(),
                    street: street.trim(),
                    type: type || 'Nhà riêng',
                    isDefault: isDefault || false
                }
            });

            res.status(201).json({
                success: true,
                message: 'Thêm địa chỉ thành công',
                data: address
            });
        } catch (error) {
            console.error('Error adding address:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi thêm địa chỉ'
            });
        }
    },

    // Lấy danh sách địa chỉ của user
    getUserAddresses: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const addresses = await prisma.userAddress.findMany({
                where: { userId },
                orderBy: [
                    { isDefault: 'desc' }, // Địa chỉ mặc định lên đầu
                    { createdAt: 'desc' }
                ]
            });

            res.json({
                success: true,
                data: addresses
            });
        } catch (error) {
            console.error('Error fetching addresses:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách địa chỉ'
            });
        }
    },

    // Cập nhật địa chỉ
    updateAddress: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, phoneNumber, province, street, type, isDefault } = req.body;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Kiểm tra quyền sở hữu
            const existingAddress = await prisma.userAddress.findFirst({
                where: { id, userId }
            });

            if (!existingAddress) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy địa chỉ'
                });
            }

            // Nếu đặt làm mặc định, bỏ default các địa chỉ khác
            if (isDefault) {
                await prisma.userAddress.updateMany({
                    where: { userId, id: { not: id } },
                    data: { isDefault: false }
                });
            }

            const updatedAddress = await prisma.userAddress.update({
                where: { id },
                data: {
                    ...(name && { name: name.trim() }),
                    ...(phoneNumber && { phoneNumber: phoneNumber.trim() }),
                    ...(province && { province: province.trim() }),
                    ...(street && { street: street.trim() }),
                    ...(type && { type }),
                    ...(typeof isDefault !== 'undefined' && { isDefault })
                }
            });

            res.json({
                success: true,
                message: 'Cập nhật địa chỉ thành công',
                data: updatedAddress
            });
        } catch (error) {
            console.error('Error updating address:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật địa chỉ'
            });
        }
    },

    // Xóa địa chỉ
    deleteAddress: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Kiểm tra quyền sở hữu
            const existingAddress = await prisma.userAddress.findFirst({
                where: { id, userId }
            });

            if (!existingAddress) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy địa chỉ'
                });
            }

            await prisma.userAddress.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Xóa địa chỉ thành công'
            });
        } catch (error) {
            console.error('Error deleting address:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa địa chỉ'
            });
        }
    },

    // Đặt địa chỉ làm mặc định
    setDefaultAddress: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Kiểm tra quyền sở hữu
            const existingAddress = await prisma.userAddress.findFirst({
                where: { id, userId }
            });

            if (!existingAddress) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy địa chỉ'
                });
            }

            // Bỏ default tất cả địa chỉ khác
            await prisma.userAddress.updateMany({
                where: { userId },
                data: { isDefault: false }
            });

            // Đặt địa chỉ này làm mặc định
            const updatedAddress = await prisma.userAddress.update({
                where: { id },
                data: { isDefault: true }
            });

            res.json({
                success: true,
                message: 'Đặt địa chỉ mặc định thành công',
                data: updatedAddress
            });
        } catch (error) {
            console.error('Error setting default address:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi đặt địa chỉ mặc định'
            });
        }
    }
};