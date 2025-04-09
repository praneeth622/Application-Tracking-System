"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllResumes = exports.deleteResume = exports.getResumeById = exports.getUserResumes = exports.saveResume = exports.checkDuplicateResume = void 0;
const Resume_1 = __importDefault(require("../models/Resume"));
// Check if a resume with the given hash already exists for this user
const checkDuplicateResume = async (req, res) => {
    var _a;
    try {
        const { fileHash, userId } = req.body;
        // Try to get userId from request body if not in req.user (for bypass auth mode)
        const userIdentifier = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || userId;
        if (!userIdentifier || !fileHash) {
            return res.status(400).json({ error: 'Missing required fields: userId or fileHash' });
        }
        // Check for duplicate
        const existingResume = await Resume_1.default.findOne({
            user_id: userIdentifier,
            fileHash: fileHash
        });
        return res.status(200).json({ isDuplicate: !!existingResume });
    }
    catch (error) {
        console.error('Error checking for duplicate resume:', error);
        return res.status(500).json({ error: 'Failed to check for duplicate resume' });
    }
};
exports.checkDuplicateResume = checkDuplicateResume;
// Save resume data to MongoDB
const saveResume = async (req, res) => {
    var _a;
    try {
        const { filename, filelink, fileHash, analysis, vendor_id, vendor_name, userId // Add userId as a potential field in the request body
         } = req.body;
        // Try to get userId from request body if not in req.user (for bypass auth mode)
        const userIdentifier = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || userId;
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
        const existingResume = await Resume_1.default.findOne({
            user_id: userIdentifier,
            fileHash: fileHash
        });
        if (existingResume) {
            return res.status(409).json({ error: 'This resume has already been uploaded' });
        }
        // Create new resume
        const newResume = await Resume_1.default.create({
            user_id: userIdentifier,
            filename,
            filelink,
            fileHash,
            analysis,
            vendor_id: vendor_id || null,
            vendor_name: vendor_name || null,
        });
        return res.status(201).json(newResume);
    }
    catch (error) {
        console.error('Error saving resume:', error);
        return res.status(500).json({ error: 'Failed to save resume' });
    }
};
exports.saveResume = saveResume;
// Get all resumes for a user
const getUserResumes = async (req, res) => {
    var _a, _b;
    try {
        // Debug logs to help troubleshoot
        console.log('Request query:', req.query);
        console.log('Request body:', req.body);
        console.log('Request user:', req.user);
        // Try to get userId from multiple places
        const queryUserId = req.query.userId;
        const bodyUserId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId;
        const userIdentifier = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.uid) || queryUserId || bodyUserId;
        console.log('Using User ID:', userIdentifier);
        if (!userIdentifier) {
            console.log('No user identifier found in request');
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const resumes = await Resume_1.default.find({ user_id: userIdentifier }).sort({ uploaded_at: -1 });
        console.log('Resumes found:', resumes.length);
        return res.status(200).json(resumes);
    }
    catch (error) {
        console.error('Error fetching resumes:', error);
        return res.status(500).json({ error: 'Failed to fetch resumes' });
    }
};
exports.getUserResumes = getUserResumes;
// Get a single resume by ID
const getResumeById = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const resume = await Resume_1.default.findOne({ _id: id, user_id: userId });
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        return res.status(200).json(resume);
    }
    catch (error) {
        console.error('Error fetching resume:', error);
        return res.status(500).json({ error: 'Failed to fetch resume' });
    }
};
exports.getResumeById = getResumeById;
// Delete a resume by ID
const deleteResume = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const deletedResume = await Resume_1.default.findOneAndDelete({ _id: id, user_id: userId });
        if (!deletedResume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        return res.status(200).json({ message: 'Resume deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting resume:', error);
        return res.status(500).json({ error: 'Failed to delete resume' });
    }
};
exports.deleteResume = deleteResume;
// Add this new function to get all resumes (for admin users)
const getAllResumes = async (req, res) => {
    var _a;
    try {
        // Only admin users should be allowed to access all resumes
        console.log('Getting all resumes, user role:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.role);
        if (!req.user) {
            console.log('User not authenticated for getAllResumes');
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (req.user.role !== 'admin') {
            console.log('User not authorized to access all resumes:', req.user.uid);
            return res.status(403).json({ error: 'Not authorized to access all resumes' });
        }
        // Get all resumes
        const resumes = await Resume_1.default.find({}).sort({ uploaded_at: -1 });
        console.log(`Found ${resumes.length} resumes in total`);
        return res.status(200).json(resumes);
    }
    catch (error) {
        console.error('Error fetching all resumes:', error);
        return res.status(500).json({ error: 'Failed to fetch all resumes' });
    }
};
exports.getAllResumes = getAllResumes;
