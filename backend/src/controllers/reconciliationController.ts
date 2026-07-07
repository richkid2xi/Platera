import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { Role, ReconciliationStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const getReconciliationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const getTodayStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: today, lt: tomorrow },
        status: { not: 'CANCELLED' }
      }
    });

    let totalRevenue = 0;
    let expectedCash = 0;
    let expectedDigital = 0;

    for (const order of orders) {
      const amount = Number(order.total);
      totalRevenue += amount;
      if (order.paymentMethod === 'CASH') {
        expectedCash += amount;
      } else {
        expectedDigital += amount;
      }
    }

    res.json({
      totalRevenue,
      expectedCash,
      expectedDigital,
      totalOrdersCount: orders.length
    });
  } catch (error) {
    next(error);
  }
};

export const runReconciliation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already reconciled
    const existing = await prisma.dailyReconciliation.findUnique({
      where: { restaurantId_date: { restaurantId, date: today } }
    });

    if (existing) {
      res.status(400).json({ error: 'Reconciliation for today has already been run.' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: today, lt: tomorrow },
        status: { not: 'CANCELLED' }
      }
    });

    let totalRevenue = 0;
    const revenueByMethod = { cash: 0, momo: 0, card: 0, paystack: 0 };

    for (const order of orders) {
      const amount = Number(order.total);
      totalRevenue += amount;
      
      const method = (order.paymentMethod || 'CASH').toLowerCase() as keyof typeof revenueByMethod;
      if (revenueByMethod[method] !== undefined) {
        revenueByMethod[method] += amount;
      }
    }

    const rec = await prisma.dailyReconciliation.create({
      data: {
        restaurantId,
        date: today,
        totalOrdersCount: orders.length,
        totalRevenue,
        revenueByPaymentMethod: revenueByMethod,
        expectedInventoryUsage: {},
        actualInventoryLogged: {},
        discrepancies: {},
        status: ReconciliationStatus.PENDING_REVIEW
      }
    });

    // Also return the stats payload
    res.status(201).json({
      totalRevenue,
      expectedCash: revenueByMethod.cash,
      expectedDigital: revenueByMethod.momo + revenueByMethod.card + revenueByMethod.paystack,
      reconciliationId: rec.id
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyReconciliation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Date query parameter is required (YYYY-MM-DD)' });
      return;
    }

    const parsedDate = getReconciliationSchema.parse({ date });
    
    const targetDate = new Date(parsedDate.date);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: 'Invalid date' });
      return;
    }

    const reconciliation = await prisma.dailyReconciliation.findUnique({
      where: {
        restaurantId_date: {
          restaurantId,
          date: targetDate
        }
      }
    });

    if (!reconciliation) {
      res.status(404).json({ error: 'No reconciliation record found for this date' });
      return;
    }

    res.json(reconciliation);
  } catch (error) {
    next(error);
  }
};

export const getReconciliationHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const { startDate, endDate } = req.query;

    const whereClause: any = { restaurantId };
    
    if (startDate && typeof startDate === 'string') {
      whereClause.date = { ...whereClause.date, gte: new Date(startDate) };
    }
    if (endDate && typeof endDate === 'string') {
      whereClause.date = { ...whereClause.date, lte: new Date(endDate) };
    }

    const history = await prisma.dailyReconciliation.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: 30 // default to last 30 entries
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

const physicalCountSchema = z.object({
  counts: z.record(z.string(), z.number().min(0)) // { "inventoryItemId": 50 }
});

export const submitPhysicalCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;
    const data = physicalCountSchema.parse(req.body);

    const reconciliation = await prisma.dailyReconciliation.findFirst({
      where: { id, restaurantId }
    });

    if (!reconciliation) {
      res.status(404).json({ error: 'Reconciliation not found' });
      return;
    }

    // A more advanced system would compute an additional variance here between `currentStock` 
    // and `data.counts`, but for the prompt, we just store it and mark it submitted.
    const updated = await prisma.dailyReconciliation.update({
      where: { id },
      data: {
        physicalCountSubmitted: true,
        physicalCounts: data.counts
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const resolveSchema = z.object({
  note: z.string().optional()
});

export const resolveDiscrepancy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = resolveSchema.parse(req.body);

    const reconciliation = await prisma.dailyReconciliation.findFirst({
      where: { id, restaurantId }
    });

    if (!reconciliation) {
      res.status(404).json({ error: 'Reconciliation not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const rec = await tx.dailyReconciliation.update({
        where: { id },
        data: { status: ReconciliationStatus.RECONCILED }
      });

      await tx.auditLog.create({
        data: {
          restaurantId,
          userId,
          action: `Resolved discrepancy for reconciliation ${id}. ${data.note ? 'Note: ' + data.note : ''}`,
          entityType: 'DAILY_RECONCILIATION',
          entityId: id
        }
      });

      return rec;
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
