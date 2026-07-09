import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { 
  createInventoryItemSchema, 
  updateInventoryItemSchema, 
  logInventorySchema,
  linkInventorySchema
} from '../utils/schemas';
import { InventoryChangeReason, Role } from '@prisma/client';

export const getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;

    const inventory = await prisma.inventoryItem.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' }
    });

    const formattedInventory = inventory.map(item => ({
      ...item,
      lowStock: item.currentStock.toNumber() <= item.lowStockThreshold.toNumber()
    }));

    res.json(formattedInventory);
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const data = createInventoryItemSchema.parse(req.body);

    const item = await prisma.$transaction(async (tx) => {
      const createdItem = await tx.inventoryItem.create({
        data: {
          restaurantId,
          name: data.name,
          unit: data.unit,
          currentStock: data.currentStock,
          lowStockThreshold: data.lowStockThreshold,
          category: data.category
        }
      });

      await tx.auditLog.create({
        data: {
          restaurantId,
          userId: req.user!.id,
          action: `Created — Inventory Item '${data.name}' by ${req.user!.name}`,
          entityType: 'INVENTORY_ITEM',
          entityId: createdItem.id
        }
      });

      return createdItem;
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;
    const data = updateInventoryItemSchema.parse(req.body);

    const existing = await prisma.inventoryItem.findFirst({ where: { id, restaurantId } });
    if (!existing) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data
      });

      await tx.auditLog.create({
        data: {
          restaurantId,
          userId: req.user!.id,
          action: `Edited — Inventory Item '${existing.name}' by ${req.user!.name}`,
          entityType: 'INVENTORY_ITEM',
          entityId: id
        }
      });

      return updatedItem;
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;

    const existing = await prisma.inventoryItem.findFirst({ where: { id, restaurantId } });
    if (!existing) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.menuItemInventoryLink.deleteMany({ where: { inventoryItemId: id } });
      await tx.inventoryLog.deleteMany({ where: { inventoryItemId: id } });
      await tx.inventoryItem.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          restaurantId,
          userId: req.user!.id,
          action: `Deleted — Inventory Item '${existing.name}' by ${req.user!.name}`,
          entityType: 'INVENTORY_ITEM',
          entityId: id
        }
      });
    });

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const logInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const id = req.params.id as string;
    const data = logInventorySchema.parse(req.body);

    // Enforce permission splitting
    if (data.reason === InventoryChangeReason.RESTOCK || data.reason === InventoryChangeReason.ADJUSTMENT) {
      if (role !== Role.OWNER && role !== Role.MANAGER) {
        res.status(403).json({ error: 'Forbidden: Only managers can restock or adjust inventory', code: 'FORBIDDEN' });
        return;
      }
    }

    const existing = await prisma.inventoryItem.findFirst({ where: { id, restaurantId } });
    if (!existing) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Atomic guard against negative stock for sales
      const updateResult = await tx.inventoryItem.updateMany({
        where: { 
          id, 
          restaurantId,
          ...(data.changeAmount < 0 && { currentStock: { gte: Math.abs(data.changeAmount) } }) 
        },
        data: {
          currentStock: {
            increment: data.changeAmount
          },
          ...(data.reason === InventoryChangeReason.RESTOCK && { lastRestockedAt: new Date() })
        }
      });

      if (updateResult.count === 0) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      const item = await tx.inventoryItem.findUniqueOrThrow({ where: { id } });

      await tx.inventoryLog.create({
        data: {
          inventoryItemId: item.id,
          userId,
          changeAmount: data.changeAmount,
          reason: data.reason
        }
      });

      await tx.auditLog.create({
        data: {
          restaurantId,
          userId,
          action: `Logged ${data.reason} (${data.changeAmount > 0 ? '+' : ''}${data.changeAmount}) — Inventory Item '${existing.name}' by ${req.user!.name}`,
          entityType: 'INVENTORY_ITEM',
          entityId: id
        }
      });

      return item;
    });

    res.json(result);
  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ error: 'Cannot log usage: Stock cannot go below zero' });
      return;
    }
    next(error);
  }
};

export const getInventoryLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;

    const existing = await prisma.inventoryItem.findFirst({ where: { id, restaurantId } });
    if (!existing) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const logs = await prisma.inventoryLog.findMany({
      where: { inventoryItemId: id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50 logs for performance
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const getAllInventoryLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;

    const logs = await prisma.inventoryLog.findMany({
      where: {
        inventoryItem: {
          restaurantId
        }
      },
      include: {
        inventoryItem: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const linkInventoryToMenu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const menuItemId = req.params.id as string;
    const data = linkInventorySchema.parse(req.body);

    const menuItem = await prisma.menuItem.findFirst({ where: { id: menuItemId, restaurantId } });
    if (!menuItem) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Remove old links
      await tx.menuItemInventoryLink.deleteMany({
        where: { menuItemId }
      });

      // Create new ones
      await tx.menuItemInventoryLink.createMany({
        data: data.links.map(link => ({
          menuItemId,
          inventoryItemId: link.inventoryItemId,
          quantityUsedPerOrder: link.quantityUsedPerOrder
        }))
      });

      return tx.menuItemInventoryLink.findMany({ where: { menuItemId } });
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
