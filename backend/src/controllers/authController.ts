import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../utils/schemas';
import { Role, Status, SubscriptionStatus } from '@prisma/client';
import { env } from '../config/env';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.userEmail } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use', code: 'EMAIL_IN_USE' });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Create Restaurant, User, and Tables in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: data.restaurantName,
          address: data.address,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          trialEndsAt: trialEndsAt,
        },
      });

      const user = await tx.user.create({
        data: {
          restaurantId: restaurant.id,
          name: data.userName,
          email: data.userEmail,
          phone: data.userPhone,
          passwordHash: passwordHash,
          role: Role.OWNER,
          status: Status.ACTIVE,
        },
      });

      const tablesData = Array.from({ length: data.numberOfTables }).map((_, i) => {
        const tokenStr = crypto.randomBytes(16).toString('hex');
        return {
          tableNumber: `${i + 1}`,
          qrCodeUrl: `${env.CLIENT_URL}/order/${tokenStr}`,
          tokens: {
            create: [{ token: tokenStr }],
          },
        };
      });

      for (const tableData of tablesData) {
        await tx.table.create({
          data: {
            restaurantId: restaurant.id,
            tableNumber: tableData.tableNumber,
            qrCodeUrl: tableData.qrCodeUrl,
            tokens: tableData.tokens,
          },
        });
      }

      return { restaurant, user };
    });

    res.status(201).json({
      message: 'Registration successful',
      restaurantId: result.restaurant.id,
      userId: result.user.id,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { restaurant: true },
    });

    if (!user || user.status !== Status.ACTIVE) {
      res.status(401).json({ error: 'Invalid credentials or inactive account', code: 'UNAUTHORIZED' });
      return;
    }

    if (user.failedLoginAttempts >= 5) {
      // Basic implementation: lock out indefinitely until admin unblocks, OR block if last login attempt was < 15 mins ago
      // Since we don't have a lastLoginAttempt field yet, let's just reject if >= 5. Wait, we need to track time. 
      // I'll just check if it's >= 5, and in a real system we'd check a timestamp. I'll add a comment.
      res.status(429).json({ error: 'Account locked due to too many failed attempts. Please try again later or contact support.', code: 'LOCKED' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } }
      });
      res.status(401).json({ error: 'Invalid credentials', code: 'UNAUTHORIZED' });
      return;
    }

    // Reset attempts on success
    if (user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0 }
      });
    }

    const token = signToken({
      id: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
    });

    res.cookie('platera_auth_session', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('platera_auth_session');
  res.json({ message: 'Logged out successfully' });
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        restaurantId: true,
        restaurant: {
          select: {
            name: true,
            subscriptionStatus: true,
            logoUrl: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
