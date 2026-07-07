import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createOrderSchema } from '../utils/schemas';
import { OrderSource } from '@prisma/client';
import { emitToRestaurant } from '../websocket/socket';
import sanitizeHtml from 'sanitize-html';
import { menuCache } from '../utils/cache';
import { createOrderInternal } from '../services/orderService';

export const resolveToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string;
    
    const tableToken = await prisma.tableToken.findUnique({
      where: { token },
      include: {
        table: {
          include: {
            restaurant: true
          }
        }
      }
    });

    if (!tableToken || !tableToken.isActive) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const { table } = tableToken;
    const { restaurant } = table;

    // Check Cache
    const cacheKey = `menu_${restaurant.id}`;
    let menu = menuCache.get<any>(cacheKey);

    if (!menu) {
      const menuCategories = await prisma.menuCategory.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { displayOrder: 'asc' },
        include: {
          menuItems: {
            where: { available: true },
            include: {
              variants: true,
              addOns: true
            }
          }
        }
      });

      menu = menuCategories.map(category => ({
        id: category.id,
        name: category.name,
        displayOrder: category.displayOrder,
        items: category.menuItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          category: category.name, 
          image: item.imageUrl,
          available: item.available,
          popular: item.popular,
          prepTime: item.prepTime,
          variants: item.variants.map(v => ({
            id: v.id,
            name: v.name,
            priceModifier: Number(v.priceModifier),
          })),
          addOns: item.addOns.map(a => ({
            id: a.id,
            name: a.name,
            price: Number(a.price),
          })),
        }))
      }));

      menuCache.set(cacheKey, menu);
    }

    res.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        logoUrl: restaurant.logoUrl,
        paystackPublicKey: restaurant.paystackPublicKey,
      },
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
      },
      menu
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string;
    const data = createOrderSchema.parse(req.body);

    const tableToken = await prisma.tableToken.findUnique({
      where: { token },
      include: { table: true }
    });

    if (!tableToken || !tableToken.isActive) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const { id: tableId, restaurantId } = tableToken.table;

    // Start transaction for order + inventory deduction
    const order = await createOrderInternal(
      restaurantId, 
      tableId, 
      OrderSource.CUSTOMER_APP, 
      data
    );

    // Emit event to admin room
    emitToRestaurant(restaurantId, 'order:new', order);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string;
    const orderId = req.params.orderId as string;

    const tableToken = await prisma.tableToken.findUnique({
      where: { token },
      include: { table: true }
    });

    if (!tableToken || !tableToken.isActive) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        tableId: tableToken.tableId 
      },
      include: {
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
