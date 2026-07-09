import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    
    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run all queries in parallel
    const [todayOrders, yesterdayOrders, tables, recentOrders] = await Promise.all([
      prisma.order.findMany({
        where: { restaurantId, createdAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } },
        select: { id: true, total: true, status: true }
      }),
      prisma.order.findMany({
        where: { restaurantId, createdAt: { gte: yesterday, lt: today }, status: { not: 'CANCELLED' } },
        select: { total: true }
      }),
      prisma.table.count({ where: { restaurantId } }),
      prisma.order.findMany({
        where: { restaurantId, createdAt: { gte: sevenDaysAgo }, status: { not: 'CANCELLED' } },
        select: { id: true, createdAt: true, total: true }
      })
    ]);

    // Fetch orderItems for Best Sellers using the recent order IDs, avoiding expensive relation filters in groupBy
    const recentOrderIds = recentOrders.map(o => o.id);
    const orderItems = recentOrderIds.length > 0 ? await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: { orderId: { in: recentOrderIds } },
      _sum: { quantity: true, price: true }, 
      orderBy: { _sum: { quantity: 'desc' } },
      take: 4
    }) : [];

    const totalRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const activeOrders = todayOrders.filter(o => o.status !== 'SERVED').length;

    // Calculate percentage changes (numeric)
    const revenueChange = yesterdayRevenue > 0
      ? Math.round(((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : 0;
    const ordersChange = yesterdayOrders.length > 0
      ? Math.round(((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100)
      : 0;

    const metrics = {
      revenue: totalRevenue,
      revenueChange,
      orders: todayOrders.length,
      ordersChange,
      activeTables: activeOrders > 0 ? Math.min(activeOrders, tables) : 0,
      activeTablesChange: 0,
      totalCustomers: todayOrders.length * 2, // approximation
      totalCustomersChange: ordersChange,
    };

    // Sales Trend (7 days)
    const salesMap: Record<string, { revenue: number, orders: number }> = {};
    for (const order of recentOrders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!salesMap[dateStr]) {
        salesMap[dateStr] = { revenue: 0, orders: 0 };
      }
      salesMap[dateStr].revenue += Number(order.total);
      salesMap[dateStr].orders += 1;
    }
    const salesTrend = Object.entries(salesMap)
      .map(([date, data]) => ({ date, revenue: data.revenue, orders: data.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Best Sellers
    // Best Sellers using the grouped data
    const topItemIds = orderItems.map(oi => oi.menuItemId);
    const topMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: topItemIds } },
      select: { id: true, name: true, price: true }
    });

    const bestSellers = orderItems.map(oi => {
      const item = topMenuItems.find(m => m.id === oi.menuItemId);
      const qty = oi._sum.quantity || 0;
      return {
        name: item?.name || 'Unknown',
        category: 'Menu',
        sales: qty,
        revenue: qty * Number(item?.price || 0)
      };
    });

    res.json({ metrics, salesTrend, bestSellers });
  } catch (error) {
    next(error);
  }
};
