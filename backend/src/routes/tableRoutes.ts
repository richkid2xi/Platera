import { Router } from 'express';
import { getTables, createTable, regenerateToken, deleteTable, updateTable } from '../controllers/tableController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { checkSubscriptionAccess } from '../middleware/subscriptionMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(checkSubscriptionAccess);

router.get('/', getTables);
router.post('/', authorize(Role.OWNER, Role.MANAGER), createTable);
router.put('/:id', authorize(Role.OWNER, Role.MANAGER), updateTable);
router.post('/:id/regenerate-token', authorize(Role.OWNER, Role.MANAGER), regenerateToken);
router.delete('/:id', authorize(Role.OWNER, Role.MANAGER), deleteTable);

export default router;
