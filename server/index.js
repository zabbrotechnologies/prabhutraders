import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: [join(__dirname, '../.env'), join(__dirname, '.env')] });

// Import routes
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import paymentsRouter from './routes/payments.js';

const app = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Prabhu Traders API',
    version: '1.0.0',
  });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);

// ── 404 Handler ─────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server ────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Prabhu Traders API running at http://localhost:${PORT}`);
    console.log(`📦 Products: http://localhost:${PORT}/api/products`);
    console.log(`🛒 Orders: http://localhost:${PORT}/api/orders`);
    console.log(`💳 Payments: http://localhost:${PORT}/api/payments`);
    console.log(`\n⚡ Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

export default app;
