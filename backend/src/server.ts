import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from './config/env';
import http from 'http';
import { initWebSocket } from './websocket/socket';
import { startSubscriptionCron } from './utils/subscriptionCron';
import prisma from './utils/prisma';

// Initialize Sentry BEFORE anything else
Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0, 
  profilesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0,
  beforeSend(event) {
    // Scrub sensitive keys globally
    if (event.request && event.request.data) {
      let dataStr = typeof event.request.data === 'string' 
        ? event.request.data 
        : JSON.stringify(event.request.data);
      
      const sensitiveKeys = ['password', 'passwordHash', 'JWT_SECRET', 'PAYSTACK_SECRET_KEY'];
      
      for (const key of sensitiveKeys) {
        const regex = new RegExp(`"${key}"\\s*:\\s*"[^"]+"`, 'gi');
        dataStr = dataStr.replace(regex, `"${key}":"[FILTERED]"`);
      }
      
      try {
        event.request.data = JSON.parse(dataStr);
      } catch (e) {
        event.request.data = dataStr;
      }
    }
    return event;
  }
});

import app from './app';

const PORT = env.PORT || 8000;

// Set up HTTP Server
const server = http.createServer(app);


// Initialize WebSockets
initWebSocket(server);

// Configure Sentry express error handler AFTER all routes/middleware,
// but BEFORE custom error handlers.
Sentry.setupExpressErrorHandler(app);

// Start Subscription Cron Job
startSubscriptionCron();

// Start Server
const serverInstance = server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  
  serverInstance.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
    process.exit(0);
  });
  
  // Force close after 10s if dangling connections exist
  setTimeout(() => {
    console.error('Forcing shutdown due to lingering connections');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
