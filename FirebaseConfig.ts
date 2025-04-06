"use client"

import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getStorage } from "firebase/storage"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZFETF1t_h5CfT_xBt94U3WmQfWzNObo8",
  authDomain: "ats-checker-ba0fd.firebaseapp.com",
  projectId: "ats-checker-ba0fd",
  storageBucket: "ats-checker-v1",
  messagingSenderId: "529592921344",
  appId: "1:529592921344:web:768b73e4c20eb1d8d697e5",
  measurementId: "G-SYCJ0E2774"
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