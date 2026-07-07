import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { SubscriptionStatus } from '@prisma/client';

export const checkSubscriptionAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.user.restaurantId },
      select: { subscriptionStatus: true },
    });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found', code: 'NOT_FOUND' });
      return;
    }

    if (restaurant.subscriptionStatus === SubscriptionStatus.LOCKED) {
      // Allow only billing/renewal endpoints to proceed if locked
      // In a real app we might check req.path, but for now block all protected endpoints
      res.status(403).json({ error: 'Subscription is locked', code: 'SUBSCRIPTION_LOCKED' });
      return;
    }

    if (restaurant.subscriptionStatus === SubscriptionStatus.GRACE_PERIOD) {
      // Append warning header
      res.set('X-Subscription-Warning', 'GRACE_PERIOD');
    }

    next();
  } catch (error) {
    next(error);
  }
};
