import { Request, Response, NextFunction } from 'express';
import { admin } from '../utils/firebase-admin';
import User from '../models/User';

// Extend Request to include user data
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role?: string;
    [key: string]: any;
  };
}

// Middleware to authenticate users with Firebase
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('[AUTH] Authenticating request to:', req.method, req.originalUrl);
  
  // If bypass auth is enabled, skip authentication
  if (process.env.BYPASS_AUTH === 'true') {
    console.log('[AUTH] Bypassing authentication in development mode');
    
    // For GET requests with userId in query params
    if (req.method === 'GET' && req.query.userId) {
      const queryUserId = req.query.userId as string;
      console.log('[AUTH] Using userId from query:', queryUserId);
      
      req.user = {
        uid: queryUserId,
        email: 'dev@example.com',
        role: 'user',
      };
      return next();
    }
    
    // For POST/PUT requests with userId in the body
    if ((req.method === 'POST' || req.method === 'PUT') && req.body && req.body.userId) {
      console.log('[AUTH] Using userId from body:', req.body.userId);
      
      req.user = {
        uid: req.body.userId,
        email: 'dev@example.com',
        role: 'user',
      };
      return next();
    }
    
    // Default test user for other requests
    console.log('[AUTH] Using default test user');
    req.user = {
      uid: 'test-user-123',
      email: 'dev@example.com',
      role: 'user',
    };
    return next();
  }

  try {
    // Check if the authorization header exists
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Add the verified user to the request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: decodedToken.role || 'user', // Default to 'user' role if not specified
      };
      
      return next();
    } catch (tokenError: unknown) {
      const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error';
      console.error('[AUTH] Token verification failed:', errorMessage);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('[AUTH] Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user has admin role
export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized: Admin access required' });
  }
  
  return next();
};