"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Create the schema
const JobCandidateSchema = new mongoose_1.Schema({
    filename: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    matchAnalysis: {
        matchPercentage: { type: Number, required: true },
        matchingSkills: { type: [String], default: [] },
        missingRequirements: { type: [String], default: [] },
        experienceMatch: { type: Boolean, default: false },
        educationMatch: { type: Boolean, default: false },
        overallAssessment: { type: String },
    },
    analysis: {
        key_skills: { type: [String], default: [] },
        education_details: [
            {
                degree: { type: String },
                major: { type: String },
                institute: { type: String },
            },
        ],
        work_experience_details: [
            {
                company: { type: String },
                position: { type: String },
                duration: {
                    start: { type: String },
                    end: { type: String },
                },
                responsibilities: { type: [String] },
                technologies: { type: [String] },
            },
        ],
    },
    tracking: {
        status: { type: String, default: 'pending' },
        statusHistory: [
            {
                status: { type: String },
                timestamp: { type: Date, default: Date.now },
                updatedBy: { type: String },
                additionalData: { type: mongoose_1.Schema.Types.Mixed },
            },
        ],
        lastUpdated: { type: Date, default: Date.now },
        updatedBy: { type: String },
        rateConfirmed: { type: Number },
        interviewDate: { type: String },
        contactedDate: { type: String },
        notes: { type: String },
        additionalData: { type: mongoose_1.Schema.Types.Mixed },
    },
    // Fix for MongoDB ObjectId reference
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    userId: { type: String, required: true },
    userEmail: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
// Compound index for fast lookups - find candidates by jobId and filename
JobCandidateSchema.index({ jobId: 1, filename: 1 }, { unique: true });
// Index for searching candidates by job
JobCandidateSchema.index({ jobId: 1 });
// Create the model directly if it doesn't already exist
const JobCandidate = mongoose_1.default.models.JobCandidate || mongoose_1.default.model('JobCandidate', JobCandidateSchema);
exports.default = JobCandidate;
