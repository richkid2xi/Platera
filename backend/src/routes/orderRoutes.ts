import { Router } from 'express';
import { 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder,
  createManualOrder,
  confirmManualPayment
} from '../controllers/orderController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { checkSubscriptionAccess } from '../middleware/subscriptionMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(checkSubscriptionAccess);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorize(Role.OWNER, Role.MANAGER, Role.STAFF), updateOrderStatus);
router.patch('/:id/cancel', authorize(Role.OWNER, Role.MANAGER), cancelOrder);

// Manual Order Entry
router.post('/manual', authorize(Role.OWNER, Role.MANAGER, Role.STAFF), createManualOrder);
router.patch('/manual/:id/confirm-payment', authorize(Role.OWNER, Role.MANAGER, Role.STAFF), confirmManualPayment);

export default router;
