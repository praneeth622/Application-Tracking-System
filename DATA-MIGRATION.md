# Firebase to MongoDB Data Migration Guide

This guide will help you migrate your data from Firebase Firestore to MongoDB.

## Prerequisites

1. MongoDB server running (local or Atlas)
2. Firebase Admin SDK credentials
3. Node.js and npm

## Migration Steps

1. **Export Data from Firebase**

First, install the Firebase CLI:

```bash
npm install -g firebase-tools
```

Login to Firebase:

```bash
firebase login
```

Export your Firestore data:

```bash
firebase firestore:export ./firestore-export
```

2. **Prepare for Import**

Create a migration script:

```javascript
// migrate-data.js
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = require('../misc/ats-checker-ba0fd-firebase-adminsdk-fbsvc-1984828f57.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import your Mongoose models
const User = require('./api/models/User');
const Resume = require('./api/models/Resume');
const Vendor = require('./api/models/Vendor');

// Example migration function for users
async function migrateUsers() {
  // Get all users from Firestore
  const usersSnapshot = await admin.firestore().collection('users').get();
  
  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    
    // Create user in MongoDB
    await User.findOneAndUpdate(
      { uid: doc.id },
      {
        uid: doc.id,
        email: userData.email,
        name: userData.name || '',
        role: userData.role || 'user',
        created_at: userData.created_at ? new Date(userData.created_at) : new Date(),
        updated_at: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`Migrated user: ${doc.id}`);
  }
}

// Example migration function for resumes
async function migrateResumes() {
  // Get all users
  const usersSnapshot = await admin.firestore().collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    
    // Get resumes for this user
    const resumesDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('resumes')
      .doc('data')
      .get();
    
    if (resumesDoc.exists) {
      const resumesData = resumesDoc.data();
      
      if (resumesData.resumes && Array.isArray(resumesData.resumes)) {
        for (const resume of resumesData.resumes) {
          // Create resume in MongoDB
          await Resume.findOneAndUpdate(
            { 
              user_id: userId,
              fileHash: resume.fileHash
            },
            {
              user_id: userId,
              filename: resume.filename,
              filelink: resume.filelink,
              fileHash: resume.fileHash,
              analysis: resume.analysis,
              vendor_id: resume.vendor_id || null,
              vendor_name: resume.vendor_name || null,
              uploaded_at: resume.uploadedAt ? new Date(resume.uploadedAt) : new Date(),
              updated_at: new Date()
            },
            { upsert: true, new: true }
          );
          
          console.log(`Migrated resume: ${resume.filename} for user: ${userId}`);
        }
      }
    }
  }
}

// Example migration function for vendors
async function migrateVendors() {
  // Get all vendors
  const vendorsSnapshot = await admin.firestore().collection('vendors').get();
  
  for (const vendorDoc of vendorsSnapshot.docs) {
    const vendorId = vendorDoc.id;
    
    // Get vendor details
    const infoDoc = await admin.firestore()
      .collection('vendors')
      .doc(vendorId)
      .collection('details')
      .doc('info')
      .get();
    
    if (infoDoc.exists) {
      const vendorData = infoDoc.data();
      
      // Create vendor in MongoDB
      await Vendor.findOneAndUpdate(
        { _id: vendorId },
        {
          name: vendorData.name || 'Unknown Vendor',
          address: vendorData.address || '',
          contact_person: vendorData.contact_person || '',
          country: vendorData.country || '',
          email: vendorData.email || '',
          phone: vendorData.phone || '',
          state: vendorData.state || '',
          status: vendorData.status || 'active',
          created_at: vendorData.created_at ? new Date(vendorData.created_at) : new Date(),
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );
      
      console.log(`Migrated vendor: ${vendorId}`);
    }
  }
}

// Run all migrations
async function runMigrations() {
  try {
    await migrateUsers();
    await migrateVendors();
    await migrateResumes();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    process.exit(0);
  }
}

runMigrations(); 