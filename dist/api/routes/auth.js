"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const cors_1 = __importDefault(require("cors"));
const cors_2 = require("../config/cors");
const router = express_1.default.Router();
// Apply CORS to all auth routes
router.use((0, cors_1.default)(cors_2.corsOptions));
// Handle OPTIONS requests explicitly for all routes in this router
router.options('*', (0, cors_1.default)(cors_2.corsOptions));
// Add explicit preflight handling for high-traffic routes
router.options('/create-from-auth', (0, cors_1.default)(cors_2.corsOptions));
router.options('/me', (0, cors_1.default)(cors_2.corsOptions));
router.options('/make-admin', (0, cors_1.default)(cors_2.corsOptions));
// Public routes
router.post('/create-from-auth', authController_1.createUserFromAuth);
// User routes
router.get('/me', authMiddleware_1.authenticate, authController_1.getCurrentUser);
router.put('/me', authMiddleware_1.authenticate, authController_1.updateUser);
// Admin routes
router.get('/users', authMiddleware_1.authenticate, authMiddleware_1.isAdmin, authController_1.getAllUsers);
router.put('/users/role', authMiddleware_1.authenticate, authMiddleware_1.isAdmin, authController_1.updateUserRole);
// Endpoint to make a user an admin without requiring authentication
// Typically this would be restricted, but we're providing it for initial setup
router.post('/make-admin', authController_1.makeAdmin);
exports.default = router;
