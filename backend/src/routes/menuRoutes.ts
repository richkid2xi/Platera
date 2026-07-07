import { Router } from 'express';
import multer from 'multer';
import { 
  getMenu, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  updateMenuAvailability,
  deleteMenuItem,
  uploadMenuImage
} from '../controllers/menuController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { checkSubscriptionAccess } from '../middleware/subscriptionMiddleware';
import { Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);
router.use(checkSubscriptionAccess);

// Everyone can view the menu
router.get('/', getMenu);

// Category routes
router.post('/categories', authorize(Role.OWNER, Role.MANAGER), createCategory);
router.put('/categories/:id', authorize(Role.OWNER, Role.MANAGER), updateCategory);
router.delete('/categories/:id', authorize(Role.OWNER, Role.MANAGER), deleteCategory);

// Menu Item routes
router.post('/items', authorize(Role.OWNER, Role.MANAGER), createMenuItem);
router.put('/items/:id', authorize(Role.OWNER, Role.MANAGER), updateMenuItem);
router.delete('/items/:id', authorize(Role.OWNER, Role.MANAGER), deleteMenuItem);
router.patch('/items/:id/availability', authorize(Role.OWNER, Role.MANAGER, Role.STAFF), updateMenuAvailability);
router.post('/items/:id/image', authorize(Role.OWNER, Role.MANAGER), upload.single('image'), uploadMenuImage);

export default router;
