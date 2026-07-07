import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { PaymentStatus, OrderStatus, SubscriptionStatus } from '@prisma/client';
import { emitToRestaurant, emitToOrder } from '../websocket/socket';
import { env } from '../config/env';

// Initialize a payment for a specific order
export const initializeOrderPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string;

    const tableToken = await prisma.tableToken.findUnique({
      where: { token },
      include: { table: true }
    });

    if (!tableToken || !tableToken.isActive) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    // Only orders belonging to this table can be paid for via this token
    const { orderId } = req.body;
    const order = await prisma.order.findFirst({
      where: { id: orderId, tableId: tableToken.tableId },
      include: { restaurant: true }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      res.status(400).json({ error: 'Order is already paid' });
      return;
    }

    // Server-calculated amount (Paystack expects amounts in kobo/pesewas, so multiply by 100)
    // Wait, let's just assume GHS for now, multiply by 100.
    const amountInSubunits = Math.round(Number(order.total) * 100);

    // Call Paystack API (Placeholder using fetch, as node >= 18 has fetch)
    const paystackSecret = env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) throw new Error('PAYSTACK_SECRET_KEY not configured');

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: order.restaurant.contactEmail, // Using restaurant email as fallback if customer didn't provide one
        amount: amountInSubunits,
        metadata: {
          type: 'ORDER',
          orderId: order.id
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

// Webhook handler for all Paystack events
export const handlePaystackWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const secret = env.PAYSTACK_SECRET_KEY;
    
    if (!signature || !secret) {
      res.status(400).send('Missing signature or secret');
      return;
    }

    // Verify signature to prevent timing attacks
    const hash = crypto.createHmac('sha512', secret)
                       .update(JSON.stringify(req.body))
                       .digest('hex');
    
    const hashBuffer = Buffer.from(hash);
    const signatureBuffer = Buffer.from(signature);
    
    if (hashBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(hashBuffer, signatureBuffer)) {
      res.status(401).send('Invalid signature');
      return;
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const { metadata, reference } = event.data;
      const type = metadata?.type;

      if (type === 'ORDER') {
        const orderId = metadata.orderId;
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        
        if (order && order.paymentStatus !== PaymentStatus.PAID) {
          const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { 
              paymentStatus: PaymentStatus.PAID,
              paystackReference: reference
            }
          });

          emitToRestaurant(order.restaurantId, 'order:status_updated', updatedOrder);
          emitToOrder(orderId, 'order:status_updated', updatedOrder);
        }
      } else if (type === 'SUBSCRIPTION') {
        const restaurantId = metadata.restaurantId;
        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        
        if (restaurant) {
          const newPeriodEndsAt = new Date();
          newPeriodEndsAt.setDate(newPeriodEndsAt.getDate() + 30); // Add 30 days

          await prisma.$transaction(async (tx) => {
            await tx.restaurant.update({
              where: { id: restaurantId },
              data: {
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                currentPeriodEndsAt: newPeriodEndsAt,
                gracePeriodEndsAt: null
              }
            });

            await tx.subscriptionPayment.create({
              data: {
                restaurantId,
                amount: event.data.amount / 100, // converting back from subunits
                status: 'SUCCESS',
                paystackReference: reference
              }
            });
          });
        }
      }
    }

    // Always respond 200 OK to Paystack
    res.sendStatus(200);
  } catch (error: any) {
    // Add specific context for sentry if desired, or let global handler catch it
    // Wait, webhook failure is critical.
    error.isWebhookFailure = true;
    next(error);
  }
};
