import express from 'express';
import { 
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobCandidates,
  updateCandidateStatus,
  assignRecruiters,
  saveJobCandidates,
  getAllResumesForMatching
} from '../controllers/jobController';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Job routes - accessible by all authenticated users
router.get('/', getAllJobs);

// Get all resumes for matching (must be before /:id routes)
router.get('/resumes/all', getAllResumesForMatching);

// Job routes with ID parameter
router.get('/:id', getJobById);

// Job candidates routes
router.get('/:id/candidates', getJobCandidates);
router.put('/:id/candidates', saveJobCandidates);
router.put('/:id/candidates/:candidateId/status', updateCandidateStatus);

// Job routes - accessible only by admin or job creator
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

// Assigning recruiters to a job
router.post('/:id/recruiters', assignRecruiters);

export default router; 