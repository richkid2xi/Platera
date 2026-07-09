import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export const getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const { period } = req.query; // 'week', 'month', 'year'

    // Define date range
    const now = new Date();
    const startDate = new Date();
    if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // default week
      startDate.setDate(now.getDate() - 7);
    }

    const prevStartDate = new Date(startDate);
    if (period === 'month') {
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
    } else if (period === 'year') {
      prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
    } else {
      prevStartDate.setDate(prevStartDate.getDate() - 7);
    }

    const [orders, prevOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: startDate },
          status: { not: OrderStatus.CANCELLED }
        },
        include: {
          table: true,
          items: { include: { menuItem: { include: { category: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: prevStartDate, lt: startDate },
          status: { not: OrderStatus.CANCELLED }
        }
      })
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

    const prevTotalRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const prevTotalOrders = prevOrders.length;
    const prevAvgOrderValue = prevTotalOrders > 0 ? (prevTotalRevenue / prevTotalOrders) : 0;

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const diff = current - previous;
      const pct = Math.round((diff / previous) * 100);
      return pct > 0 ? `+${pct}%` : `${pct}%`;
    };

    const revenueChange = calculateTrend(totalRevenue, prevTotalRevenue);
    const ordersChange = calculateTrend(totalOrders, prevTotalOrders);
    const avgChange = calculateTrend(Number(avgOrderValue), prevAvgOrderValue);

    // Daily trends
    const dailyMap: Record<string, { revenue: number; orders: number }> = {};
    const paymentMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};
    const tableMap: Record<string, { orders: number; revenue: number }> = {};

    let totalItems = 0;

    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { revenue: 0, orders: 0 };
      dailyMap[dateStr].revenue += Number(order.total);
      dailyMap[dateStr].orders += 1;

      paymentMap[order.paymentMethod] = (paymentMap[order.paymentMethod] || 0) + Number(order.total);

      if (order.table) {
        const tName = `Table ${order.table.tableNumber}`;
        if (!tableMap[tName]) tableMap[tName] = { orders: 0, revenue: 0 };
        tableMap[tName].orders += 1;
        tableMap[tName].revenue += Number(order.total);
      }

      for (const item of order.items) {
        const catName = item.menuItem.category.name;
        categoryMap[catName] = (categoryMap[catName] || 0) + item.quantity;
        totalItems += item.quantity;
      }
    }

    const daily = Object.entries(dailyMap).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date));

    // Category Breakdown %
    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: totalItems > 0 ? Math.round((value / totalItems) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].name : 'N/A';
    const topCategoryShare = categoryBreakdown.length > 0 ? `${categoryBreakdown[0].value}%` : '0%';

    // Payment Methods %
    const paymentColors: Record<string, string> = { CASH: '#4DB696', MOMO: '#FFC107', CARD: '#4361EE', PAYSTACK: '#FF6B35' };
    const paymentMethods = Object.entries(paymentMap).map(([method, val]) => ({
      method,
      value: totalRevenue > 0 ? Math.round((val / totalRevenue) * 100) : 0,
      color: paymentColors[method] || '#cbd5e1'
    }));

    // Table Performance
    const tablePerformance = Object.entries(tableMap).map(([table, data]) => ({
      table,
      orders: data.orders,
      revenue: `GH₵ ${data.revenue.toFixed(2)}`
    })).sort((a, b) => b.orders - a.orders);

    // Recent Transactions
    const recentTransactions = orders.slice(0, 10).map(o => ({
      id: o.id,
      item: o.items.length > 0 ? `${o.items[0].menuItem.name} ${o.items.length > 1 ? `+${o.items.length - 1} more` : ''}` : 'Order',
      qty: o.items.reduce((sum, item) => sum + item.quantity, 0),
      total: `GH₵ ${Number(o.total).toFixed(2)}`,
      time: o.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: o.paymentStatus === PaymentStatus.PAID ? 'Completed' : 'Pending'
    }));

    // Best Sellers Report
    const bestSellersMap: Record<string, { id: string; name: string; category: string; quantity: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const mId = item.menuItem.id;
        if (!bestSellersMap[mId]) {
          bestSellersMap[mId] = {
            id: mId,
            name: item.menuItem.name,
            category: item.menuItem.category.name,
            quantity: 0,
            revenue: 0
          };
        }
        bestSellersMap[mId].quantity += item.quantity;
        bestSellersMap[mId].revenue += (Number(item.price) * item.quantity);
      }
    }

    const bestSellersReport = Object.values(bestSellersMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        quantity: b.quantity,
        revenue: `GH₵ ${b.revenue.toFixed(2)}`,
        trend: '+0%'
      }));

    res.json({
      summary: {
        totalRevenue: `GH₵ ${totalRevenue.toLocaleString()}`,
        revenueChange,
        totalOrders,
        ordersChange,
        avgOrderValue: `GH₵ ${avgOrderValue}`,
        avgChange,
        topCategory,
        topCategoryShare
      },
      daily,
      categoryBreakdown,
      paymentMethods,
      tablePerformance,
      recentTransactions,
      bestSellersReport
    });
  } catch (error) {
    next(error);
  }
};
