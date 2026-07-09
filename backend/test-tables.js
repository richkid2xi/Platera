const { PrismaClient } = require('@prisma/client');
const http = require('http');
require('dotenv').config();

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({
    where: { role: 'OWNER' }
  });

  if (!user) {
    console.log("No owner found");
    return;
  }
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ 
    id: user.id,
    restaurantId: user.restaurantId,
    role: user.role,
    name: user.name
  }, process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production', { expiresIn: '1h' });

  // 1. Create a table
  const createData = JSON.stringify({
    tableNumber: `T-${Math.floor(Math.random() * 1000)}`,
    capacity: 4
  });

  const createReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/tables`,
    method: 'POST',
    headers: {
      'Cookie': `platera_auth_session=${token}`,
      'Content-Type': 'application/json',
      'Content-Length': createData.length
    }
  }, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Create Status:', res.statusCode, 'Body:', body);
      
      // 2. Fetch tables list
      const getReq = http.request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/v1/tables`,
        method: 'GET',
        headers: {
          'Cookie': `platera_auth_session=${token}`
        }
      }, getRes => {
        let getBody = '';
        getRes.on('data', chunk => getBody += chunk);
        getRes.on('end', () => console.log('Get Status:', getRes.statusCode, 'Body:', getBody));
      });
      getReq.end();
    });
  });

  createReq.on('error', console.error);
  createReq.write(createData);
  createReq.end();
}

run().catch(console.error).finally(() => prisma.$disconnect());
