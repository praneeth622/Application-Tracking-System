"use client"

import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

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

// Initialize Firebase services
const db = getFirestore(app)
const storage = getStorage(app)
const auth = getAuth(app)

export { db, storage, auth }

