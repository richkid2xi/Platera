import express from 'express';
import supertest from 'supertest';
import app from './src/app';
import prisma from './src/utils/prisma';
import jwt from 'jsonwebtoken';

async function run() {
  const user = await prisma.user.findFirst({ include: { restaurant: true } });
  if (!user) {
    console.log("No user found");
    return;
  }

  const token = jwt.sign(
    { userId: user.id, restaurantId: user.restaurantId, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );

  const endpoints = [
    '/api/v1/dashboard/metrics',
    '/api/v1/orders',
    '/api/v1/menu',
    '/api/v1/tables',
    '/api/v1/inventory',
    '/api/v1/inventory/logs',
    '/api/v1/reports',
    '/api/v1/feedback',
    '/api/v1/feedback/insights',
    '/api/v1/staff',
    '/api/v1/settings',
    '/api/v1/audit-logs'
  ];

  for (const ep of endpoints) {
    try {
      const res = await supertest(app)
        .get(ep)
        .set('Cookie', [`platera_auth_session=${token}`]);
      
      console.log(`${ep} -> ${res.status}`);
      if (res.status >= 500) {
        console.error(`ERROR on ${ep}:`, res.body || res.text);
      }
    } catch (err) {
      console.error(`Exception on ${ep}:`, err);
    }
  }
}

run().catch(console.error).finally(() => process.exit(0));
