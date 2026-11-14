import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getAnalytics);

export default router;
