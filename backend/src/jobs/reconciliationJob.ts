import prisma from '../utils/prisma';
import { OrderStatus, PaymentStatus, InventoryChangeReason, ReconciliationStatus } from '@prisma/client';
import { emitToRestaurant } from '../websocket/socket';

export const runDailyReconciliation = async (targetDate: Date = new Date()) => {
  // Truncate time to midnight for the query boundaries
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const activeRestaurants = await prisma.restaurant.findMany({
    where: { subscriptionStatus: { not: 'LOCKED' } }
  });

  for (const restaurant of activeRestaurants) {
    await reconcileRestaurant(restaurant.id, startOfDay, endOfDay);
  }
};

const reconcileRestaurant = async (restaurantId: string, start: Date, end: Date) => {
  // 1. Aggregate Orders (SERVED or PAID)
  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      createdAt: { gte: start, lte: end },
      status: { in: [OrderStatus.SERVED, OrderStatus.READY] }, 
      // Ready or Served typically means inventory was used. Cancelled are excluded.
    },
    include: {
      items: true
    }
  });

  const totalOrdersCount = orders.length;
  let totalRevenue = 0;
  const revenueByPaymentMethod = {
    CASH: 0,
    MOMO: 0,
    CARD: 0,
    PAYSTACK: 0
  };

  const expectedUsageMap = new Map<string, number>();

  for (const order of orders) {
    if (order.status !== OrderStatus.CANCELLED) {
      const amt = Number(order.total);
      totalRevenue += amt;
      const method = order.paymentMethod as keyof typeof revenueByPaymentMethod;
      if (revenueByPaymentMethod[method] !== undefined) {
        revenueByPaymentMethod[method] += amt;
      }
      
      // Calculate expected inventory deduction
      for (const item of order.items) {
        const links = await prisma.menuItemInventoryLink.findMany({
          where: { menuItemId: item.menuItemId }
        });
        
        for (const link of links) {
          const expectedDeduction = Number(link.quantityUsedPerOrder) * item.quantity;
          const current = expectedUsageMap.get(link.inventoryItemId) || 0;
          expectedUsageMap.set(link.inventoryItemId, current + expectedDeduction);
        }
      }
    }
  }

  // 3. Sum actual InventoryLog entries for USAGE
  const logs = await prisma.inventoryLog.findMany({
    where: {
      inventoryItem: { restaurantId },
      createdAt: { gte: start, lte: end },
      reason: InventoryChangeReason.USAGE
    }
  });

  const actualUsageMap = new Map<string, number>();
  for (const log of logs) {
    // changeAmount is negative for usage
    const usage = Math.abs(Number(log.changeAmount));
    const current = actualUsageMap.get(log.inventoryItemId) || 0;
    actualUsageMap.set(log.inventoryItemId, current + usage);
  }

  // 4. Compute Discrepancies
  const expectedInventoryUsage: any[] = [];
  const actualInventoryLogged: any[] = [];
  const discrepancies: any[] = [];
  let hasFlaggedVariance = false;
  const TOLERANCE_PERCENT = 0.02; // 2% tolerance

  const allItemIds = new Set([...expectedUsageMap.keys(), ...actualUsageMap.keys()]);

  for (const itemId of allItemIds) {
    const expected = expectedUsageMap.get(itemId) || 0;
    const actual = actualUsageMap.get(itemId) || 0;
    
    expectedInventoryUsage.push({ inventoryItemId: itemId, expectedDeduction: expected });
    actualInventoryLogged.push({ inventoryItemId: itemId, actualDeduction: actual });

    const variance = actual - expected;
    // Check tolerance (if actual is more or less than 2% difference from expected)
    // Note: since digital system does both, they should match EXACTLY unless there are manual USAGE logs (waste, theft) 
    // or missed logs.
    const isDiscrepancy = Math.abs(variance) > (expected * TOLERANCE_PERCENT);
    
    discrepancies.push({
      inventoryItemId: itemId,
      expected,
      actual,
      variance
    });

    if (isDiscrepancy) {
      hasFlaggedVariance = true;
    }
  }

  // 5. Create DailyReconciliation record
  const status = hasFlaggedVariance ? ReconciliationStatus.DISCREPANCY_FLAGGED : ReconciliationStatus.RECONCILED;

  const recDate = new Date(start);
  
  // Upsert to handle re-runs gracefully
  const rec = await prisma.dailyReconciliation.upsert({
    where: {
      restaurantId_date: {
        restaurantId,
        date: recDate
      }
    },
    update: {
      totalOrdersCount,
      totalRevenue,
      revenueByPaymentMethod,
      expectedInventoryUsage,
      actualInventoryLogged,
      discrepancies,
      status
    },
    create: {
      restaurantId,
      date: recDate,
      totalOrdersCount,
      totalRevenue,
      revenueByPaymentMethod,
      expectedInventoryUsage,
      actualInventoryLogged,
      discrepancies,
      status
    }
  });

  if (hasFlaggedVariance) {
    emitToRestaurant(restaurantId, 'reconciliation:flagged', rec);
    // TODO: Trigger Email notification (Resend/SendGrid) to the owner
    console.log(`[Job] Reconciliation discrepancy flagged for restaurant ${restaurantId} on ${recDate}`);
  }
};
