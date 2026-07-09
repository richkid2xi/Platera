import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // Connection pool: handles burst concurrent requests gracefully
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
});

export default prisma;
