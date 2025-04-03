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
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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

const getProfileDisplayName = (profile: Profile) => {
  if (profile.analysis) {
    const { name, email } = profile.analysis;
    
    if (name && email) {
      return {
        displayName: name,
        contactInfo: email
      };
    }
    
    if (name) {
      return {
        displayName: name,
        contactInfo: 'No contact info'
      };
    }
  }
  
  return {
    displayName: 'Untitled Profile',
    contactInfo: 'No contact info'
  };
};

export default function ProfilesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  // Fetch profiles from database
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        const userDocRef = doc(db, "users", user.uid, "resumes", "data")
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
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [user])

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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Profile Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage and analyze your uploaded resumes
              </p>
            </div>
            <Button
              onClick={() => router.push('/upload-resume')}
              className="flex items-center gap-2"
            >
              <Icons.upload className="w-4 h-4" />
              Upload New Resume
            </Button>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="relative">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Icons.file className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No profiles yet</h3>
              <p className="text-muted-foreground mt-1">
                Upload your first resume to get started
              </p>
              <Button
                onClick={() => router.push('/upload')}
                variant="secondary"
                className="mt-4"
              >
                Upload Resume
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <Card
                  key={profile.filename}
                  className="relative hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/profiles/${encodeURIComponent(profile.filename)}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Icons.user className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-lg">
                          {getProfileDisplayName(profile).displayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icons.mail className="w-4 h-4" />
                        <span className="truncate">
                          {getProfileDisplayName(profile).contactInfo}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
