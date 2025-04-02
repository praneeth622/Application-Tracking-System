"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db, auth } from "@/FirebaseConfig"
import { initializeNewUser } from "@/utils/user-helpers"
import type { UserProfile } from "@/types/user"

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      
      if (user) {
        try {
          // Check and initialize new user
          const userProfileRef = doc(db, "users", user.uid, "userProfile", "data")
          const userProfileDoc = await getDoc(userProfileRef)

          if (!userProfileDoc.exists()) {
            // Initialize new user profile
            await initializeNewUser(user.uid, user.email || '')
            // Fetch the newly created profile
            const newProfileDoc = await getDoc(userProfileRef)
            if (newProfileDoc.exists()) {
              const profile = newProfileDoc.data() as UserProfile
              setUserProfile(profile)
              setIsAdmin(profile.role === 'admin')
            }
          } else {
            // Existing user profile
            const profile = userProfileDoc.data() as UserProfile
            setUserProfile(profile)
            setIsAdmin(profile.role === 'admin')
          }
        } catch (error) {
          console.error("Error in auth state change:", error)
        }
      } else {
        setUserProfile(null)
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)