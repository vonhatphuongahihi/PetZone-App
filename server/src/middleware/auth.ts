import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                error: 'Không có token',
                message: 'Token xác thực là bắt buộc'
            });
        }

        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        const decoded = jwt.verify(token, jwtSecret) as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true
            }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                error: 'Token vô hiệu',
                message: 'Không tìm thấy user hoặc user đã bị vô hiệu hóa'
            });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            error: 'Token vô hiệu',
            message: 'Token xác thực không hợp lệ hoặc đã hết hạn'
        });
    }
};

export const sellerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'SELLER') {
        return res.status(403).json({
            error: 'Truy cập bị từ chối',
            message: 'Quyền seller là bắt buộc'
        });
    }
    next();
};
