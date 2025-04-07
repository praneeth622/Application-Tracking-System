import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Mail, MapPin, Phone, User } from "lucide-react"

interface ProfileSummaryProps {
  analysis: {
    name?: string
    email?: string
    phone?: string
    location?: string
    profile_summary?: string
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
  }
}

export function ProfileSummary({ analysis }: ProfileSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile Summary
        </CardTitle>
        <CardDescription>Overview of candidate profile and key information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>{analysis.email}</span>
            </div>
          )}

          {analysis.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>{analysis.phone}</span>
            </div>
          )}

          {analysis.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{analysis.location}</span>
            </div>
          )}

          {analysis.experience_years && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>{analysis.experience_years} years of experience</span>
            </div>
          )}
        </div>

        {/* Profile Summary */}
        {analysis.profile_summary && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.profile_summary}</p>
          </div>
        )}

        {/* Key Skills */}
        {analysis.key_skills && analysis.key_skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Key Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {analysis.key_skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-primary/5">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

