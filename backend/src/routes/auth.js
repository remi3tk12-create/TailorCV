import { Router } from 'express';
import { signup, login, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Support both /signup and /register for maximum frontend compatibility
router.post('/signup', signup);
router.post('/register', signup);

router.post('/login', login);

// Support both /profile and /me for profile retrieval
router.get('/profile', authenticateToken, getProfile);
router.get('/me', authenticateToken, getProfile);

export default router;
