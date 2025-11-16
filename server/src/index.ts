import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import morgan from 'morgan';
import { Server } from "socket.io"; // THÊM DÒNG NÀY
import addressRoutes from './routes/address';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/category';
import chatRoutes from './routes/chat';
import productRoutes from './routes/product';
import storeRoutes from './routes/store';
import supportRoutes from './routes/support';
import userRoutes from './routes/user';

// Type alias để tránh lỗi export
type SocketInstance = Server;

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            process.env.FRONTEND_URL || 'http://localhost:8081',
            'http://localhost:8082',
            'http://localhost:19006',
            'http://localhost:19000',
            'http://127.0.0.1:8081',
            'http://127.0.0.1:8082',
        ];
        if (!origin) return callback(null, true);
        if (allowed.some((o) => origin.startsWith(o)) || /http:\/\/\d+\.\d+\.\d+\.\d+:(8081|8082|19006|19000)/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'PetZone API is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/support', supportRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    const status = typeof err?.status === 'number' ? err.status : 500;
    const safeMessage = process.env.NODE_ENV === 'development' ? err?.message || 'Unknown error' : 'Lỗi hệ thống nội bộ';
    res.status(status).json({ error: 'Lỗi!', message: safeMessage });
});

process.on('SIGINT', async () => {
    console.log('⏳ Đang tắt server một cách an toàn (SIGINT)...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('⏳ Đang tắt server một cách an toàn (SIGTERM)...');
    await prisma.$disconnect();
    process.exit(0);
});

const httpServer = http.createServer(app);

// === THÊM CORS CHO SOCKET.IO ===
const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:8081",
            "http://localhost:19006",
            "http://10.0.2.2:8081",
            "http://127.0.0.1:8081",
            "exp://10.143.19.127:8081",        // THAY IP MÁY BẠN
            "http://10.143.19.127:8081",       // THAY IP MÁY BẠN
            "http://192.168.1.x:8081",         // Mạng nhà
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    path: "/socket.io",
    transports: ["websocket", "polling"]
});

// Export socket instance
export const getSocketInstance = () => io;

// Khởi động server
httpServer.listen(PORT, () => {
    console.log(`🚀 PetZone API + Socket đang chạy trên cổng ${PORT}`);
});

export default app;