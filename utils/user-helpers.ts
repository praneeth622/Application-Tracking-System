import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"

interface InitialUserData {
  uid: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export async function initializeNewUser(uid: string, email: string): Promise<void> {
  try {
    // Check if user profile already exists
    const userProfileRef = doc(db, "users", uid, "userProfile", "data")
    const userProfileDoc = await getDoc(userProfileRef)

    if (!userProfileDoc.exists()) {
      // Create initial user data
      const initialUserData: InitialUserData = {
        uid,
        email,
        name: email.split('@')[0], // Default name from email
        role: 'user', // Default role
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Set the initial user profile
      await setDoc(userProfileRef, initialUserData)

      console.log("New user profile created:", uid)
    }
  } catch (error) {
    console.error("Error initializing user:", error)
    throw error
  }
}