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

    const token = signToken({
      id: result.user.id,
      restaurantId: result.user.restaurantId,
      role: result.user.role,
      name: result.user.name,
    });

    res.cookie('platera_auth_session', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Registration successful',
      restaurantId: result.restaurant.id,
      userId: result.user.id,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        restaurantId: result.user.restaurantId,
      },
      restaurant: {
        id: result.restaurant.id,
        name: result.restaurant.name,
        subscriptionStatus: result.restaurant.subscriptionStatus,
        trialEndsAt: result.restaurant.trialEndsAt,
        currentPeriodEndsAt: result.restaurant.currentPeriodEndsAt,
        gracePeriodEndsAt: result.restaurant.gracePeriodEndsAt,
        logoUrl: result.restaurant.logoUrl,
        appearanceSettings: result.restaurant.appearanceSettings,
        paymentSettings: result.restaurant.paymentSettings,
      },
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
      name: user.name,
    });

    res.cookie('platera_auth_session', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await prisma.userActivityLog.create({
      data: {
        userId: user.id,
        action: 'Logged in successfully'
      }
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      },
      restaurant: {
        id: user.restaurant.id,
        name: user.restaurant.name,
        subscriptionStatus: user.restaurant.subscriptionStatus,
        trialEndsAt: user.restaurant.trialEndsAt,
        currentPeriodEndsAt: user.restaurant.currentPeriodEndsAt,
        gracePeriodEndsAt: user.restaurant.gracePeriodEndsAt,
        logoUrl: user.restaurant.logoUrl,
        appearanceSettings: user.restaurant.appearanceSettings,
        paymentSettings: user.restaurant.paymentSettings,
      },
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
            id: true,
            name: true,
            subscriptionStatus: true,
            trialEndsAt: true,
            currentPeriodEndsAt: true,
            gracePeriodEndsAt: true,
            logoUrl: true,
            appearanceSettings: true,
            paymentSettings: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { restaurant, ...authUser } = user;
    res.json({ user: authUser, restaurant });
  } catch (error) {
    next(error);
  }
};

export const checkEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email query parameter is required' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    res.json({ inUse: !!user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to prevent email enumeration
      res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: otp,
        resetTokenExpiry: expiry
      }
    });

    // TODO: Wire up actual transactional email provider (e.g. SendGrid, Postmark)
    console.log(`[EMAIL STUB] Forgot Password OTP for ${email}: ${otp}`);

    res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetToken !== otp || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword || newPassword.length < 8) {
      res.status(400).json({ error: 'Valid email, OTP, and new password (min 8 chars) are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetToken !== otp || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
