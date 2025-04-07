"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ExperienceSectionProps {
  workExperience: Array<{
    company: string
    position: string
    dates: string
    responsibilities: string[]
    location?: string
  }>
}

export function ExperienceSection({ workExperience }: ExperienceSectionProps) {
  if (!workExperience || workExperience.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Work Experience
        </CardTitle>
        <CardDescription>Professional background and work history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {workExperience.map((experience, index) => (
          <ExperienceItem key={index} experience={experience} isLast={index === workExperience.length - 1} />
        ))}
      </CardContent>
    </Card>
  )
}

function ExperienceItem({
  experience,
  isLast,
}: {
  experience: {
    company: string
    position: string
    dates: string
    responsibilities: string[]
    location?: string
  }
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const hasResponsibilities = experience.responsibilities && experience.responsibilities.length > 0

  return (
    <div className={!isLast ? "pb-5 border-b" : ""}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-2">
        <h3 className="font-medium">{experience.position}</h3>

        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          <span>{experience.dates}</span>
        </div>
      </div>

      <p className="text-muted-foreground">{experience.company}</p>

      {experience.location && (
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5 mr-1.5" />
          <span>{experience.location}</span>
        </div>
      )}

      {hasResponsibilities && (
        <div className="mt-3">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
                Hide responsibilities
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
                Show responsibilities
              </>
            )}
          </Button>

          {expanded && (
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
              {experience.responsibilities.map((responsibility, idx) => (
                <li key={idx}>{responsibility}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

