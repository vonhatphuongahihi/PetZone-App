// src/controllers/authController.ts
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../index';

const JWT_SECRET = (process.env.JWT_SECRET ?? 'fallback-secret-key') as jwt.Secret;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'];

function signJwt(payload: object) {
    return jwt.sign(
        payload as string | object | Buffer,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
}

function verifyJwt(token: string) {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
}

export const authController = {
    register: async (req: Request, res: Response) => {
        try {
            const { email, username, password } = req.body;

            if (!email || !username || !password) {
                return res.status(400).json({
                    error: 'Thiếu các trường bắt buộc',
                    message: 'Email, username, và password là bắt buộc'
                });
            }

            const existingUser = await prisma.user.findFirst({
                where: { OR: [{ email }, { username }] }
            });

            if (existingUser) {
                return res.status(409).json({
                    error: 'User đã tồn tại',
                    message: 'Email hoặc username đã tồn tại'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await prisma.user.create({
                data: { email, username, password: hashedPassword },
                select: { id: true, email: true, username: true, role: true, createdAt: true }
            });

            const token = signJwt({ userId: user.id, email: user.email, role: user.role });

            res.status(201).json({ message: 'User registered successfully', user, token });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Đăng ký thất bại', message: 'Đã xảy ra lỗi trong quá trình đăng ký' });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Thiếu các trường bắt buộc', message: 'Email và password là bắt buộc' });
            }

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: 'Email hoặc password không hợp lệ', message: 'Email hoặc password không hợp lệ' });
            }

            if (!user.isActive) {
                return res.status(401).json({ error: 'Tài khoản đã bị vô hiệu hóa', message: 'Tài khoản của bạn đã bị vô hiệu hóa' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Email hoặc password không hợp lệ', message: 'Email hoặc password không hợp lệ' });
            }

            const token = signJwt({ userId: user.id, email: user.email, role: user.role });
            const { password: _, ...userData } = user;

            res.json({ message: 'Login successful', user: userData, token });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Đăng nhập thất bại', message: 'Đã xảy ra lỗi trong quá trình đăng nhập' });
        }
    },

    logout: async (_req: Request, res: Response) => {
        res.json({ message: 'Logout successful' });
    },

    getMe: async (req: Request, res: Response) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'Không có token', message: 'Token xác thực là bắt buộc' });
            }

            const decoded = verifyJwt(token);
            const userId = (decoded as any).userId;
            if (!userId) {
                return res.status(401).json({ error: 'Token không hợp lệ', message: 'Token xác thực không hợp lệ' });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, username: true, role: true, createdAt: true, updatedAt: true }
            });

            if (!user) {
                return res.status(404).json({ error: 'User không tồn tại', message: 'User không tồn tại' });
            }

            res.json({ user });
        } catch (error) {
            console.error('Get me error:', error);
            res.status(401).json({ error: 'Token không hợp lệ', message: 'Token xác thực không hợp lệ hoặc đã hết hạn' });
        }
    }
};
