import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check if Firebase admin has already been initialized
if (!admin.apps.length) {
  // For development/testing with bypass auth enabled, use a mock project
  if (process.env.BYPASS_AUTH === 'true') {
    console.log('[FIREBASE] Initializing firebase-admin with mock credentials (auth bypass mode)');
    admin.initializeApp({
      projectId: 'ats-checker-ba0fd', // Use the same project ID as your frontend
    });
  } else {
    // For production, use the proper service account credentials
    console.log('[FIREBASE] Initializing firebase-admin with real credentials');
    
    // Check if we have the necessary environment variables
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.error('[FIREBASE] Missing required Firebase environment variables!');
      // Default to the project ID from the error message
      process.env.FIREBASE_PROJECT_ID = 'ats-checker-ba0fd';
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key comes as a string with \n characters
        // We need to replace them with actual newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export { admin };