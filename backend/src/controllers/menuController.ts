import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  createMenuItemSchema, 
  updateMenuItemSchema, 
  updateMenuAvailabilitySchema 
} from '../utils/schemas';
import { logAction } from '../utils/auditLogger';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { menuCache } from '../utils/cache';
import crypto from 'crypto';

// Supabase client for image upload
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export const getMenu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const cacheKey = `menu_${restaurantId}`;

    // Serve from cache if available
    const cached = menuCache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId },
      orderBy: { displayOrder: 'asc' },
      include: {
        menuItems: {
          include: {
            variants: true,
            addOns: true,
          },
        },
      },
    });

    // Serialize to match frontend expected shape
    const serializedMenu = categories.map(category => ({
      id: category.id,
      name: category.name,
      displayOrder: category.displayOrder,
      items: category.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        category: category.name, 
        image: item.imageUrl, // Map imageUrl to image
        available: item.available,
        popular: item.popular,
        prepTime: item.prepTime,
        variants: item.variants.map(v => ({
          name: v.name,
          priceModifier: Number(v.priceModifier),
        })),
        addOns: item.addOns.map(a => ({
          name: a.name,
          price: Number(a.price),
        })),
      }))
    }));

    // Store in cache
    menuCache.set(cacheKey, serializedMenu);

    res.json(serializedMenu);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const data = createCategorySchema.parse(req.body);

    const category = await prisma.menuCategory.create({
      data: {
        restaurantId,
        name: data.name,
        displayOrder: data.displayOrder,
      }
    });
    
    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Created — Category '${category.name}' by ${req.user!.name}`,
      entityType: 'MenuCategory',
      entityId: category.id
    });

    menuCache.del(`menu_${restaurantId}`);

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;
    const data = updateCategorySchema.parse(req.body);

    const category = await prisma.menuCategory.findFirst({ where: { id, restaurantId } });
    if (!category) {
      res.status(404).json({ error: 'Category not found', code: 'NOT_FOUND' });
      return;
    }

    const updated = await prisma.menuCategory.update({
      where: { id },
      data
    });
    
    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Updated — Category '${updated.name}' by ${req.user!.name}`,
      entityType: 'MenuCategory',
      entityId: updated.id
    });

    menuCache.del(`menu_${restaurantId}`);

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;

    const category = await prisma.menuCategory.findFirst({ where: { id, restaurantId } });
    if (!category) {
      res.status(404).json({ error: 'Category not found', code: 'NOT_FOUND' });
      return;
    }

    await prisma.menuCategory.delete({ where: { id } });

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Deleted — Category '${category.name}' by ${req.user!.name}`,
      entityType: 'MenuCategory',
      entityId: category.id
    });
    
    menuCache.del(`menu_${restaurantId}`);

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const data = createMenuItemSchema.parse(req.body);

    // Verify category belongs to restaurant
    const category = await prisma.menuCategory.findFirst({ where: { id: data.categoryId, restaurantId } });
    if (!category) {
      res.status(400).json({ error: 'Invalid category', code: 'BAD_REQUEST' });
      return;
    }

    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        prepTime: data.prepTime,
        popular: data.popular,
        available: data.available,
        imageUrl: data.image || '',
        variants: {
          create: data.variants,
        },
        addOns: {
          create: data.addOns,
        }
      },
      include: { variants: true, addOns: true }
    });
    
    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Created — Menu Item '${item.name}' by ${req.user!.name}`,
      entityType: 'MenuItem',
      entityId: item.id
    });

    menuCache.del(`menu_${restaurantId}`);

    // Serialize
    res.status(201).json({
      ...item,
      image: item.imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;
    const data = updateMenuItemSchema.parse(req.body);

    const item = await prisma.menuItem.findFirst({ where: { id, restaurantId } });
    if (!item) {
      res.status(404).json({ error: 'Menu item not found', code: 'NOT_FOUND' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If variants are provided, we replace them entirely
      if (data.variants) {
        await tx.menuItemVariant.deleteMany({ where: { menuItemId: id } });
      }
      
      // If addOns are provided, we replace them entirely
      if (data.addOns) {
        await tx.menuItemAddOn.deleteMany({ where: { menuItemId: id } });
      }

      return await tx.menuItem.update({
        where: { id },
        data: {
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          prepTime: data.prepTime,
          popular: data.popular,
          available: data.available,
          imageUrl: data.image,
          ...(data.variants && {
            variants: { create: data.variants }
          }),
          ...(data.addOns && {
            addOns: { create: data.addOns }
          })
        },
        include: { variants: true, addOns: true }
      });
    });
    
    const priceChanged = data.price !== undefined && Number(item.price) !== data.price;
    const actionDesc = priceChanged 
      ? `Menu item '${updated.name}' price changed from GHS ${item.price} to GHS ${data.price} by ${req.user!.name}`
      : `Updated — Menu Item '${updated.name}' by ${req.user!.name}`;

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: actionDesc,
      entityType: 'MenuItem',
      entityId: updated.id
    });
    
    menuCache.del(`menu_${restaurantId}`);

    res.json({
      ...updated,
      image: updated.imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;
    const data = updateMenuAvailabilitySchema.parse(req.body);

    const item = await prisma.menuItem.findFirst({ where: { id, restaurantId } });
    if (!item) {
      res.status(404).json({ error: 'Menu item not found', code: 'NOT_FOUND' });
      return;
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { available: data.available }
    });
    
    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Availability toggled to ${updated.available ? 'Available' : 'Unavailable'} — Menu Item '${updated.name}' by ${req.user!.name}`,
      entityType: 'MenuItem',
      entityId: updated.id
    });
    
    menuCache.del(`menu_${restaurantId}`);

    res.json({
      id: updated.id,
      available: updated.available
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;

    const item = await prisma.menuItem.findFirst({ where: { id, restaurantId } });
    if (!item) {
      res.status(404).json({ error: 'Menu item not found', code: 'NOT_FOUND' });
      return;
    }

    await prisma.menuItem.delete({ where: { id } });
    
    menuCache.del(`menu_${restaurantId}`);
    
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadMenuImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;
    
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided', code: 'BAD_REQUEST' });
      return;
    }

    const item = await prisma.menuItem.findFirst({ where: { id, restaurantId } });
    if (!item) {
      res.status(404).json({ error: 'Menu item not found', code: 'NOT_FOUND' });
      return;
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${restaurantId}/${id}-${crypto.randomBytes(4).toString('hex')}.${fileExt}`;

    const { data, error } = await supabase
      .storage
      .from('pictures')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('pictures')
      .getPublicUrl(fileName);

    await prisma.menuItem.update({
      where: { id },
      data: { imageUrl: publicUrl }
    });
    
    menuCache.del(`menu_${restaurantId}`);

    res.json({ image: publicUrl });
  } catch (error) {
    next(error);
  }
};
