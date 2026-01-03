import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';
import userRoutes from './routes/userRoutes';
import walletRoutes from './routes/walletRoutes';
import paymentRoutes from './routes/paymentRoutes';
import actionRoutes from './routes/actionRoutes';
import dataUpRoutes from './routes/dataUpRoutes';
import referralRoutes from "./routes/referralRoutes";
import { errorResponse } from './utils/response';
import cors from "cors"

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/action', actionRoutes);
app.use('/api/v1/utilities', dataUpRoutes);
app.use("/api/v1/referrals", referralRoutes);
app.use("/api/v1/referrals", referralRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  return errorResponse(res, 404, 'Route not found');
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  return errorResponse(
    res,
    err.statusCode || 500,
    err.message || 'Internal server error'
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
  );
});

export default app;

