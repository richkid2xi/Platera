import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { SubscriptionStatus, Role } from '@prisma/client';
import { env } from '../config/env';

export const initializeSubscriptionPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const role = req.user!.role as Role;

    if (role !== Role.OWNER) {
      res.status(403).json({ error: 'Only owners can manage subscriptions' });
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    // Fixed plan price
    const amountInSubunits = 250 * 100; // e.g. GHS 250

    const paystackSecret = env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) throw new Error('PAYSTACK_SECRET_KEY not configured');

    const response = await fetch('https://api.api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: restaurant.contactEmail,
        amount: amountInSubunits,
        metadata: {
          type: 'SUBSCRIPTION',
          restaurantId
        }
      })
    });

    const data = await response.json();
    if (!data.status) {
      throw new Error(`Paystack initialization failed: ${data.message}`);
    }

    res.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const role = req.user!.role as Role;

    if (role !== Role.OWNER) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEndsAt: true,
        gracePeriodEndsAt: true
      }
    });

    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

export const getBillingHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const role = req.user!.role as Role;

    if (role !== Role.OWNER) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const history = await prisma.subscriptionPayment.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
};
