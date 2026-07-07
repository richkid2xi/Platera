import { z } from 'zod';
import { Role, Status, PaymentMethod, OrderStatus, InventoryChangeReason } from '@prisma/client';

export const registerSchema = z.object({
  restaurantName: z.string().min(2),
  address: z.string().min(5),
  contactPhone: z.string().min(5),
  contactEmail: z.string().email(),
  userName: z.string().min(2),
  userEmail: z.string().email(),
  userPhone: z.string().min(5),
  password: z.string().min(6),
  numberOfTables: z.number().int().min(1).default(10),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
});

export const updateStaffStatusSchema = z.object({
  status: z.nativeEnum(Status),
});

export const createCategorySchema = z.object({
  name: z.string().min(2),
  displayOrder: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  displayOrder: z.number().int().optional(),
});

export const variantSchema = z.object({
  name: z.string().min(1),
  priceModifier: z.number().default(0),
});

export const addOnSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2),
  description: z.string(),
  price: z.number().min(0),
  prepTime: z.number().int().min(0).default(0),
  popular: z.boolean().default(false),
  available: z.boolean().default(true),
  image: z.string().url().optional(), // Fallback if no upload initially
  variants: z.array(variantSchema).optional().default([]),
  addOns: z.array(addOnSchema).optional().default([]),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const updateMenuAvailabilitySchema = z.object({
  available: z.boolean(),
});

// Tables
export const createTableSchema = z.object({
  tableNumber: z.string().min(1),
  capacity: z.number().int().optional(),
});

// Orders
export const createOrderSchema = z.object({
  customerName: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().min(1),
    selectedVariantId: z.string().uuid().optional(),
    selectedAddOnIds: z.array(z.string().uuid()).optional(),
    notes: z.string().optional(),
  })).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1),
});

// Inventory
export const createInventoryItemSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  currentStock: z.number().min(0),
  lowStockThreshold: z.number().min(0),
  supplier: z.string().optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const logInventorySchema = z.object({
  changeAmount: z.number(),
  reason: z.nativeEnum(InventoryChangeReason),
});

export const linkInventorySchema = z.object({
  links: z.array(z.object({
    inventoryItemId: z.string().uuid(),
    quantityUsedPerOrder: z.number().min(0),
  })).min(1),
});

// Feedback
export const createFeedbackSchema = z.object({
  overallRating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  itemRatings: z.array(z.object({
    menuItemId: z.string().uuid(),
    thumbsUp: z.boolean()
  })).optional(),
});
