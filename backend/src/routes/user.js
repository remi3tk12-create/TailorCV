import { Router } from 'express';

const router = Router();

// GET /api/user/cvs - List user's generated CVs
router.get('/cvs', async (req, res, next) => {
  try {
    // Return mock list of CVs
    return res.status(200).json({
      message: 'User CVs retrieved (placeholder)',
      cvs: [
        {
          id: 'mock-cv-id-1',
          jobTitle: 'Software Engineer',
          companyName: 'Example Inc',
          status: 'completed',
          createdAt: new Date().toISOString()
        },
        {
          id: 'mock-cv-id-2',
          jobTitle: 'Product Manager',
          companyName: 'Innovation Corp',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    next(error);
  }
});

export default router;
