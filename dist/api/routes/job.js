"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobController_1 = require("../controllers/jobController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const cors_1 = __importDefault(require("cors"));
const cors_2 = require("../config/cors");
const router = express_1.default.Router();
// Apply CORS to all job routes
router.use((0, cors_1.default)(cors_2.corsOptions));
// Handle OPTIONS requests explicitly for all routes in this router
router.options('*', (0, cors_1.default)(cors_2.corsOptions));
// Add explicit preflight handling for high-traffic routes
router.options('/', (0, cors_1.default)(cors_2.corsOptions));
router.options('/resumes/all', (0, cors_1.default)(cors_2.corsOptions));
router.options('/:id/candidates', (0, cors_1.default)(cors_2.corsOptions));
router.options('/:id/candidates/:candidateId/status', (0, cors_1.default)(cors_2.corsOptions));
// Apply authentication middleware to all routes
router.use(authMiddleware_1.authenticate);
// Job routes - accessible by all authenticated users
router.get('/', jobController_1.getAllJobs);
// Get all resumes for matching (must be before /:id routes)
router.get('/resumes/all', jobController_1.getAllResumesForMatching);
// Job routes with ID parameter
router.get('/:id', jobController_1.getJobById);
// Job candidates routes
router.get('/:id/candidates', jobController_1.getJobCandidates);
router.put('/:id/candidates', jobController_1.saveJobCandidates);
router.put('/:id/candidates/:candidateId/status', jobController_1.updateCandidateStatus);
// Job routes - accessible only by admin or job creator
router.post('/', jobController_1.createJob);
router.put('/:id', jobController_1.updateJob);
router.delete('/:id', jobController_1.deleteJob);
// Assigning recruiters to a job
router.post('/:id/recruiters', jobController_1.assignRecruiters);
exports.default = router;
