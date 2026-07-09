import { PrismaClient, Role, Status, SubscriptionStatus, OrderStatus, PaymentStatus, PaymentMethod, InventoryChangeReason, ReconciliationStatus, OrderSource } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Platera realistic restaurant data...');

  const TEST_EMAIL = 'owner@platera-test.com';
  const TEST_PASSWORD = 'Test1234!';
  const RESTAURANT_NAME = 'The Golden Plantain';

  // Wipe existing data for this restaurant to ensure a clean slate
  const existingRestaurant = await prisma.restaurant.findFirst({
    where: { contactEmail: TEST_EMAIL },
  });

  if (existingRestaurant) {
    console.log('Cleaning up existing test restaurant data...');
    // Delete in reverse dependency order
    await prisma.dailyReconciliation.deleteMany({ where: { restaurantId: existingRestaurant.id } });
    await prisma.orderItemAddOn.deleteMany({ where: { orderItem: { order: { restaurantId: existingRestaurant.id } } } });
    await prisma.orderItem.deleteMany({ where: { order: { restaurantId: existingRestaurant.id } } });
    await prisma.feedbackItemRating.deleteMany({ where: { feedback: { restaurantId: existingRestaurant.id } } });
    await prisma.feedback.deleteMany({ where: { restaurantId: existingRestaurant.id } });
    await prisma.order.deleteMany({ where: { restaurantId: existingRestaurant.id } });
    await prisma.menuItemInventoryLink.deleteMany({ where: { menuItem: { restaurantId: existingRestaurant.id } } });
    await prisma.inventoryLog.deleteMany({ where: { inventoryItem: { restaurantId: existingRestaurant.id } } });
    await prisma.inventoryItem.deleteMany({ where: { restaurantId: existingRestaurant.id } });
    await prisma.menuItemVariant.deleteMany({ where: { menuItem: { restaurantId: existingRestaurant.id } } });
    await prisma.menuItemAddOn.deleteMany({ where: { menuItem: { restaurantId: existingRestaurant.id } } });
    await prisma.menuItem.deleteMany({ where: { restaurantId: existingRestaurant.id } });
    await prisma.menuCategory.deleteMany({ where: { restaurantId: existingRestaurant.id } });
    await prisma.tableToken.deleteMany({ where: { table: { restaurantId: existingRestaurant.id } } });
    await prisma.table.deleteMany({ where: { restaurantId: existingRestaurant.id } });
    await prisma.user.deleteMany({ where: { restaurantId: existingRestaurant.id } });
    await prisma.auditLog.deleteMany({ where: { restaurantId: existingRestaurant.id } });
    await prisma.restaurant.delete({ where: { id: existingRestaurant.id } });
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const restaurant = await prisma.restaurant.create({
    data: {
      name: RESTAURANT_NAME,
      contactPhone: '+233540000000',
      contactEmail: TEST_EMAIL,
      address: '15 Oxford Street, Osu, Accra',
      subscriptionStatus: SubscriptionStatus.TRIAL,
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      // Using the user's provided test paystack key if available, else a dummy one
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
    },
  });

  const owner = await prisma.user.create({
    data: {
      restaurantId: restaurant.id,
      email: TEST_EMAIL,
      passwordHash: hashedPassword,
      phone: '+233540000000',
      name: 'Kwame Mensah',
      role: Role.OWNER,
      status: Status.ACTIVE,
    },
  });

  // Create Tables
  const tables = [];
  for (let i = 1; i <= 8; i++) {
    const table = await prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        tableNumber: `${i}`,
        capacity: i % 2 === 0 ? 4 : 2,
        qrCodeUrl: `https://platera.app/qr/${restaurant.id}/t${i}`,
      }
    });
    tables.push(table);
  }

  // Create Inventory Items
  const invChicken = await prisma.inventoryItem.create({
    data: { restaurantId: restaurant.id, name: 'Chicken Thighs', unit: 'kg', currentStock: 15, lowStockThreshold: 5 }
  });
  const invRice = await prisma.inventoryItem.create({
    data: { restaurantId: restaurant.id, name: 'Jollof Rice Base', unit: 'kg', currentStock: 20, lowStockThreshold: 10 }
  });
  const invPlantain = await prisma.inventoryItem.create({
    data: { restaurantId: restaurant.id, name: 'Plantain', unit: 'bunches', currentStock: 8, lowStockThreshold: 4 }
  });
  const invBeef = await prisma.inventoryItem.create({
    data: { restaurantId: restaurant.id, name: 'Beef Suya', unit: 'kg', currentStock: 10, lowStockThreshold: 3 }
  });
  const invBeer = await prisma.inventoryItem.create({
    data: { restaurantId: restaurant.id, name: 'Club Beer', unit: 'bottles', currentStock: 48, lowStockThreshold: 24 }
  });
  // Add purchases (RESTOCK) for the inventory items to simulate history
  const inventoryItems = [invChicken, invRice, invPlantain, invBeef, invBeer];
  for (const item of inventoryItems) {
    await prisma.inventoryLog.create({
      data: {
        inventoryItemId: item.id,
        userId: owner.id,
        changeAmount: Number(item.currentStock) + 5, // Simulate they bought more than current stock originally
        reason: InventoryChangeReason.RESTOCK,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    });
  }
  // Create Categories
  const catStarters = await prisma.menuCategory.create({
    data: { restaurantId: restaurant.id, name: 'Starters', displayOrder: 1 }
  });
  const catMains = await prisma.menuCategory.create({
    data: { restaurantId: restaurant.id, name: 'Main Courses', displayOrder: 2 }
  });
  const catDrinks = await prisma.menuCategory.create({
    data: { restaurantId: restaurant.id, name: 'Drinks', displayOrder: 3 }
  });

  // Create Menu Items
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catStarters.id,
      name: 'Kelewele',
      description: 'Spicy fried plantain cubes with peanuts.',
      price: 35.00,
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800',
      prepTime: 10,
      popular: true,
      inventoryLinks: {
        create: [{ inventoryItemId: invPlantain.id, quantityUsedPerOrder: 0.2 }]
      }
    }
  });

  const jollof = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catMains.id,
      name: 'Assorted Meat Jollof',
      description: 'Classic Ghanaian Jollof rice served with chicken, beef, and fried plantain.',
      price: 120.00,
      imageUrl: 'https://images.unsplash.com/photo-1628296375005-9b2f6ef82928?auto=format&fit=crop&q=80&w=800',
      prepTime: 25,
      popular: true,
      inventoryLinks: {
        create: [
          { inventoryItemId: invRice.id, quantityUsedPerOrder: 0.4 },
          { inventoryItemId: invChicken.id, quantityUsedPerOrder: 0.2 },
          { inventoryItemId: invBeef.id, quantityUsedPerOrder: 0.1 },
          { inventoryItemId: invPlantain.id, quantityUsedPerOrder: 0.1 },
        ]
      }
    }
  });

  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catMains.id,
      name: 'Grilled Tilapia with Banku',
      description: 'Fresh grilled tilapia with spicy pepper sauce and hot banku.',
      price: 150.00,
      imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=800',
      prepTime: 35,
      available: false, // Make one item unavailable to show UI
    }
  });

  const beer = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDrinks.id,
      name: 'Club Premium Lager',
      description: 'Chilled local beer.',
      price: 25.00,
      imageUrl: 'https://images.unsplash.com/photo-1614316311776-8ab635038c1f?auto=format&fit=crop&q=80&w=800',
      prepTime: 2,
      inventoryLinks: {
        create: [{ inventoryItemId: invBeer.id, quantityUsedPerOrder: 1 }]
      }
    }
  });

  // Helper for random choice
  const randEl = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const menuList = [
    { item: jollof, price: 120.00 },
    { item: beer, price: 25.00 },
    // Kelewele is first created item, let's just use jollof and beer for simplicity
  ];

  // 1. Generate Historical Orders (Past 6 months)
  console.log('Generating 6 months of historical orders (this may take a few seconds)...');
  const pastOrders = [];
  const now = new Date();
  
  for (let i = 0; i < 400; i++) {
    const daysAgo = randInt(1, 180);
    const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    date.setHours(randInt(11, 22), randInt(0, 59), 0, 0); // Random time between 11 AM and 10 PM
    
    const isCustomerApp = Math.random() > 0.5;
    const isCash = Math.random() > 0.6;
    
    // Pick 1-3 random items
    const itemCount = randInt(1, 3);
    const orderItems = [];
    let total = 0;
    
    for(let j = 0; j < itemCount; j++) {
      const chosen = randEl(menuList);
      const qty = randInt(1, 3);
      orderItems.push({ menuItemId: chosen.item.id, quantity: qty, price: chosen.price });
      total += chosen.price * qty;
    }
    
    pastOrders.push({
      restaurantId: restaurant.id,
      tableId: randEl(tables).id,
      status: OrderStatus.SERVED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: isCash ? PaymentMethod.CASH : randEl([PaymentMethod.MOMO, PaymentMethod.CARD]),
      total: total,
      source: isCustomerApp ? OrderSource.CUSTOMER_APP : OrderSource.STAFF_MANUAL,
      createdAt: date,
      items: { create: orderItems }
    });
  }

  // Insert past orders sequentially to avoid massive payload issues
  for (const po of pastOrders) {
    await prisma.order.create({ data: po });
  }
  
  // 2. Create Active Orders for Today (Live Dashboard)
  console.log('Generating active live orders...');
  const activeStatuses = [OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY];
  
  for (let i = 0; i < 8; i++) {
    const isCustomerApp = Math.random() > 0.5;
    const minsAgo = randInt(5, 45); // Recent orders
    const date = new Date(now.getTime() - (minsAgo * 60 * 1000));
    
    // Pick 1-2 random items
    const itemCount = randInt(1, 2);
    const orderItems = [];
    let total = 0;
    
    for(let j = 0; j < itemCount; j++) {
      const chosen = randEl(menuList);
      const qty = randInt(1, 2);
      orderItems.push({ menuItemId: chosen.item.id, quantity: qty, price: chosen.price });
      total += chosen.price * qty;
    }
    
    await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        tableId: randEl(tables).id,
        status: randEl(activeStatuses),
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: isCustomerApp ? PaymentMethod.MOMO : PaymentMethod.CASH,
        total: total,
        source: isCustomerApp ? OrderSource.CUSTOMER_APP : OrderSource.STAFF_MANUAL,
        createdAt: date,
        items: { create: orderItems }
      }
    });
  }

  console.log(`✅ Realistic test data seeded successfully!`);
  console.log(`   Email:    ${TEST_EMAIL}`);
  console.log(`   Password: ${TEST_PASSWORD}`);
  console.log(`   Restaurant: ${RESTAURANT_NAME}`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
