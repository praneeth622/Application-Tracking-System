"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAdmin = exports.createUserFromAuth = exports.updateUserRole = exports.getAllUsers = exports.updateUser = exports.getCurrentUser = void 0;
const User_1 = __importDefault(require("../models/User"));
// Get current user data
const getCurrentUser = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await User_1.default.findOne({ uid: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({
            uid: user.uid,
            email: user.email,
            name: user.name,
            role: user.role,
        });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getCurrentUser = getCurrentUser;
// Update user data
const updateUser = async (req, res) => {
    var _a, _b;
    try {
        const userIdFromAuth = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        const { uid, email, name, role } = req.body;
        // Default to authenticated user's ID if not provided explicitly
        const userId = uid || userIdFromAuth;
        // Ensure we have a user ID
        if (!userId) {
            return res.status(401).json({ error: 'User ID is required' });
        }
        // Check if user exists
        let user = await User_1.default.findOne({ uid: userId });
        // If user doesn't exist, create a new one
        if (!user) {
            console.log(`Creating new user with uid: ${userId}`);
            // Validate required fields for new user
            if (!email) {
                return res.status(400).json({ error: 'Email is required when creating a new user' });
            }
            // Create new user
            const newUser = new User_1.default({
                uid: userId,
                email,
                name: name || email.split('@')[0],
                role: role || 'user', // Default to 'user' role if not specified
                created_at: new Date(),
                updated_at: new Date()
            });
            user = await newUser.save();
            return res.status(201).json({
                uid: user.uid,
                email: user.email,
                name: user.name,
                role: user.role,
            });
        }
        // Update existing user with any provided fields
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (role && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'admin')
            updateData.role = role; // Only admins can update roles
        // Only update if we have fields to update
        if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date();
            user = await User_1.default.findOneAndUpdate({ uid: userId }, updateData, { new: true });
        }
        return res.status(200).json({
            uid: user.uid,
            email: user.email,
            name: user.name,
            role: user.role,
        });
    }
    catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
// Admin only: Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('uid email name role created_at');
        return res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
// Admin only: Update user role
const updateUserRole = async (req, res) => {
    try {
        const { uid, role } = req.body;
        if (!uid || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (!['admin', 'user', 'recruiter'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await User_1.default.findOneAndUpdate({ uid }, {
            role,
            updated_at: new Date()
        }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({
            uid: user.uid,
            email: user.email,
            name: user.name,
            role: user.role,
        });
    }
    catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({ error: 'Failed to update user role' });
    }
};
exports.updateUserRole = updateUserRole;
// Create user from Firebase auth data (no authentication required)
const createUserFromAuth = async (req, res) => {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    try {
        const { uid, email, name } = req.body;
        console.log(`createUserFromAuth called with uid: ${uid}, email: ${email}`);
        // Validate required fields
        if (!uid || !email) {
            console.log('createUserFromAuth validation failed: missing uid or email');
            return res.status(400).json({ error: 'User ID and email are required' });
        }
        // Check if user already exists (with a single database call)
        console.log(`Checking if user with uid ${uid} already exists`);
        const existingUser = await User_1.default.findOne({ uid });
        if (existingUser) {
            console.log(`User with uid ${uid} already exists, returning existing user`);
            return res.status(200).json({
                message: 'User already exists',
                user: {
                    uid: existingUser.uid,
                    email: existingUser.email,
                    name: existingUser.name,
                    role: existingUser.role,
                }
            });
        }
        // Create new user
        console.log(`Creating new user with uid ${uid} and email ${email}`);
        try {
            const newUser = new User_1.default({
                uid,
                email,
                name: name || email.split('@')[0], // Use name if provided, otherwise use email prefix
                role: 'user', // Default role
                created_at: new Date(),
                updated_at: new Date()
            });
            await newUser.save();
            console.log(`Successfully created new user with uid ${uid}`);
            return res.status(201).json({
                message: 'User created successfully',
                user: {
                    uid: newUser.uid,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                }
            });
        }
        catch (saveError) {
            // Handle duplicate key errors
            if (saveError.code === 11000) {
                // Try to find and return the existing user
                const conflictUser = await User_1.default.findOne({ email });
                if (conflictUser) {
                    console.log(`User with email ${email} already exists with different uid`);
                    return res.status(200).json({
                        message: 'User found with the same email',
                        user: {
                            uid: conflictUser.uid,
                            email: conflictUser.email,
                            name: conflictUser.name,
                            role: conflictUser.role,
                        }
                    });
                }
            }
            throw saveError;
        }
    }
    catch (error) {
        console.error('Error creating user from auth:', error);
        return res.status(500).json({ error: 'Failed to create user' });
    }
};
exports.createUserFromAuth = createUserFromAuth;
// Development-only endpoint to make a user an admin
const makeAdmin = async (req, res) => {
    try {
        const { uid, email } = req.body;
        // Validate required fields
        if (!uid || !email) {
            return res.status(400).json({ error: 'User ID and email are required' });
        }
        // Find the user by uid first
        let user = await User_1.default.findOne({ uid });
        if (user) {
            // Update existing user to admin
            user.role = 'admin';
            user.updated_at = new Date();
            await user.save();
            console.log(`User ${email} promoted to admin role`);
        }
        else {
            // Try to find user by email as a fallback
            user = await User_1.default.findOne({ email });
            if (user) {
                // If user with this email exists but has different uid, update uid and role
                user.uid = uid;
                user.role = 'admin';
                user.updated_at = new Date();
                await user.save();
                console.log(`User with email ${email} updated with new uid and promoted to admin`);
            }
            else {
                // Create the user if it doesn't exist at all
                try {
                    user = new User_1.default({
                        uid,
                        email,
                        name: email.split('@')[0],
                        role: 'admin', // Setting as admin
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                    await user.save();
                    console.log(`New admin user created with email ${email}`);
                }
                catch (saveError) {
                    // Check if it's a duplicate key error
                    if (saveError.code === 11000) {
                        return res.status(409).json({
                            error: 'User with this email already exists but could not be updated.',
                            details: saveError.message
                        });
                    }
                    throw saveError;
                }
            }
        }
        return res.status(200).json({
            message: 'User promoted to admin successfully',
            user: {
                uid: user.uid,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });
    }
    catch (error) {
        console.error('Error making user admin:', error);
        return res.status(500).json({ error: 'Failed to promote user to admin' });
    }
};
exports.makeAdmin = makeAdmin;
