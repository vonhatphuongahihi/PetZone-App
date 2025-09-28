# PetZone Backend API

Backend API server cho ứng dụng PetZone được xây dựng với Express.js, TypeScript, Prisma và PostgreSQL.

## 🚀 Tính năng hiện tại

- **Xác thực & Phân quyền**: JWT-based authentication với role-based access control
- **Quản lý người dùng**: Đăng ký, đăng nhập, quản lý profile
- **Database**: PostgreSQL với Prisma ORM
- **Security**: Password hashing với bcrypt, JWT tokens

## 📋 Yêu cầu hệ thống

- Node.js (v18 trở lên)
- PostgreSQL database
- npm hoặc yarn

## 🛠️ Cài đặt

1. **Di chuyển vào thư mục server**:
   ```bash
   cd server
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Thiết lập biến môi trường**:
   ```bash
   cp env.example .env
   ```
   
   Cập nhật `.env` với thông tin database:
   ```env
   DATABASE_URL="postgresql://vonhatphuongahihi:123456@localhost:5432/petzone_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   ```

4. **Thiết lập PostgreSQL database**:
   - Sử dụng Docker Compose để chạy PostgreSQL:
   ```bash
   docker-compose up -d
   ```

5. **Generate Prisma client và chạy migrations**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## 🚀 Chạy Server

### Development Mode
```bash
npm run dev
```

Server sẽ chạy trên `http://localhost:3001`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập user
- `POST /api/auth/logout` - Đăng xuất user
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Health Check
- `GET /health` - Kiểm tra trạng thái server

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  isActive  Boolean  @default(true)
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## 🔧 Development Commands

```bash
# Development
npm run dev                 # Start development server với hot reload

# Database
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run database migrations
npm run prisma:studio       # Mở Prisma Studio
npm run prisma:reset        # Reset database

# Production
npm run build              # Build TypeScript sang JavaScript
npm start                  # Start production server
```
