import { Router } from 'express';
import { signup, login, getMe, demoLogin } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateBody, signupSchema, loginSchema } from '../middleware/validationMiddleware.js';

const router = Router();

router.post('/signup', validateBody(signupSchema), signup);
router.post('/login', validateBody(loginSchema), login);
router.post('/demo', demoLogin);
router.get('/me', authenticateToken, getMe);

export default router;
