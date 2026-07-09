import prisma from '../utils/prisma';
import { InventoryChangeReason, Prisma } from '@prisma/client';
import { emitToRestaurant } from '../websocket/socket';

export const deductInventoryForOrder = async (
  tx: Prisma.TransactionClient, 
  orderId: string, 
  restaurantId: string
): Promise<void> => {
  // Fetch order items with their quantities and menu item details
  const orderItems = await tx.orderItem.findMany({
    where: { orderId },
    select: {
      menuItemId: true,
      quantity: true,
    }
  });

  // Get a default system/owner user for automated logs once
  const owner = await tx.user.findFirst({
    where: { restaurantId, role: 'OWNER' }
  });

  for (const item of orderItems) {
    // Find inventory links for this menu item
    const links = await tx.menuItemInventoryLink.findMany({
      where: { menuItemId: item.menuItemId }
    });

    for (const link of links) {
      const quantityToDeduct = link.quantityUsedPerOrder.toNumber() * item.quantity;

      // Update inventory stock atomically
      const updateResult = await tx.inventoryItem.updateMany({
        where: { 
          id: link.inventoryItemId,
          currentStock: { gte: quantityToDeduct }
        },
        data: {
          currentStock: { decrement: quantityToDeduct }
        }
      });

      if (updateResult.count === 0) {
        const err = new Error(`Insufficient stock for inventory item ID: ${link.inventoryItemId}`);
        (err as any).status = 400;
        throw err;
      }

      // Fetch the updated item to log and check thresholds
      const inventoryItem = await tx.inventoryItem.findUnique({
        where: { id: link.inventoryItemId }
      });

      if (!inventoryItem) continue;

      if (owner) {
        // Log the usage
        await tx.inventoryLog.create({
          data: {
            inventoryItemId: inventoryItem.id,
            userId: owner.id,
            changeAmount: -quantityToDeduct,
            reason: InventoryChangeReason.USAGE
          }
        });
      }

      // Check threshold and emit if crossed
      if (inventoryItem.currentStock.toNumber() <= inventoryItem.lowStockThreshold.toNumber()) {
        emitToRestaurant(restaurantId, 'inventory:low_stock', {
          inventoryItemId: inventoryItem.id,
          name: inventoryItem.name,
          currentStock: inventoryItem.currentStock,
          threshold: inventoryItem.lowStockThreshold,
        });
      }
    }
  }
};
