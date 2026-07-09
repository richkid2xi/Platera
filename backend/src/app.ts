import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
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
import settingsRoutes from './routes/settingsRoutes';
import userRoutes from './routes/userRoutes';
// Global Rate Limiter — tuned for multi-staff restaurant environment
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // 500 req/15min per IP — allows multiple staff on the same network
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.', code: 'RATE_LIMIT_EXCEEDED' },
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
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
      'req.body.password',
      'req.body.token'
    ],
    censor: '[Redacted]',
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent']
      }
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    })
  },
  ...(env.NODE_ENV !== 'production' && {
    transport: { target: 'pino-pretty', options: { colorize: true, sync: false } }
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
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/users', userRoutes);

// System Logs Endpoint
app.post('/api/v1/system/logs', (req, res) => {
  const logPath = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath, { recursive: true });
  }
  const errorMsg = `[FRONTEND ERROR] [${new Date().toISOString()}] ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync(path.join(logPath, 'error.log'), errorMsg);
  res.status(200).json({ success: true });
});

import { ZodError } from 'zod';

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

  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = undefined;

  // Handle Zod Validation Errors gracefully
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues;
  } else if (err.message === 'INSUFFICIENT_STOCK') {
    statusCode = 400;
    message = 'Not enough stock available for this operation.';
    err.code = 'INSUFFICIENT_STOCK';
  }

  // Log full errors to the server output so we can trace 500s locally/in logs
  if (statusCode >= 400) {
    req.log.error({ err, stack: err.stack }, message);
    
    // Also append to global error.log
    const logPath = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
    }
    const errorMsg = `[BACKEND ERROR] [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${statusCode} - ${message} - ${err.stack || JSON.stringify(errors)}\n`;
    fs.appendFileSync(path.join(logPath, 'error.log'), errorMsg);
  }

  // Do not leak stack traces in production
  res.status(statusCode).json({
    error: message,
    code: err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'),
    ...(errors && { details: errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
