import express from 'express';
import cors from 'cors';
import path from 'path';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import tableRoutes from './routes/tables';
import authRoutes from './routes/auth';
import historyRoutes from './routes/history';
import { handleSSEConnection } from './sse';
import { getDatabase } from './database';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 이미지 정적 파일 서빙
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// SSE endpoint (관리자 실시간 주문 스트림)
app.get('/api/stores/:storeId/events', handleSSEConnection);

// Routes
app.use('/api', authRoutes);
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', tableRoutes);
app.use('/api', historyRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (마지막에 등록)
app.use(errorHandler);

// Initialize database
getDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Table Order Backend running on http://localhost:${PORT}`);
});

export default app;
