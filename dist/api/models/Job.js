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
const JobSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    employment_type: { type: String, required: true },
    experience_required: { type: String, required: true },
    salary_range: { type: String, required: true },
    status: { type: String, required: true, default: 'active', enum: ['active', 'inactive'] },
    requirements: { type: [String], required: true },
    benefits: { type: [String], required: true },
    skills_required: { type: [String], required: true },
    nice_to_have_skills: { type: [String] },
    working_hours: { type: String },
    mode_of_work: { type: String },
    deadline: { type: String },
    key_responsibilities: { type: [String] },
    about_company: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    total_applications: { type: Number, default: 0 },
    shortlisted: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    in_progress: { type: Number, default: 0 },
    metadata: {
        created_by: { type: String },
        created_by_id: { type: String },
        last_modified_by: { type: String },
    },
    assigned_recruiters: { type: [String], default: [] },
    candidates: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
exports.default = mongoose_1.default.models.Job || mongoose_1.default.model('Job', JobSchema);
