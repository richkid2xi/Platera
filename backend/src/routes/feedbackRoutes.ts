import { Router } from 'express';
import { 
  getFeedback, 
  getFeedbackById, 
  markFeedbackReviewed, 
  getFeedbackInsights 
} from '../controllers/feedbackController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { checkSubscriptionAccess } from '../middleware/subscriptionMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(checkSubscriptionAccess);

// All feedback endpoints require OWNER or MANAGER
router.use(authorize(Role.OWNER, Role.MANAGER));

router.get('/', getFeedback);
router.get('/insights', getFeedbackInsights); // Must be before /:id
router.get('/:id', getFeedbackById);
router.patch('/:id/reviewed', markFeedbackReviewed);

export default router;
