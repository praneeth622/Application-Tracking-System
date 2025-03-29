"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { db } from '@/FirebaseConfig'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { motion } from 'framer-motion'
import { useMediaQuery } from '@/hooks/use-media-query'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface Analysis {
  name: string
  email: string
  key_skills: string[]
  education_details: Array<{
    degree: string
    major: string
    institute: string
    graduation_year?: string
    location?: string
  }>
  work_experience_details: Array<{
    company: string
    position: string
    dates: string
    responsibilities: string[]
    location?: string
  }>
  experience_years?: number
}

interface Profile {
  filename: string
  filelink: string
  uploadedAt: Timestamp
  analysis: Analysis
  aiAnalysis?: string
  companyFeedback?: string[]
}


export default function ProfilesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [profiles, setProfiles] = useState<Profile[]>([])
  // const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  // const [newFeedback, setNewFeedback] = useState("")
  // const [ setIsAnalyzing] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Fetch profiles from database
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid, "resumes", "data");
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.resumes) {
            setProfiles(userData.resumes)
          }
        }
      } catch (error) {
        console.error("Error fetching profiles:", error)
        toast({
          title: "Error",
          description: "Failed to fetch profiles",
          variant: "destructive",
        })
      }
    }

    fetchProfiles()
  }, [user])

  // Generate AI analysis for a profile

  // Add company feedback

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <motion.div
        className="flex-1 min-h-screen relative"
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : isSidebarOpen ? "16rem" : "4.5rem",
          width: isMobile ? "100%" : isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 4.5rem)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto py-8 px-4 md:px-8">
          <h1 className="text-3xl font-bold mb-8">Profile Management</h1>
          
          <div className="grid md:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.filename}
                className="p-6 rounded-lg border hover:border-primary cursor-pointer transition-all"
                onClick={() => router.push(`/profiles/${encodeURIComponent(profile.filename)}`)}
              >
                <h3 className="font-medium text-lg mb-2">{profile.filename}</h3>
                <p className="text-sm text-muted-foreground">
                  Uploaded: {new Date(profile.uploadedAt.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
