import { Router } from 'express';
import { getSettings, updateSettings, uploadLogo } from '../controllers/settingsController';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// Only OWNERS should modify settings typically, but let's allow what the UI allows
router.get('/', authenticate, authorize('OWNER', 'MANAGER'), getSettings);
router.patch('/', authenticate, authorize('OWNER'), updateSettings);
router.post('/logo', authenticate, authorize('OWNER'), upload.single('logo'), uploadLogo);

export default router;
