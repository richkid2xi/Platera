import prisma from '../utils/prisma';
import { deductInventoryForOrder } from './inventoryService';
import { OrderStatus, PaymentStatus, PaymentMethod, OrderSource } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';

export const createOrderInternal = async (
  restaurantId: string,
  tableId: string,
  source: OrderSource,
  data: {
    items: any[];
    paymentMethod: string;
    customerName?: string;
    notes?: string;
  },
  forcePaid: boolean = false
) => {
  return await prisma.$transaction(async (tx) => {
    let computedTotal = 0;
    const orderItemsData: any[] = [];

    for (const item of data.items) {
      const menuItem = await tx.menuItem.findUnique({
        where: { id: item.menuItemId },
        include: { variants: true, addOns: true }
      });

      if (!menuItem || !menuItem.available || menuItem.restaurantId !== restaurantId) {
        throw new Error(`Item ${item.menuItemId} is not available.`);
      }

      let itemPrice = Number(menuItem.price);

      if (item.selectedVariantId) {
        const variant = menuItem.variants.find(v => v.id === item.selectedVariantId);
        if (variant) {
          itemPrice += Number(variant.priceModifier);
        }
      }

      const selectedAddOns = [];
      if (item.selectedAddOnIds && item.selectedAddOnIds.length > 0) {
        for (const addOnId of item.selectedAddOnIds) {
          const addOn = menuItem.addOns.find(a => a.id === addOnId);
          if (addOn) {
            itemPrice += Number(addOn.price);
            selectedAddOns.push({ addOnId: addOn.id });
          }
        }
      }

      computedTotal += itemPrice * item.quantity;

      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: itemPrice,
        notes: item.notes ? sanitizeHtml(item.notes) : null,
        selectedVariantId: item.selectedVariantId,
        selectedAddOns: {
          create: selectedAddOns
        }
      });
    }

    const paymentStatus = forcePaid ? PaymentStatus.PAID : PaymentStatus.PENDING;

    const newOrder = await tx.order.create({
      data: {
        restaurantId,
        tableId,
        source,
        status: OrderStatus.NEW,
        paymentStatus,
        paymentMethod: data.paymentMethod as PaymentMethod,
        total: computedTotal,
        customerName: data.customerName ? sanitizeHtml(data.customerName) : null,
        notes: data.notes ? sanitizeHtml(data.notes) : null,
        items: {
          create: orderItemsData
        }
      },
      include: {
        table: true,
        items: {
          include: { menuItem: true }
        }
      }
    });

    await deductInventoryForOrder(tx, newOrder.id, restaurantId);

    return newOrder;
  });
};
