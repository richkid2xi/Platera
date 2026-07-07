import { Router } from 'express';
import { getStaff, createStaff, updateStaffStatus, deleteStaff } from '../controllers/staffController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { checkSubscriptionAccess } from '../middleware/subscriptionMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(checkSubscriptionAccess);

router.get('/', authorize(Role.OWNER, Role.MANAGER), getStaff);
router.post('/', authorize(Role.OWNER, Role.MANAGER), createStaff);
router.patch('/:id/status', authorize(Role.OWNER, Role.MANAGER), updateStaffStatus);
router.delete('/:id', authorize(Role.OWNER, Role.MANAGER), deleteStaff);

export default router;
