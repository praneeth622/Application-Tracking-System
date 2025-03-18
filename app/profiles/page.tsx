"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { db } from '@/FirebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { motion } from 'framer-motion'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface Profile {
  filename: string
  filelink: string
  uploadedAt: any
  analysis: any
  aiAnalysis?: string
  companyFeedback?: string[]
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

export default function ProfilesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [newFeedback, setNewFeedback] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Fetch profiles from database
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
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
  const generateAnalysis = async (profile: Profile) => {
    try {
      setIsAnalyzing(true)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

      const prompt = `Analyze this candidate's profile and provide a detailed professional assessment including:
      1. Key strengths and expertise
      2. Experience level and suitability
      3. Technical skills evaluation
      4. Potential role fits
      5. Areas for improvement
      6. Notable achievements
      7. Overall recommendation

      Use the following information:
      ${JSON.stringify(profile.analysis)}`

      const result = await model.generateContent(prompt)
      const analysis = await result.response.text()

      // Update profile in state and database
      const updatedProfiles = profiles.map(p => 
        p.filename === profile.filename ? { ...p, aiAnalysis: analysis } : p
      )

      const userDocRef = doc(db, "users", user!.uid)
      await updateDoc(userDocRef, { resumes: updatedProfiles })

      setProfiles(updatedProfiles)
      setSelectedProfile({ ...profile, aiAnalysis: analysis })

      toast({
        title: "Success",
        description: "Profile analysis generated successfully",
      })
    } catch (error) {
      console.error("Error generating analysis:", error)
      toast({
        title: "Error",
        description: "Failed to generate analysis",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Add company feedback
  const addFeedback = async () => {
    if (!selectedProfile || !newFeedback.trim()) return

    try {
      const updatedProfile = {
        ...selectedProfile,
        companyFeedback: [
          ...(selectedProfile.companyFeedback || []),
          newFeedback.trim()
        ]
      }

      const updatedProfiles = profiles.map(p =>
        p.filename === selectedProfile.filename ? updatedProfile : p
      )

      const userDocRef = doc(db, "users", user!.uid)
      await updateDoc(userDocRef, { resumes: updatedProfiles })

      setProfiles(updatedProfiles)
      setSelectedProfile(updatedProfile)
      setNewFeedback("")

      toast({
        title: "Success",
        description: "Feedback added successfully",
      })
    } catch (error) {
      console.error("Error adding feedback:", error)
      toast({
        title: "Error",
        description: "Failed to add feedback",
        variant: "destructive",
      })
    }
  }

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