const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient();

async function run() {
  const tableToken = await prisma.tableToken.findFirst({
    where: { isActive: true },
    include: { table: { include: { restaurant: { include: { menuItems: true } } } } }
  });

  if (!tableToken) {
    console.log("No active table token found");
    return;
  }
  
  const menuItem = tableToken.table.restaurant.menuItems[0];
  if (!menuItem) {
    console.log("No menu items found for restaurant");
    return;
  }

  const data = JSON.stringify({
    paymentMethod: 'CASH',
    items: [{
      menuItemId: menuItem.id,
      quantity: 1,
      selectedAddOnIds: [],
    }]
  });

  console.log("Making request to:", `/api/v1/public/order/${tableToken.token}/orders`);
  console.log("Payload:", data);

  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/public/order/${tableToken.token}/orders`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Idempotency-Key': 'test-12345678-abc'
    }
  }, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
  });

  req.on('error', console.error);
  req.write(data);
  req.end();
}

run().catch(console.error).finally(() => prisma.$disconnect());
