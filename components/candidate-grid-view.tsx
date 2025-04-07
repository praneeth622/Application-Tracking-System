"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Briefcase, GraduationCap, Mail } from "lucide-react"
import type { Candidate } from "@/app/jobs/[jobId]/candidates/page"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface CandidateGridViewProps {
  candidates: Candidate[]
  onSelectCandidate: (candidate: Candidate) => void
}

export function CandidateGridView({ candidates, onSelectCandidate }: CandidateGridViewProps) {
  return (
    <AnimatePresence>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {candidates.map((candidate) => (
          <motion.div
            key={candidate.filename}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelectCandidate(candidate)}
          >
            <Card className="h-full cursor-pointer hover:border-primary hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center mb-4">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg line-clamp-1">{candidate.name}</h3>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Mail className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">{candidate.email}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Match Score</span>
                      <span className="text-lg font-bold text-primary">{candidate.matchAnalysis.matchPercentage}%</span>
                    </div>
                    <Progress value={candidate.matchAnalysis.matchPercentage} className="h-2" />
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {candidate.matchAnalysis.matchingSkills.slice(0, 3).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {candidate.matchAnalysis.matchingSkills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.matchAnalysis.matchingSkills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
                <span className={candidate.matchAnalysis.experienceMatch ? "text-green-600" : "text-yellow-600"}>
                  <Briefcase className="w-3 h-3 inline mr-1" />
                  {candidate.matchAnalysis.experienceMatch ? "Exp Match" : "Partial"}
                </span>
                <span className={candidate.matchAnalysis.educationMatch ? "text-green-600" : "text-yellow-600"}>
                  <GraduationCap className="w-3 h-3 inline mr-1" />
                  {candidate.matchAnalysis.educationMatch ? "Edu Match" : "Partial"}
                </span>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  )
}

