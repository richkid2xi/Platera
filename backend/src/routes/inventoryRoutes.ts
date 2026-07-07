import { Router } from 'express';
import { 
  getInventory, 
  createInventoryItem, 
  updateInventoryItem, 
  logInventory, 
  getInventoryLogs,
  getAllInventoryLogs,
  linkInventoryToMenu
} from '../controllers/inventoryController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { checkSubscriptionAccess } from '../middleware/subscriptionMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(checkSubscriptionAccess);

router.get('/', getInventory);
router.get('/logs', authorize(Role.OWNER, Role.MANAGER, Role.STAFF), getAllInventoryLogs);
router.post('/', authorize(Role.OWNER, Role.MANAGER), createInventoryItem);
router.put('/:id', authorize(Role.OWNER, Role.MANAGER), updateInventoryItem);

// Inventory Logs
router.post('/:id/log', logInventory); // Authorization logic split inside the controller
router.get('/:id/logs', authorize(Role.OWNER, Role.MANAGER), getInventoryLogs);

export default router;
