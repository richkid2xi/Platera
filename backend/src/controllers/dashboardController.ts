import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    
    // Top-level stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, tables, menuItems] = await Promise.all([
      prisma.order.findMany({
        where: { restaurantId, createdAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } }
      }),
      prisma.table.count({ where: { restaurantId } }),
      prisma.menuItem.count({ where: { restaurantId } })
    ]);

    const totalRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const activeOrders = todayOrders.filter(o => o.status !== 'SERVED').length;

    // Metrics for the cards
    const metrics = {
      revenue: totalRevenue,
      revenueChange: '+0%', // Placeholder without historical comparison for now
      orders: todayOrders.length,
      ordersChange: '+0%',
      activeTables: activeOrders > 0 ? Math.min(activeOrders, tables) : 0, 
      activeTablesChange: '+0',
      totalCustomers: todayOrders.length * 2, // approximation
      totalCustomersChange: '+0%'
    };

    // Sales Trend (7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: sevenDaysAgo },
        status: { not: 'CANCELLED' }
      },
      select: { createdAt: true, total: true }
    });

    const salesMap: Record<string, number> = {};
    for (const order of recentOrders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      salesMap[dateStr] = (salesMap[dateStr] || 0) + Number(order.total);
    }
    const salesTrend = Object.entries(salesMap).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));

    // Best Sellers
    const orderItems = await prisma.orderItem.findMany({
      where: { order: { restaurantId } },
      include: { menuItem: true }
    });

    const itemCounts: Record<string, { name: string; category: string; sales: number; revenue: number }> = {};
    for (const oi of orderItems) {
      if (!oi.menuItem) continue;
      const id = oi.menuItem.id;
      if (!itemCounts[id]) {
        itemCounts[id] = { name: oi.menuItem.name, category: 'Menu', sales: 0, revenue: 0 };
      }
      itemCounts[id].sales += oi.quantity;
      itemCounts[id].revenue += Number(oi.price) * oi.quantity;
    }
    const bestSellers = Object.values(itemCounts).sort((a, b) => b.sales - a.sales).slice(0, 4);

    res.json({
      metrics,
      salesTrend,
      bestSellers,
    });
  } catch (error) {
    next(error);
  }
};
