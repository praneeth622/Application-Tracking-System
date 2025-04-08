import express from 'express';
import { 
  checkDuplicateResume, 
  saveResume, 
  getUserResumes, 
  getResumeById, 
  deleteResume 
} from '../controllers/resumeController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply authentication middleware 
router.use(authenticate);

// Resume routes
router.post('/check-duplicate', checkDuplicateResume);
router.post('/', saveResume);
router.get('/', getUserResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

export default router;