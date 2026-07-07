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

    const item = await prisma.inventoryItem.create({
      data: {
        restaurantId,
        name: data.name,
        unit: data.unit,
        currentStock: data.currentStock,
        lowStockThreshold: data.lowStockThreshold,
        supplier: data.supplier
      }
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

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data
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

    const updatedItem = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.update({
        where: { id },
        data: {
          currentStock: {
            increment: data.changeAmount
          },
          ...(data.reason === InventoryChangeReason.RESTOCK && { lastRestockedAt: new Date() })
        }
      });

      await tx.inventoryLog.create({
        data: {
          inventoryItemId: item.id,
          userId,
          changeAmount: data.changeAmount,
          reason: data.reason
        }
      });

      return item;
    });

    res.json(updatedItem);
  } catch (error) {
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
