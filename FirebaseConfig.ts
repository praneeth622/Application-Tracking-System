"use client"

import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getStorage } from "firebase/storage"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6qQiXHYlw8WulzPTow3UM0S_OWJ-E3Mo",
  authDomain: "ats-2c019.firebaseapp.com",
  projectId: "ats-2c019",
  storageBucket: "ats-2c019.firebasestorage.app",
  messagingSenderId: "814858880937",
  appId: "1:814858880937:web:87cd7ebc3678c8cab8a6b8",
  measurementId: "G-Q224JCK48G"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const storage = getStorage(app)
const db = getFirestore(app)

// Initialize Analytics only in browser environment
let analytics = null
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)))
}

export { auth, analytics, app, storage, db }