"use client"

import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Timestamp } from "firebase/firestore"
import { CalendarDays, Briefcase, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileCardProps {
  profile: {
    filename: string
    filelink: string
    uploadedAt: Timestamp
    aiAnalysis?: string
    analysis?: {
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
      profile_summary?: string
    }
    companyFeedback?: string[]
  }
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const router = useRouter()

  // Get profile display information
  const getProfileInfo = () => {
    if (profile.analysis) {
      const { name, email, key_skills, work_experience_details, education_details } = profile.analysis

      return {
        name: name || "Unnamed Profile",
        email: email || "No email provided",
        latestRole: work_experience_details?.[0]?.position || "No position listed",
        latestCompany: work_experience_details?.[0]?.company || "No company listed",
        education: education_details?.[0]?.degree
          ? `${education_details[0].degree} in ${education_details[0].major || ""}`
          : "No education listed",
        institute: education_details?.[0]?.institute || "No institute listed",
        skills: key_skills || [],
      }
    }

    return {
      name: "Unnamed Profile",
      email: "No email provided",
      latestRole: "No position listed",
      latestCompany: "No company listed",
      education: "No education listed",
      institute: "No institute listed",
      skills: [],
    }
  }

  const profileInfo = getProfileInfo()
  const uploadDate = new Date(profile.uploadedAt.seconds * 1000)
  const formattedDate = uploadDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 group cursor-pointer"
      onClick={() => router.push(`/profiles/${encodeURIComponent(profile.filename)}`)}
    >
      <div className="h-2 bg-gradient-to-r from-primary/80 to-primary/40 w-full" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{profileInfo.name}</h3>
            <p className="text-sm text-muted-foreground">{profileInfo.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icons.user className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="font-medium">{profileInfo.latestRole}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4" /> {/* Spacer for alignment */}
            <span>{profileInfo.latestCompany}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="font-medium">{profileInfo.education}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4" /> {/* Spacer for alignment */}
            <span>{profileInfo.institute}</span>
          </div>
        </div>

        {profileInfo.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profileInfo.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-primary/5 hover:bg-primary/10">
                {skill}
              </Badge>
            ))}
            {profileInfo.skills.length > 3 && (
              <Badge variant="outline" className="bg-muted/50">
                +{profileInfo.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 pb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Uploaded {formattedDate}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

