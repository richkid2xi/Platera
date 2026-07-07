import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';
import { env } from './config/env';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import authRoutes from './routes/authRoutes';
import staffRoutes from './routes/staffRoutes';
import menuRoutes from './routes/menuRoutes';
import tableRoutes from './routes/tableRoutes';
import publicRoutes from './routes/publicRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import orderRoutes from './routes/orderRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import paymentRoutes from './routes/paymentRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import reconciliationRoutes from './routes/reconciliationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import reportsRoutes from './routes/reportsRoutes';
// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for public order paths
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
});

const app = express();

// Request UUID and Logging
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

app.use(pinoHttp({
  genReqId: (req: any) => req.id,
  ...(env.NODE_ENV !== 'production' && {
    transport: { target: 'pino-pretty', options: { colorize: true } }
  })
}));

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.paystack.co"],
      frameSrc: ["'self'", "https://checkout.paystack.com"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co"],
    }
  },
  hsts: {
    maxAge: 15552000,
    includeSubDomains: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // frameguard defaults to SAMEORIGIN which is fine unless we need Platera to be iframed (we don't, Paystack is the iframe we load)
  frameguard: { action: 'sameorigin' }
}));

const allowedOrigin = env.CLIENT_URL;
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/', globalLimiter);
app.use('/api/v1/public/', publicLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/webhooks', paymentRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/reconciliation', reconciliationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/public', publicRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  Sentry.withScope(scope => {
    if (req.user) {
      scope.setUser({ id: req.user.id });
      scope.setTag('restaurantId', req.user.restaurantId);
    }
    scope.setTag('route', req.originalUrl);
    if (err.isWebhookFailure) {
      scope.setTag('event_type', 'webhook_failure');
    }
    Sentry.captureException(err);
  });

  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Do not leak stack traces in production
  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
