import { Router } from 'express';

const router = Router();

// POST /api/cv/generate - Main CV generation endpoint
router.post('/generate', async (req, res, next) => {
  try {
    const { jobDescription, skills, companyWebsiteUrl } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }
    
    // Placeholder response with structured data
    return res.status(200).json({
      message: 'CV generation started successfully (placeholder)',
      cvId: 'mock-cv-id-9999',
      status: 'pending',
      jobTitle: 'Software Engineer',
      companyName: 'Example Inc'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cv/preview - Preview the adapted CV structure
router.post('/preview', async (req, res, next) => {
  try {
    const { jobDescription, skills } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }
    
    // Return mock structured preview
    return res.status(200).json({
      message: 'CV preview generated (placeholder)',
      preview: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        whyThisRole: 'I am highly drawn to Example Inc because of your commitment to excellence and modern tech stacks...',
        skills: skills || ['JavaScript', 'Node.js', 'Express', 'React'],
        experience: [
          {
            role: 'Senior Developer',
            company: 'Previous Corp',
            description: 'Led development of highly performant web applications.'
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
