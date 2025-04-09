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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Check if Firebase Admin has already been initialized
if (!admin.apps.length) {
    try {
        const options = {};
        // Check if service account key is available
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                // Initialize with service account file if it exists
                const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString());
                options.credential = admin.credential.cert(serviceAccount);
                console.log('Using Firebase service account from environment variable');
            }
            catch (e) {
                console.error('Error parsing Firebase service account JSON:', e);
            }
        }
        // Check for individual credential components
        else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            options.credential = admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID || 'ats-checker-ba0fd',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            });
            console.log('Using Firebase service account from individual environment variables');
        }
        // Add database URL if available
        if (process.env.FIREBASE_DATABASE_URL) {
            options.databaseURL = process.env.FIREBASE_DATABASE_URL;
        }
        // Add storage bucket if available
        if (process.env.FIREBASE_STORAGE_BUCKET) {
            options.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
        }
        // Initialize without credentials if none provided (will use Application Default Credentials)
        if (!options.credential) {
            console.log('No Firebase credentials found, using application default credentials');
        }
        // Always set projectId if available
        if (process.env.FIREBASE_PROJECT_ID) {
            options.projectId = process.env.FIREBASE_PROJECT_ID;
        }
        // Initialize Firebase Admin
        admin.initializeApp(options);
        console.log('Firebase Admin initialized successfully');
    }
    catch (error) {
        console.error('Firebase admin initialization error:', error);
    }
}
