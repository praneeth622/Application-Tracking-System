"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Eye, Calendar, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// Create a simplified Timestamp interface that matches what our API returns
interface SimpleTimestamp {
  seconds: number;
  nanoseconds: number;
}

interface ProfileHeaderProps {
  profile: {
    filename: string
    filelink: string
    uploadedAt: SimpleTimestamp
    aiAnalysis?: string
    analysis?: {
      name: string
      email: string
      key_skills?: string[]
      education_details?: Array<{
        degree: string
        major: string
        institute: string
        graduation_year?: string
        location?: string
      }>
      work_experience_details?: Array<{
        company: string
        position: string
        dates: string
        responsibilities: string[]
        location?: string
      }>
      experience_years?: number
      profile_summary?: string
    }
  }
  onViewResume: () => void
  onDownloadResume: () => void
}

export function ProfileHeader({ profile, onViewResume, onDownloadResume }: ProfileHeaderProps) {
  const router = useRouter()

  // Get profile name
  const getProfileName = () => {
    if (profile.analysis?.name) {
      return profile.analysis.name
    }

    // Clean up filename as fallback
    return (
      profile.filename
        .replace(/\.pdf$/i, "") // Remove .pdf extension
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, "") // Remove UUID
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/([A-Z])/g, " $1") // Add spaces before capital letters
        .replace(/\s+/g, " ") // Remove multiple spaces
        .trim() || "Untitled Resume"
    )
  }

  // Get latest role
  const getLatestRole = () => {
    if (profile.analysis?.work_experience_details?.[0]) {
      const latest = profile.analysis.work_experience_details[0]
      return `${latest.position} at ${latest.company}`
    }
    return null
  }

  const uploadDate = new Date(profile.uploadedAt.seconds * 1000)
  const formattedDate = uploadDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="relative">
      {/* Decorative header background */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/20 to-primary/5 rounded-t-lg -z-10" />

      <div className="pt-6 pb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6 hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profiles
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{getProfileName()}</h1>
            {getLatestRole() && <p className="text-muted-foreground mt-1">{getLatestRole()}</p>}

            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1.5" />
                <span>Uploaded {formattedDate}</span>
              </div>

              {profile.aiAnalysis && (
                <div className="flex items-center text-sm text-green-600 dark:text-green-500">
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  <span>Analysis Complete</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onViewResume}>
              <Eye className="w-4 h-4" />
              View Resume
            </Button>

            <Button variant="default" size="sm" className="gap-1.5" onClick={onDownloadResume}>
              <Download className="w-4 h-4" />
              Download Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

