"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { db } from '@/FirebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { motion } from 'framer-motion'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'
import { ProfileAnalysis } from '@/components/profile/profile-analysis'
import { CompanyFeedback } from '@/components/profile/company-feedback'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

interface Profile {
  filename: string;
  uploadedAt: any;
  aiAnalysis?: string;
  profile_summary?: string;
  // ... other fields
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [profile, setProfile] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !params.filename) return;

      try {
        const userDocRef = doc(db, "users", user.uid, "resumes", "data");
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const foundProfile = userData.resumes?.find(
            (r: any) => r.filename === decodeURIComponent(params.filename as string)
          );
          
          if (foundProfile) {
            // Transform the data to include both aiAnalysis and profile_summary
            const profileData: Profile = {
              ...foundProfile,
              profile_summary: foundProfile.analysis?.profile_summary || null,
            };
            setProfile(profileData);
          } else {
            toast({
              title: "Profile not found",
              description: "The requested profile could not be found",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to fetch profile",
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, [user, params.filename])

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
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-4 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profiles
            </Button>
            <div className="h-6 w-px bg-border mx-4" /> {/* Divider */}
            <h2 className="text-sm text-muted-foreground">Profile Details</h2>
          </div>

          {profile ? (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.filename}</h1>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                        <span>Uploaded {new Date(profile.uploadedAt.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                      {profile.aiAnalysis && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-muted-foreground mx-3" />
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                            <span>Analysis Complete</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <ProfileAnalysis profile={profile} />
              </div>

              {/* Feedback Section */}
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <CompanyFeedback filename={profile.filename} filelink={profile.filelink} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading profile details...</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
