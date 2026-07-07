import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/metrics', authorize(Role.OWNER, Role.MANAGER), getDashboardMetrics);

export default router;
