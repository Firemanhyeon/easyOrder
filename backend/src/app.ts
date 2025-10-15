import express from 'express';
import cors from 'cors';
import menuRoutes from './routes/menuRoutes';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import storeRoutes from './routes/storeRoutes';
import orderRoutes from './routes/orderRoutes';

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 라우트 설정
app.use((req, res, next) => {
  console.log('Request:', req.method, req.url);
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);
// app.use('/api/qr-codes');

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('[DB URL]', process.env.DATABASE_URL);
}); 