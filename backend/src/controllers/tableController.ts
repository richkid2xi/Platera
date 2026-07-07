import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import prisma from '../utils/prisma';
import { createTableSchema } from '../utils/schemas';

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export const getTables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;

    const tables = await prisma.table.findMany({
      where: { restaurantId },
      include: {
        tokens: {
          where: { isActive: true },
          take: 1
        }
      },
      orderBy: { tableNumber: 'asc' }
    });

    const formattedTables = tables.map(table => ({
      ...table,
      activeToken: table.tokens[0]?.token || null
    }));

    res.json(formattedTables);
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const data = createTableSchema.parse(req.body);

    const token = crypto.randomBytes(16).toString('hex');
    const orderUrl = `${env.CLIENT_URL}/order/${token}`;

    // Generate QR code image buffer
    const qrBuffer = await QRCode.toBuffer(orderUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
    });

    // Upload to Supabase Storage
    const fileName = `${restaurantId}/qr_${token}.png`;
    const { error: uploadError } = await supabase
      .storage
      .from('table-qrs') // assuming table-qrs bucket as discussed
      .upload(fileName, qrBuffer, { contentType: 'image/png' });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase
      .storage
      .from('table-qrs')
      .getPublicUrl(fileName);

    const table = await prisma.table.create({
      data: {
        restaurantId,
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        qrCodeUrl: publicUrl,
        tokens: {
          create: [{ token }]
        }
      },
      include: {
        tokens: true
      }
    });

    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
};

export const regenerateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const tableId = req.params.id as string;

    const table = await prisma.table.findFirst({
      where: { id: tableId, restaurantId }
    });

    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const token = crypto.randomBytes(16).toString('hex');
    const orderUrl = `${env.CLIENT_URL}/order/${token}`;

    const qrBuffer = await QRCode.toBuffer(orderUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
    });

    const fileName = `${restaurantId}/qr_${token}.png`;
    await supabase.storage.from('table-qrs').upload(fileName, qrBuffer, { contentType: 'image/png' });
    const { data: { publicUrl } } = supabase.storage.from('table-qrs').getPublicUrl(fileName);

    const updatedTable = await prisma.$transaction(async (tx) => {
      // Invalidate existing tokens
      await tx.tableToken.updateMany({
        where: { tableId, isActive: true },
        data: { isActive: false }
      });

      // Update table QR and create new token
      return tx.table.update({
        where: { id: tableId },
        data: {
          qrCodeUrl: publicUrl,
          tokens: {
            create: [{ token }]
          }
        },
        include: { tokens: { where: { isActive: true } } }
      });
    });

    res.json(updatedTable);
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const tableId = req.params.id as string;

    const table = await prisma.table.findFirst({ where: { id: tableId, restaurantId } });
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    // A real system might soft delete if orders exist, but we hard delete related tokens here
    await prisma.$transaction(async (tx) => {
      await tx.tableToken.deleteMany({ where: { tableId } });
      await tx.table.delete({ where: { id: tableId } });
    });

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    next(error);
  }
};
