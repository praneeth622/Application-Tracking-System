"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketName = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
// AWS S3 configuration
const s3Config = {
    region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ""
    }
};
// Initialize S3 client
const s3Client = new client_s3_1.S3Client(s3Config);
exports.s3Client = s3Client;
// Bucket name
const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "ats-checker-bucket";
exports.bucketName = bucketName;
