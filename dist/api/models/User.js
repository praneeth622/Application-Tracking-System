"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the schema for User
const UserSchema = new mongoose_1.default.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'recruiter'],
        default: 'user'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});
// Create index on uid for fast lookups
UserSchema.index({ uid: 1 });
// Pre-save hook to handle possible duplicate email issues
UserSchema.pre('save', async function (next) {
    // Set default name if not provided
    if (!this.name && this.email) {
        this.name = this.email.split('@')[0];
    }
    // Update timestamps
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    next();
});
// Use 'User' as the model name for consistency
const User = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
exports.default = User;
