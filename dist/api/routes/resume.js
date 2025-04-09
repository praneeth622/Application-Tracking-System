"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resumeController_1 = require("../controllers/resumeController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const cors_1 = __importDefault(require("cors"));
const cors_2 = require("../config/cors");
const router = express_1.default.Router();
// Apply CORS to all resume routes
router.use((0, cors_1.default)(cors_2.corsOptions));
// Handle OPTIONS requests explicitly for all routes
router.options('*', (0, cors_1.default)(cors_2.corsOptions));
// Add explicit preflight handling for high-traffic routes
router.options('/admin/all', (0, cors_1.default)(cors_2.corsOptions));
router.options('/check-duplicate', (0, cors_1.default)(cors_2.corsOptions));
// Apply authentication middleware to all routes
router.use(authMiddleware_1.authenticate);
// Admin routes (must come before routes with params)
router.get('/admin/all', authMiddleware_1.isAdmin, resumeController_1.getAllResumes);
// Resume routes with query parameters (must come before routes with :id)
router.get('/', resumeController_1.getUserResumes);
// Standard resume routes
router.post('/check-duplicate', resumeController_1.checkDuplicateResume);
router.post('/', resumeController_1.saveResume);
router.get('/:id', resumeController_1.getResumeById);
router.delete('/:id', resumeController_1.deleteResume);
exports.default = router;
