import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { createTableSchema, updateTableSchema } from '../utils/schemas';
import { logAction } from '../utils/auditLogger';

export const getTables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;

    const tables = await prisma.table.findMany({
      where: { restaurantId, status: 'ACTIVE' },
      include: {
        tokens: {
          where: { isActive: true },
          take: 1
        }
      },
      orderBy: { tableNumber: 'asc' }
    });

    const formattedTables = tables.map(table => ({
      ...table,
      activeToken: table.tokens[0]?.token || null
    }));

    res.json(formattedTables);
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const data = createTableSchema.parse(req.body);

    const token = crypto.randomBytes(16).toString('hex');

    const table = await prisma.table.create({
      data: {
        restaurantId,
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        tokens: {
          create: [{ token }]
        }
      },
      include: {
        tokens: true
      }
    });

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Created — Table '${table.tableNumber}' by ${req.user!.name}`,
      entityType: 'Table',
      entityId: table.id
    });

    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const tableId = req.params.id as string;
    const data = updateTableSchema.parse(req.body);

    const table = await prisma.table.findFirst({
      where: { id: tableId, restaurantId, status: 'ACTIVE' }
    });

    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        capacity: data.capacity
      }
    });

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Edited — Table '${updatedTable.tableNumber}' by ${req.user!.name}`,
      entityType: 'Table',
      entityId: updatedTable.id
    });

    res.json(updatedTable);
  } catch (error) {
    next(error);
  }
};

export const regenerateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const tableId = req.params.id as string;

    const table = await prisma.table.findFirst({
      where: { id: tableId, restaurantId, status: 'ACTIVE' }
    });

    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const token = crypto.randomBytes(16).toString('hex');

    const updatedTable = await prisma.$transaction(async (tx) => {
      // Invalidate existing tokens
      await tx.tableToken.updateMany({
        where: { tableId, isActive: true },
        data: { isActive: false }
      });

      // Update table QR and create new token
      return tx.table.update({
        where: { id: tableId },
        data: {
          tokens: {
            create: [{ token }]
          }
        },
        include: { tokens: { where: { isActive: true } } }
      });
    });

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Token regenerated — Table '${table.tableNumber}' by ${req.user!.name}`,
      entityType: 'Table',
      entityId: table.id
    });

    res.json(updatedTable);
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const tableId = req.params.id as string;

    const table = await prisma.table.findFirst({ 
      where: { id: tableId, restaurantId, status: 'ACTIVE' },
      include: {
        orders: {
          where: {
            status: { notIn: ['SERVED', 'CANCELLED'] }
          },
          take: 1
        }
      }
    });

    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    if (table.orders.length > 0) {
      res.status(400).json({ error: 'Cannot delete table with active orders' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.tableToken.updateMany({ 
        where: { tableId },
        data: { isActive: false }
      });
      await tx.table.update({ 
        where: { id: tableId },
        data: { status: 'INACTIVE' }
      });
    });

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Deleted — Table '${table.tableNumber}' by ${req.user!.name}`,
      entityType: 'Table',
      entityId: table.id
    });

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    next(error);
  }
};
