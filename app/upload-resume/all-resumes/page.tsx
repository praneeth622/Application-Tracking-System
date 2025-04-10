"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { db } from "@/FirebaseConfig"
import { collection, getDocs } from "firebase/firestore"
import { motion } from "framer-motion"
import { RecentFileCard } from "@/components/recent-file-card"
import { FileText } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"


interface ResumeData {
  filename: string
  filelink: string
  uploadedAt: {
    seconds: number
    nanoseconds: number
  }
  analysis: {
    name: string
    email: string
    phone_number?: string
    social_profile_links?: string[]
    key_skills: string[]
    education_details: Array<{
      degree: string
      major: string
      institute: string
      location: string
      dates: string
    }>
    work_experience_details: Array<{
      company: string
      title: string
      location: string
      dates: string
      responsibilities: string[]
    }>
    project_experience?: Array<{
      name: string
      description: string
      technologies: string[]
    }>
    profile_summary: string
    score?: number
  }
}

export default function AllResumesPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) return;
    
      try {
        const resumeCollectionRef = collection(db, "users", user.uid, "resumes"); // Subcollection reference
        const querySnapshot = await getDocs(resumeCollectionRef); // Get all documents in the subcollection
    
        const resumes = querySnapshot.docs.map((doc) => ({
          filename: doc.data().filename,
          filelink: doc.data().filelink,
          uploadedAt: doc.data().uploadedAt,
          analysis: doc.data().analysis
        } as ResumeData));
    
        setResumes(resumes); // Store the fetched resumes
      } catch (error) {
        console.error("Error fetching resumes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResumes();
    
  }, [user])

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleString()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <DashboardSidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <h1 className="text-3xl font-bold mb-8">All Uploaded Resumes</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading resumes...</span>
        </div>
      ) : resumes.length > 0 ? (
        <div className="space-y-4">
          {resumes.map((resume, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RecentFileCard
                filename={resume.filename}
                fileSize="N/A"
                date={formatDate(resume.uploadedAt)}
                id={resume.filelink}
                fileType={resume.filename.toLowerCase().endsWith('.pdf') ? 'pdf' : 
                         resume.filename.toLowerCase().endsWith('.docx') ? 'docx' : 'doc'}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No resumes found</h3>
          <p className="text-muted-foreground">
            You haven&apos;t uploaded any resumes yet.
          </p>
        </div>
      )}
    </div>
  )
}
