// src/controllers/authController.ts
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { sendEmail } from '../utils/mailer';

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
    sendOtp: async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Thiếu email', message: 'Email là bắt buộc' });
            }

            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            const expiresAt = Date.now() + 5 * 60 * 1000;

            (global as any).__otpStore = (global as any).__otpStore || new Map<string, { code: string; exp: number }>();
            (global as any).__otpStore.set(email, { code: otp, exp: expiresAt });


            const html = `<p>Mã OTP của bạn là: <b>${otp}</b></p><p>Mã có hiệu lực trong 5 phút.</p>`;
            await sendEmail(email, 'PetZone - Mã xác thực OTP', html);
            res.json({ message: 'Đã gửi OTP' });
        } catch (error) {
            console.error('Lỗi gửi OTP:', error);
            res.status(500).json({ error: 'Gửi OTP thất bại' });
        }
    },

    verifyOtp: async (req: Request, res: Response) => {
        try {
            const { email, otp } = req.body as { email: string; otp: string };

            if (!email || !otp) {
                return res.status(400).json({ error: 'Thiếu thông tin', message: 'Email và OTP là bắt buộc' });
            }

            const store: Map<string, { code: string; exp: number }> = (global as any).__otpStore || new Map();

            const entry = store.get(email);

            if (!entry) {
                return res.status(400).json({ error: 'Không tìm thấy OTP', message: 'Vui lòng yêu cầu mã OTP mới' });
            }

            if (Date.now() > entry.exp) {
                store.delete(email);
                return res.status(400).json({ error: 'OTP hết hạn', message: 'Mã OTP đã hết hạn' });
            }

            if (entry.code !== otp) {
                return res.status(400).json({ error: 'OTP không hợp lệ', message: 'Mã OTP không chính xác' });
            }

            store.delete(email);
            res.json({ message: 'Xác thực OTP thành công' });
        } catch (error) {
            console.error('Lỗi xác thực OTP:', error);
            res.status(500).json({ error: 'Xác thực OTP thất bại' });
        }
    },
    register: async (req: Request, res: Response) => {
        try {
            const { email, username, password, role } = req.body;

            if (!email || !username || !password) {
                return res.status(400).json({
                    error: 'Thiếu các trường bắt buộc',
                    message: 'Email, username, và password là bắt buộc'
                });
            }

            const validRoles = ['USER', 'SELLER'];
            const userRole = role && validRoles.includes(role) ? role : 'USER';

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
                data: { email, username, password: hashedPassword, role: userRole },
                select: { id: true, email: true, username: true, role: true, createdAt: true }
            });

            const token = signJwt({ userId: user.id, email: user.email, role: user.role });

            res.status(201).json({ message: 'Đăng ký người dùng thành công', user, token });
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

            res.json({ message: 'Đăng nhập thành công', user: userData, token });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Đăng nhập thất bại', message: 'Đã xảy ra lỗi trong quá trình đăng nhập' });
        }
    },

    logout: async (_req: Request, res: Response) => {
        res.json({ message: 'Đăng xuất thành công' });
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
                select: { 
                    id: true, 
                    email: true, 
                    username: true, 
                    avatarUrl: true,
                    role: true, 
                    isActive: true, 
                    createdAt: true, 
                    updatedAt: true,
                    dateofBirth: true,
                    totalSpent: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User không tồn tại', message: 'User không tồn tại' });
            }

            res.json({ user });
        } catch (error) {
            console.error('Get me error:', error);
            res.status(401).json({ error: 'Token không hợp lệ', message: 'Token xác thực không hợp lệ hoặc đã hết hạn' });
        }
    },

    updateProfile: async (req: Request, res: Response) => {
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

            const { username, dateofBirth } = req.body;

            if (!username || username.trim() === '') {
                return res.status(400).json({ error: 'Thiếu thông tin', message: 'Tên người dùng là bắt buộc' });
            }

            // Check if username already exists for other users
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: username.trim(),
                    id: { not: userId }
                }
            });

            if (existingUser) {
                return res.status(409).json({ error: 'Username đã tồn tại', message: 'Tên người dùng này đã được sử dụng' });
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { 
                    username: username.trim(),
                    dateofBirth: dateofBirth || null
                },
                select: { 
                    id: true, 
                    email: true, 
                    username: true, 
                    avatarUrl: true,
                    role: true, 
                    isActive: true,
                    createdAt: true, 
                    updatedAt: true,
                    dateofBirth: true
                }
            });

            res.json({ 
                message: 'Cập nhật thông tin thành công', 
                user: updatedUser 
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Cập nhật thất bại', message: 'Đã xảy ra lỗi trong quá trình cập nhật thông tin' });
        }
    },
    resetPassword: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            // 1. Validate đầu vào
            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Thiếu thông tin', 
                    message: 'Email và mật khẩu mới là bắt buộc' 
                });
            }

            // 2. Kiểm tra user có tồn tại không
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return res.status(404).json({ 
                    error: 'User không tồn tại', 
                    message: 'Email không tồn tại trong hệ thống' 
                });
            }

            // 3. Mã hóa mật khẩu mới (Hash)
            const hashedPassword = await bcrypt.hash(password, 12);

            // 4. Cập nhật vào Database
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });

            res.json({ message: 'Đặt lại mật khẩu thành công' });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ 
                error: 'Lỗi server', 
                message: 'Đã xảy ra lỗi khi đặt lại mật khẩu' 
            });
        }
    },

};
