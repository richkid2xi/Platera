import { Router, json } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me, checkEmail, forgotPassword, verifyOTP, resetPassword } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window`
  message: { error: 'Too many login attempts, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 registration requests per `window`
  message: { error: 'Too many registration attempts, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/check-email', checkEmail);
router.post('/forgot-password', json(), forgotPassword);
router.post('/verify-otp', json(), verifyOTP);
router.post('/reset-password', json(), resetPassword);
router.get('/me', authenticate, me);

export default router;
