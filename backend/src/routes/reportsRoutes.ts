import { Router } from 'express';
import { getReports } from '../controllers/reportsController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.get('/', authorize(Role.OWNER, Role.MANAGER), getReports);

export default router;
