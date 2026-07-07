import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { updateOrderStatusSchema, cancelOrderSchema, createOrderSchema } from '../utils/schemas';
import { OrderStatus, Role, OrderSource, PaymentStatus } from '@prisma/client';
import { emitToRestaurant, emitToOrder } from '../websocket/socket';
import { createOrderInternal } from '../services/orderService';

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const { status, tableId } = req.query;

    const whereClause: any = { restaurantId };
    if (status) whereClause.status = status;
    if (tableId) whereClause.tableId = tableId;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: { 
        table: true,
        items: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;

    const order = await prisma.order.findFirst({
      where: { id, restaurantId },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
            selectedVariant: true,
            selectedAddOns: { include: { addOn: true } }
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

const STATUS_ORDER: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.SERVED,
];

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const userId = req.user!.id;
    // Just fetch the user's name for the audit log from DB, or we can use the name from JWT if we had it.
    // For now, let's query the user to get their name
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userName = user?.name || 'Unknown User';
    
    const id = req.params.id as string;
    const data = updateOrderStatusSchema.parse(req.body);

    const order = await prisma.order.findFirst({ where: { id, restaurantId } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status === OrderStatus.CANCELLED) {
      res.status(400).json({ error: 'Cannot transition from CANCELLED' });
      return;
    }

    // Validate sequential transitions
    const currentIndex = STATUS_ORDER.indexOf(order.status);
    const newIndex = STATUS_ORDER.indexOf(data.status);

    if (newIndex < currentIndex) {
      res.status(400).json({ error: 'Cannot transition backwards in status' });
      return;
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updatedCount = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status: data.status }
      });

      if (updatedCount.count === 0) {
        res.status(409).json({ error: 'Order status was modified by another request. Please refresh.', code: 'CONFLICT' });
        throw new Error('Optimistic lock failed on order status update');
      }

      const updated = await tx.order.findUnique({ where: { id } });
      if (!updated) throw new Error('Order not found after update');

      await tx.auditLog.create({
        data: {
          restaurantId,
          userId,
          action: `Order ORD-${id} marked as ${data.status} by ${userName}`,
          entityType: 'ORDER',
          entityId: id
        }
      });

      return updated;
    });

    // Emit websocket events
    emitToRestaurant(restaurantId, 'order:status_updated', updatedOrder);
    emitToOrder(id, 'order:status_updated', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    
    if (role !== Role.OWNER && role !== Role.MANAGER) {
      res.status(403).json({ error: 'Forbidden: Only managers can cancel orders' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userName = user?.name || 'Unknown User';

    const id = req.params.id as string;
    const data = cancelOrderSchema.parse(req.body);

    const order = await prisma.order.findFirst({ where: { id, restaurantId } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updatedCount = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status: OrderStatus.CANCELLED }
      });

      if (updatedCount.count === 0) {
        res.status(409).json({ error: 'Order status was modified by another request. Please refresh.', code: 'CONFLICT' });
        throw new Error('Optimistic lock failed on cancel order');
      }

      const updated = await tx.order.findUnique({ where: { id } });
      if (!updated) throw new Error('Order not found after update');

      await tx.auditLog.create({
        data: {
          restaurantId,
          userId,
          action: `Order ORD-${id} CANCELLED by ${userName}. Reason: ${data.reason}`,
          entityType: 'ORDER',
          entityId: id
        }
      });

      // Optionally, here we might return inventory stock back if it was already deducted.
      // But the prompt does not specify returning stock on cancellation, so we will skip it unless instructed.

      return updated;
    });

    emitToRestaurant(restaurantId, 'order:status_updated', updatedOrder);
    emitToOrder(id, 'order:status_updated', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const createManualOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const userId = req.user!.id;
    const data = createOrderSchema.parse(req.body);
    
    if (!req.body.tableId) {
      res.status(400).json({ error: 'tableId is required for manual order' });
      return;
    }

    const table = await prisma.table.findFirst({ where: { id: req.body.tableId, restaurantId } });
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const forcePaid = data.paymentMethod === 'CASH';

    const order = await createOrderInternal(
      restaurantId,
      req.body.tableId,
      OrderSource.STAFF_MANUAL,
      data,
      forcePaid
    );

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const name = user?.name || 'Staff';

    await prisma.auditLog.create({
      data: {
        restaurantId,
        userId,
        action: `Order ORD-${order.id} manually entered for Table ${table.tableNumber} by ${name}`,
        entityType: 'ORDER',
        entityId: order.id
      }
    });

    emitToRestaurant(restaurantId, 'order:new', order);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const confirmManualPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const userId = req.user!.id;
    const id = req.params.id as string;

    const order = await prisma.order.findFirst({ where: { id, restaurantId } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      res.status(400).json({ error: 'Order is already marked as paid' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: { paymentStatus: PaymentStatus.PAID }
      });

      const user = await tx.user.findUnique({ where: { id: userId } });
      const name = user?.name || 'Staff';

      await tx.auditLog.create({
        data: {
          restaurantId,
          userId,
          action: `Payment for manual order ORD-${id} confirmed by ${name}`,
          entityType: 'ORDER',
          entityId: id
        }
      });

      return o;
    });

    emitToRestaurant(restaurantId, 'order:status_updated', updated);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
