import { Request, Response } from 'express';
import Resume from '../models/Resume';
import { s3Client, bucketName } from '../../AWSConfig';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { analyzeResume } from '../../utils/analyze-resume';

// Define interface for request with user
interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;  // Add email to match the interface from authMiddleware
    role?: string;  // Add role to match the interface from authMiddleware
    [key: string]: any;
  };
}

// Check if a resume with the given hash already exists for this user
export const checkDuplicateResume = async (req: AuthRequest, res: Response) => {
  try {
    const { fileHash, userId } = req.body;
    // Try to get userId from request body if not in req.user (for bypass auth mode)
    const userIdentifier = req.user?.uid || userId;

    if (!userIdentifier || !fileHash) {
      return res.status(400).json({ error: 'Missing required fields: userId or fileHash' });
    }

    // Check for duplicate
    const existingResume = await Resume.findOne({
      user_id: userIdentifier,
      fileHash: fileHash
    });

    return res.status(200).json({ isDuplicate: !!existingResume });
  } catch (error) {
    console.error('Error checking for duplicate resume:', error);
    return res.status(500).json({ error: 'Failed to check for duplicate resume' });
  }
};

// Save resume data to MongoDB
export const saveResume = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      filename, 
      filelink, 
      fileHash, 
      analysis, 
      vendor_id, 
      vendor_name,
      userId  // Add userId as a potential field in the request body
    } = req.body;
    
    // Try to get userId from request body if not in req.user (for bypass auth mode)
    const userIdentifier = req.user?.uid || userId;
    
    if (!userIdentifier || !filename || !filelink || !fileHash || !analysis) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          userId: !userIdentifier,
          filename: !filename,
          filelink: !filelink,
          fileHash: !fileHash, 
          analysis: !analysis
        }
      });
    }
    
    // Check for duplicate
    const existingResume = await Resume.findOne({
      user_id: userIdentifier,
      fileHash: fileHash
    });
    
    if (existingResume) {
      return res.status(409).json({ error: 'This resume has already been uploaded' });
    }
    
    // Create new resume
    const newResume = await Resume.create({
      user_id: userIdentifier,
      filename,
      filelink,
      fileHash,
      analysis,
      vendor_id: vendor_id || null,
      vendor_name: vendor_name || null,
    });
    
    return res.status(201).json(newResume);
  } catch (error) {
    console.error('Error saving resume:', error);
    return res.status(500).json({ error: 'Failed to save resume' });
  }
};

// Get all resumes for a user
export const getUserResumes = async (req: AuthRequest, res: Response) => {
  try {
    // Debug logs to help troubleshoot
    console.log('Request query:', req.query);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    // Try to get userId from multiple places
    const queryUserId = req.query.userId as string;
    const bodyUserId = req.body?.userId;
    const userIdentifier = req.user?.uid || queryUserId || bodyUserId;
    
    console.log('Using User ID:', userIdentifier);
    
    if (!userIdentifier) {
      console.log('No user identifier found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const resumes = await Resume.find({ user_id: userIdentifier }).sort({ uploaded_at: -1 });
    console.log('Resumes found:', resumes.length);
    return res.status(200).json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return res.status(500).json({ error: 'Failed to fetch resumes' });
  }
};

// Get a single resume by ID
export const getResumeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const resume = await Resume.findOne({ _id: id, user_id: userId });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    return res.status(200).json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    return res.status(500).json({ error: 'Failed to fetch resume' });
  }
};

// Delete a resume by ID
export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const deletedResume = await Resume.findOneAndDelete({ _id: id, user_id: userId });
    
    if (!deletedResume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    return res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return res.status(500).json({ error: 'Failed to delete resume' });
  }
};

// Add this new function to get all resumes (for admin users)
export const getAllResumes = async (req: AuthRequest, res: Response) => {
  try {
    // Only admin users should be allowed to access all resumes
    console.log('Getting all resumes, user role:', req.user?.role);
    
    if (!req.user) {
      console.log('User not authenticated for getAllResumes');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (req.user.role !== 'admin') {
      console.log('User not authorized to access all resumes:', req.user.uid);
      return res.status(403).json({ error: 'Not authorized to access all resumes' });
    }

    // Get all resumes
    const resumes = await Resume.find({}).sort({ uploaded_at: -1 });
    console.log(`Found ${resumes.length} resumes in total`);
    return res.status(200).json(resumes);
  } catch (error) {
    console.error('Error fetching all resumes:', error);
    return res.status(500).json({ error: 'Failed to fetch all resumes' });
  }
};