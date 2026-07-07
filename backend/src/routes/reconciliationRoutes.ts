import { Router } from 'express';
import { 
  getDailyReconciliation, 
  getReconciliationHistory, 
  submitPhysicalCount, 
  resolveDiscrepancy,
  getTodayStats,
  runReconciliation
} from '../controllers/reconciliationController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/stats/today', authorize(Role.OWNER, Role.MANAGER), getTodayStats);
router.post('/run', authorize(Role.OWNER, Role.MANAGER), runReconciliation);
router.get('/', authorize(Role.OWNER, Role.MANAGER), getDailyReconciliation);
router.get('/history', authorize(Role.OWNER, Role.MANAGER), getReconciliationHistory);
// Staff might need to submit counts at end of day, but requirement says Owner/Manager. Let's allow Staff too as requested.
router.post('/:id/physical-count', authorize(Role.OWNER, Role.MANAGER, Role.STAFF), submitPhysicalCount);
router.patch('/:id/resolve', authorize(Role.OWNER, Role.MANAGER), resolveDiscrepancy);

export default router;
