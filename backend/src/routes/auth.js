import { Router } from 'express';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    // Placeholder registration logic
    return res.status(201).json({
      message: 'User signed up successfully (placeholder)',
      user: { id: 'mock-user-id', email, plan: 'free' }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    // Placeholder login logic
    return res.status(200).json({
      message: 'User logged in successfully (placeholder)',
      token: 'mock-jwt-token-12345',
      user: { id: 'mock-user-id', email, plan: 'free' }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
