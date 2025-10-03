import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true
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

import authRoutes from './routes/auth';
import storeRoutes from './routes/store';

app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Lỗi!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Lỗi hệ thống nội bộ'
    });
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

app.listen(PORT, () => {
    console.log(`🚀 PetZone API server đang chạy trên cổng ${PORT}`);
});

export default app;
