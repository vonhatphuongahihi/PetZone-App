import { v2 as cloudinary } from 'cloudinary';
import { Response } from 'express';
import multer from 'multer';
import {
    findOrCreateOneToOneConversation,
    listMessages,
    listUserConversations,
    markRead,
    saveMessage
} from '../services/chatService';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config for memory storage (không lưu file local)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

export const chatController = {

    // Tạo hoặc tìm conversation giữa 2 users
    createOrFindConversation: async (req: any, res: Response) => {
        try {
            const { otherUserId } = req.body;

            if (!otherUserId) {
                return res.status(400).json({
                    error: 'BadRequest',
                    message: 'otherUserId là bắt buộc'
                });
            }

            // Không thể tạo conversation với chính mình
            if (otherUserId === req.user.id) {
                return res.status(400).json({
                    error: 'BadRequest',
                    message: 'Không thể tạo conversation với chính mình'
                });
            }

            // Kiểm tra user có tồn tại không
            const { prisma } = await import('../db');
            const otherUser = await (prisma as any).user.findUnique({
                where: { id: otherUserId }
            });

            if (!otherUser) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'User không tồn tại'
                });
            }

            const conversation = await findOrCreateOneToOneConversation(req.user.id, otherUserId);
            res.status(200).json(conversation);
        } catch (error: any) {
            console.error('Create conversation error:', error);
            res.status(500).json({
                error: 'Lỗi server!',
                message: error?.message || 'Không thể tạo conversation'
            });
        }
    },

    // Lấy danh sách conversations của user
    getUserConversations: async (req: any, res: Response) => {
        try {
            const data = await listUserConversations(req.user.id);
            res.json(data);
        } catch (error: any) {
            console.error('Get user conversations error:', error);
            res.status(500).json({
                error: 'Lỗi server!',
                message: error?.message || 'Không thể lấy danh sách conversation'
            });
        }
    },

    // Lấy thông tin chi tiết của conversation
    getConversationDetail: async (req: any, res: Response) => {
        try {
            const conversationId = Number(req.params.conversationId);
            if (isNaN(conversationId)) {
                return res.status(400).json({
                    error: 'BadRequest',
                    message: 'conversationId không hợp lệ'
                });
            }

            const { prisma } = await import('../db');
            const conversation = await (prisma as any).conversation.findUnique({
                where: { id: conversationId },
                select: {
                    id: true,
                    theme: true,
                    createdAt: true,
                    updatedAt: true,
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true
                                }
                            }
                        }
                    },
                    messages: {
                        orderBy: { id: 'desc' },
                        take: 1,
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    username: true
                                }
                            }
                        }
                    }
                }
            });

            if (!conversation) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Conversation không tồn tại'
                });
            }

            // Kiểm tra user có quyền truy cập conversation này không
            const isParticipant = conversation.participants.some((p: any) => p.userId === req.user.id);
            if (!isParticipant) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Bạn không có quyền truy cập conversation này'
                });
            }

            res.json(conversation);
        } catch (error: any) {
            console.error('Get conversation error:', error);
            res.status(500).json({
                error: 'Lỗi server!',
                message: error?.message || 'Không thể lấy thông tin conversation'
            });
        }
    },

    // Lấy tin nhắn trong conversation
    getMessages: async (req: any, res: Response) => {
        try {
            const conversationId = Number(req.params.conversationId);
            if (isNaN(conversationId)) {
                return res.status(400).json({
                    error: 'BadRequest',
                    message: 'conversationId không hợp lệ'
                });
            }

            const cursorId = req.query.cursorId ? Number(req.query.cursorId) : undefined;
            const limit = req.query.limit ? Number(req.query.limit) : 20;

            const data = await listMessages(conversationId, cursorId, limit);
            res.json(data);
        } catch (error: any) {
            console.error('Get messages error:', error);
            res.status(500).json({
                error: 'Lỗi server!',
                message: error?.message || 'Không thể lấy tin nhắn'
            });
        }
    },

    // Đánh dấu tin nhắn đã đọc
    markAsRead: async (req: any, res: Response) => {
        try {
            const conversationId = Number(req.params.conversationId);
            if (isNaN(conversationId)) {
                return res.status(400).json({
                    error: 'BadRequest',
                    message: 'conversationId không hợp lệ'
                });
            }

            await markRead(conversationId, req.user.id);
            res.status(200).json({ message: 'Đã đánh dấu đọc' });
        } catch (error: any) {
            console.error('Mark read error:', error);
            res.status(500).json({
                error: 'Lỗi server!',
                message: error?.message || 'Không thể đánh dấu đã đọc'
            });
        }
    },

    // Tạo tin nhắn mới (for testing via REST)
    createMessage: async (req: any, res: Response) => {
        try {
            const { conversationId, body } = req.body || {};

            if (!conversationId || !body || !String(body).trim()) {
                return res.status(400).json({
                    error: 'BadRequest',
                    message: 'conversationId và body là bắt buộc'
                });
            }

            const saved = await saveMessage(Number(conversationId), req.user.id, String(body).trim());
            res.status(201).json(saved);
        } catch (error: any) {
            console.error('Create message error:', error);
            res.status(500).json({
                error: 'Lỗi!',
                message: error?.message || 'Không thể tạo message'
            });
        }
    },

    // Upload image và tạo tin nhắn
    uploadImage: [
        upload.single('image'),
        async (req: any, res: Response) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        error: 'BadRequest',
                        message: 'Không có file ảnh được upload'
                    });
                }

                const { conversationId } = req.body;
                if (!conversationId) {
                    return res.status(400).json({
                        error: 'BadRequest',
                        message: 'conversationId là bắt buộc'
                    });
                }

                // Upload to Cloudinary
                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'image',
                            folder: 'petzone-messages',
                            transformation: [
                                { quality: 'auto' } // Chỉ tối ưu quality, giữ nguyên kích thước
                            ]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(req.file.buffer);
                });

                const cloudinaryResult = uploadResult as any;
                const imageUrl = cloudinaryResult.secure_url;

                res.status(200).json({
                    imageUrl,
                    publicId: cloudinaryResult.public_id
                });
            } catch (error: any) {
                console.error('Upload image error:', error);
                res.status(500).json({
                    error: 'Lỗi server!',
                    message: error?.message || 'Không thể upload ảnh'
                });
            }
        }
    ] as any,

    // Cập nhật theme conversation
    updateConversationTheme: async (req: any, res: Response) => {
        try {
            const conversationId = Number(req.params.conversationId);
            const { theme } = req.body;

            if (isNaN(conversationId)) {
                return res.status(400).json({
                    error: 'BadRequest',
                    message: 'conversationId không hợp lệ'
                });
            }

            if (!theme || typeof theme !== 'string') {
                return res.status(400).json({
                    error: 'BadRequest',
                    message: 'theme là bắt buộc và phải là string'
                });
            }

            const { prisma } = await import('../db');

            // Kiểm tra user có quyền update conversation này không
            const conversation = await (prisma as any).conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: {
                        some: { userId: req.user.id }
                    }
                }
            });

            if (!conversation) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Conversation không tồn tại hoặc bạn không có quyền cập nhật'
                });
            }

            // Cập nhật theme
            await (prisma as any).conversation.update({
                where: { id: conversationId },
                data: { theme }
            });

            res.status(200).json({
                message: 'Đã cập nhật màu chat thành công',
                theme
            });
        } catch (error: any) {
            console.error('Update theme error:', error);
            res.status(500).json({
                error: 'Lỗi server!',
                message: error?.message || 'Không thể cập nhật theme'
            });
        }
    },

    // Xóa conversation
    deleteConversation: async (req: any, res: Response) => {
        try {
            const conversationId = Number(req.params.conversationId);
            if (isNaN(conversationId)) {
                return res.status(400).json({
                    error: 'BadRequest',
                    message: 'conversationId không hợp lệ'
                });
            }

            const { prisma } = await import('../db');

            // Kiểm tra user có quyền xóa conversation này không
            const conversation = await (prisma as any).conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: {
                        some: { userId: req.user.id }
                    }
                }
            });

            if (!conversation) {
                return res.status(404).json({
                    error: 'NotFound',
                    message: 'Conversation không tồn tại hoặc bạn không có quyền xóa'
                });
            }

            // Xóa conversation và tất cả related data
            await (prisma as any).message.deleteMany({
                where: { conversationId }
            });

            await (prisma as any).conversationParticipant.deleteMany({
                where: { conversationId }
            });

            await (prisma as any).conversation.delete({
                where: { id: conversationId }
            });

            res.status(200).json({ message: 'Đã xóa đoạn chat thành công' });
        } catch (error: any) {
            console.error('Delete conversation error:', error);
            res.status(500).json({
                error: 'Lỗi server!',
                message: error?.message || 'Không thể xóa conversation'
            });
        }
    },

    // Lấy danh sách users đang online
    getOnlineUsers: async (req: any, res: Response) => {
        try {

            // Import socket instance từ index.ts
            const { getSocketInstance } = await import('../index');
            const io = getSocketInstance();

            if (!io || !(io as any).getOnlineUsers) {
                return res.status(503).json({
                    error: 'ServiceUnavailable',
                    message: 'Socket.IO service không khả dụng'
                });
            }

            const onlineUserIds = (io as any).getOnlineUsers();

            res.status(200).json({
                onlineUsers: onlineUserIds,
                count: onlineUserIds.length
            });
        } catch (error: any) {
            console.error('🌐 [API] Get online users error:', error);
            res.status(500).json({
                error: 'Lỗi server!',
                message: error?.message || 'Không thể lấy danh sách users online'
            });
        }
    }
};