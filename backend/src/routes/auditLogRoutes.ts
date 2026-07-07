import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { checkSubscriptionAccess } from '../middleware/subscriptionMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(checkSubscriptionAccess);

// Audit logs are highly sensitive operational history, so OWNER only.
router.get('/', authorize(Role.OWNER), getAuditLogs);

export default router;
