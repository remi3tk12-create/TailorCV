import { Router } from 'express';
import { generateCv, previewCv, refineCv, downloadCv, listCvs } from '../controllers/cvController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// POST /api/cv/generate - Main CV generation flow
// Supports optional 'originalCv' file upload alongside JSON form parameters
router.post('/generate', authenticateToken, upload.single('originalCv'), generateCv);

// POST /api/cv/preview - Preview tailored CV structure instantly without saving or consuming free slots
router.post('/preview', authenticateToken, previewCv);

// POST /api/cv/refine/:id - Refine an existing CV using natural language instructions (Premium Feature)
router.post('/refine/:id', authenticateToken, refineCv);
router.post('/:id/refine', authenticateToken, refineCv); // Support both URL formats

// GET /api/cv/list - Fetch the list of tailored CV history
router.get('/list', authenticateToken, listCvs);

// GET /api/cv/:id/download - Stream the generated PDF for downloading
router.get('/:id/download', authenticateToken, downloadCv);
router.get('/download/:id', authenticateToken, downloadCv); // Support both URL formats

export default router;
