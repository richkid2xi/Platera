import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';
import { logAction } from '../utils/auditLogger';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import crypto from 'crypto';

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const updateSettingsSchema = z.object({
  profileSettings: z.any().optional(),
  paymentSettings: z.any().optional(),
  taxSettings: z.any().optional(),
  notificationSettings: z.any().optional(),
  appearanceSettings: z.any().optional(),
});

export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        profileSettings: true,
        paymentSettings: true,
        taxSettings: true,
        notificationSettings: true,
        appearanceSettings: true,
      }
    });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    res.json({
      profile: restaurant.profileSettings || {},
      paymentMethods: restaurant.paymentSettings || {},
      taxSettings: restaurant.taxSettings || {},
      notifications: restaurant.notificationSettings || {},
      appearance: restaurant.appearanceSettings || {},
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const data = updateSettingsSchema.parse(req.body);

    const updateData: any = {};
    if (data.profileSettings !== undefined) updateData.profileSettings = data.profileSettings;
    
    if (data.paymentSettings !== undefined) {
      const { momoEnabled, cashEnabled, cardEnabled } = data.paymentSettings;
      if (!momoEnabled && !cashEnabled && !cardEnabled) {
        res.status(400).json({ error: 'At least one payment method (Cash, Mobile Money, or Card) must be enabled.', code: 'BAD_REQUEST' });
        return;
      }
      updateData.paymentSettings = data.paymentSettings;
    }

    if (data.taxSettings !== undefined) updateData.taxSettings = data.taxSettings;
    if (data.notificationSettings !== undefined) updateData.notificationSettings = data.notificationSettings;
    if (data.appearanceSettings !== undefined) updateData.appearanceSettings = data.appearanceSettings;

    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: updateData,
      select: {
        profileSettings: true,
        paymentSettings: true,
        taxSettings: true,
        notificationSettings: true,
        appearanceSettings: true,
      }
    });

    const categoriesUpdated = Object.keys(updateData).map(k => k.replace('Settings', '')).join(', ');

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Edited — Settings '${categoriesUpdated}' by ${req.user!.name}`,
      entityType: 'Settings',
      entityId: restaurantId
    });

    res.json({
      profile: restaurant.profileSettings || {},
      paymentMethods: restaurant.paymentSettings || {},
      taxSettings: restaurant.taxSettings || {},
      notifications: restaurant.notificationSettings || {},
      appearance: restaurant.appearanceSettings || {},
    });
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided', code: 'BAD_REQUEST' });
      return;
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${restaurantId}/logo-${crypto.randomBytes(4).toString('hex')}.${fileExt}`;

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

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { logoUrl: publicUrl }
    });
    
    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Uploaded — Restaurant Logo by ${req.user!.name}`,
      entityType: 'Settings',
      entityId: restaurantId
    });

    res.json({ logoUrl: publicUrl });
  } catch (error) {
    next(error);
  }
};
