"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Calendar, GraduationCap, Briefcase } from "lucide-react"

interface ResumeCardProps {
  candidateName: string
  uploadDate: string
  fileUrl: string
  education?: string
  experience?: number
}

export function ResumeCard({ candidateName, uploadDate, fileUrl, education, experience }: ResumeCardProps) {
  return (
    <Card className="overflow-hidden border border-violet-200/50 dark:border-violet-800/50 hover:shadow-md transition-all duration-200">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">
                {candidateName || "Unnamed Candidate"}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                {education && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                    <span>{education}</span>
                  </div>
                )}
                {experience !== undefined && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {experience} {experience === 1 ? "year" : "years"} experience
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Uploaded {uploadDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 flex items-center justify-between bg-violet-50/50 dark:bg-violet-900/10 border-t border-violet-100 dark:border-violet-800/50">
          <Badge variant="outline" className="bg-white/50 dark:bg-black/20 border-violet-200 dark:border-violet-800">
            <FileText className="w-3.5 h-3.5 mr-1 text-violet-500" />
            Resume
          </Badge>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/20"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
              onClick={() => window.open(fileUrl, "_blank")}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

