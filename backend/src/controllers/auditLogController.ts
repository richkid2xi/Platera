import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const { entityType, startDate, endDate } = req.query;

    const whereClause: any = { restaurantId };
    
    if (entityType) {
      whereClause.entityType = entityType as string;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};
