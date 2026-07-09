import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { createStaffSchema, updateStaffStatusSchema } from '../utils/schemas';
import { Role } from '@prisma/client';
import { logAction } from '../utils/auditLogger';

export const createStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const requesterRole = req.user!.role as Role;
    
    const data = createStaffSchema.parse(req.body);

    // Enforce role-creation restrictions
    if (requesterRole === Role.MANAGER && data.role !== Role.STAFF) {
      res.status(403).json({ error: 'Managers can only create STAFF accounts', code: 'FORBIDDEN' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use', code: 'EMAIL_IN_USE' });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        restaurantId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      }
    });

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Created — Staff '${newUser.name}' by ${req.user!.name}`,
      entityType: 'Staff',
      entityId: newUser.id
    });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const updateStaffStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const staffId = req.params.id as string;
    const data = updateStaffStatusSchema.parse(req.body);

    // Ensure staff belongs to the same restaurant
    const staff = await prisma.user.findFirst({
      where: { id: staffId, restaurantId },
    });

    if (!staff) {
      res.status(404).json({ error: 'Staff not found', code: 'NOT_FOUND' });
      return;
    }

    const updatedStaff = await prisma.user.update({
      where: { id: staffId },
      data: { status: data.status },
      select: { id: true, name: true, status: true, role: true }
    });

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Status changed to ${data.status} — Staff '${updatedStaff.name}' by ${req.user!.name}`,
      entityType: 'Staff',
      entityId: updatedStaff.id
    });

    res.json(updatedStaff);
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    
    const staff = await prisma.user.findMany({
      where: { restaurantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(staff);
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const staffId = req.params.id as string;
    const requesterId = req.user!.id;
    const requesterRole = req.user!.role as Role;

    if (staffId === requesterId) {
      res.status(400).json({ error: 'Cannot delete yourself', code: 'BAD_REQUEST' });
      return;
    }

    const staff = await prisma.user.findFirst({
      where: { id: staffId, restaurantId },
    });

    if (!staff) {
      res.status(404).json({ error: 'Staff not found', code: 'NOT_FOUND' });
      return;
    }

    if (requesterRole === Role.MANAGER && staff.role !== Role.STAFF) {
      res.status(403).json({ error: 'Managers can only delete STAFF accounts', code: 'FORBIDDEN' });
      return;
    }

    await prisma.user.update({
      where: { id: staffId },
      data: { status: 'INACTIVE' }
    });

    await logAction({
      restaurantId,
      userId: req.user!.id,
      action: `Deactivated — Staff '${staff.name}' by ${req.user!.name}`,
      entityType: 'Staff',
      entityId: staff.id
    });

    res.json({ message: 'Staff deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
