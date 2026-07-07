import { Router } from 'express';
import { resolveToken, createOrder, getOrderStatus } from '../controllers/publicController';
import { submitFeedback } from '../controllers/feedbackController';
import { initializeOrderPayment } from '../controllers/paymentController';
import { requireIdempotencyKey } from '../utils/idempotency';

const router = Router();

// Public Token Resolution
router.get('/order/:token', resolveToken);

// Public Order Creation & Tracking
router.post('/order/:token/orders', requireIdempotencyKey, createOrder);
router.get('/order/:token/orders/:orderId/status', getOrderStatus);
router.post('/order/:token/orders/:orderId/feedback', submitFeedback);
router.post('/order/:token/payments/initialize', initializeOrderPayment);

export default router;
