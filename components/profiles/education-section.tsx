import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Calendar, MapPin } from "lucide-react"

interface EducationSectionProps {
  educationDetails: Array<{
    degree: string
    major: string
    institute: string
    graduation_year?: string
    location?: string
  }>
}

export function EducationSection({ educationDetails }: EducationSectionProps) {
  if (!educationDetails || educationDetails.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Education
        </CardTitle>
        <CardDescription>Academic background and qualifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {educationDetails.map((education, index) => (
          <div key={index} className={index > 0 ? "pt-5 border-t" : ""}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-2">
              <h3 className="font-medium">
                {education.degree}
                {education.major ? ` in ${education.major}` : ""}
              </h3>

              {education.graduation_year && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>{education.graduation_year}</span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground">{education.institute}</p>

            {education.location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                <span>{education.location}</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

