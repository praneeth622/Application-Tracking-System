"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SkillsSectionProps {
  skills: string[]
  highlightedSkills?: string[]
}

export function SkillsSection({ skills, highlightedSkills = [] }: SkillsSectionProps) {
  const [showAll, setShowAll] = useState(false)

  if (!skills || skills.length === 0) {
    return null
  }

  const initialSkillsCount = 12
  const hasMoreSkills = skills.length > initialSkillsCount
  const displayedSkills = showAll ? skills : skills.slice(0, initialSkillsCount)

  // Convert highlighted skills to lowercase for case-insensitive comparison
  const normalizedHighlightedSkills = highlightedSkills.map((s) => s.toLowerCase())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Skills & Expertise
        </CardTitle>
        <CardDescription>Technical and professional competencies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {displayedSkills.map((skill, index) => {
            const isHighlighted = normalizedHighlightedSkills.includes(skill.toLowerCase())

            return (
              <Badge
                key={index}
                variant={isHighlighted ? "default" : "outline"}
                className={cn(
                  isHighlighted ? "bg-primary text-primary-foreground" : "bg-primary/5 hover:bg-primary/10",
                )}
              >
                {skill}
              </Badge>
            )
          })}
        </div>

        {hasMoreSkills && (
          <Button variant="ghost" size="sm" className="mt-4 h-8" onClick={() => setShowAll(!showAll)}>
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1.5" />
                Show fewer skills
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1.5" />
                Show all {skills.length} skills
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

