import prisma from './prisma';
import { SubscriptionStatus } from '@prisma/client';
import * as Sentry from '@sentry/node';

export const startSubscriptionCron = () => {
  // Run daily (stubbed as 24h interval)
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  setInterval(async () => {
    try {
      const now = new Date();

      // 1. Check for expired current periods to move to GRACE_PERIOD
      const toGracePeriod = await prisma.restaurant.findMany({
        where: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          currentPeriodEndsAt: { lt: now },
        }
      });

      for (const restaurant of toGracePeriod) {
        const graceEnd = new Date(restaurant.currentPeriodEndsAt!.getTime() + 72 * 60 * 60 * 1000);
        await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: {
            subscriptionStatus: SubscriptionStatus.GRACE_PERIOD,
            gracePeriodEndsAt: graceEnd,
          }
        });
      }

      // 2. Check for expired grace periods or trials to move to LOCKED
      const toLock = await prisma.restaurant.findMany({
        where: {
          OR: [
            {
              subscriptionStatus: SubscriptionStatus.GRACE_PERIOD,
              gracePeriodEndsAt: { lt: now },
            },
            {
              subscriptionStatus: SubscriptionStatus.TRIAL,
              trialEndsAt: { lt: now },
            }
          ]
        }
      });

      for (const restaurant of toLock) {
        await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: {
            subscriptionStatus: SubscriptionStatus.LOCKED,
          }
        });
      }

      console.log(`Cron: Updated ${toGracePeriod.length} to GRACE_PERIOD, ${toLock.length} to LOCKED`);
    } catch (error) {
      console.error('Failed to run subscription cron', error);
      Sentry.captureException(error);
    }
  }, ONE_DAY);

  console.log('Subscription cron started.');
};
