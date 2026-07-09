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

const updateMeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
});

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const restaurantId = req.user!.restaurantId;
    const data = updateMeSchema.parse(req.body);

    // Check if email is in use by someone else
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: data.email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already in use', code: 'EMAIL_IN_USE' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true
      }
    });

    await prisma.userActivityLog.create({
      data: {
        userId,
        action: 'Updated Profile Details'
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const restaurantId = req.user!.restaurantId;

    if (!req.file) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `avatars/${restaurantId}/${userId}_${crypto.randomBytes(8).toString('hex')}.${fileExt}`;

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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: publicUrl },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true
      }
    });
    
    await prisma.userActivityLog.create({
      data: {
        userId,
        action: 'Uploaded Profile Picture'
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const getUserActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    const logs = await prisma.userActivityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};
