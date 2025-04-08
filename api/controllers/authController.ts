import { Request, Response } from 'express';
import User from '../models/User';

// Define interface for authenticated request (same as in resumeController)
interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role?: string;
    [key: string]: any;
  };
}

// Get current user data
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const user = await User.findOne({ uid: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user data
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { name } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const user = await User.findOneAndUpdate(
      { uid: userId },
      { 
        name,
        updated_at: new Date() 
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
};

// Admin only: Get all users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('uid email name role created_at');
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Admin only: Update user role
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { uid, role } = req.body;
    
    if (!uid || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findOneAndUpdate(
      { uid },
      { 
        role,
        updated_at: new Date() 
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
};