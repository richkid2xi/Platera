import { Router } from 'express';
import { 
  initializeSubscriptionPayment, 
  getSubscriptionStatus, 
  getBillingHistory 
} from '../controllers/subscriptionController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';
import { requireIdempotencyKey } from '../utils/idempotency';

const router = Router();

router.use(authenticate); // Note: we don't apply checkSubscriptionAccess here, because they need to be able to access billing to unlock a LOCKED account!

router.post('/initialize', authorize(Role.OWNER), requireIdempotencyKey, initializeSubscriptionPayment);
router.get('/status', getSubscriptionStatus);
router.get('/billing-history', getBillingHistory);

export default router;
