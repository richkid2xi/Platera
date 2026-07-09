import { Router } from 'express';
import { updateMe, uploadAvatar, getUserActivity } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import multer from 'multer';

// Use memory storage for Multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

router.use(authenticate);

router.put('/me', updateMe);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);
router.get('/activity', getUserActivity);

export default router;
