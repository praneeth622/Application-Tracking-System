import express from 'express';
import { 
  getCurrentUser, 
  updateUser, 
  getAllUsers, 
  updateUserRole 
} from '../controllers/authController';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// User routes
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateUser);

// Admin routes
router.get('/users', authenticate, isAdmin, getAllUsers);
router.put('/users/role', authenticate, isAdmin, updateUserRole);

export default router;
