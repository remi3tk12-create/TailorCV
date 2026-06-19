import { Router } from 'express';
import { 
  generateCv, 
  previewCv, 
  refineCv, 
  downloadCv, 
  listCvs, 
  getCvDetails, 
  historyCvs 
} from '../controllers/cvController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// POST /api/cv/generate - Main CV generation flow
// Supports optional 'originalCv' file upload alongside JSON form parameters
router.post('/generate', authenticateToken, upload.single('originalCv'), generateCv);

// POST /api/cv/preview - Preview tailored CV structure instantly without saving or consuming free slots
router.post('/preview', authenticateToken, previewCv);

// POST /api/cv/refine/:id - Refine CV using custom URL parameter
router.post('/refine/:id', authenticateToken, refineCv);
router.post('/:id/refine', authenticateToken, refineCv);

// POST /api/cv/premium/refine - Official premium refinement session endpoint
router.post('/premium/refine', authenticateToken, refineCv);

// GET /api/cv/history - List user's tailored CVs (paginated, e.g. ?page=1&limit=10)
router.get('/history', authenticateToken, historyCvs);

// GET /api/cv/list - Full list of user's CVs (unpaginated)
router.get('/list', authenticateToken, listCvs);

// GET /api/cv/:id - Fetch a saved CV's full structural details and metadata
router.get('/:id', authenticateToken, getCvDetails);

// GET /api/cv/:id/download - Stream the generated PDF for downloading
router.get('/:id/download', authenticateToken, downloadCv);
router.get('/download/:id', authenticateToken, downloadCv);

export default router;
