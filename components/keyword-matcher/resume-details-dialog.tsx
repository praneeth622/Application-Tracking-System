"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, GraduationCap, MapPin, Calendar, Download, Sparkles, Eye, ExternalLink, FileText } from "lucide-react"
import type { Timestamp } from "firebase/firestore"

interface ResumeAnalysis {
  name: string
  education_details: Array<{
    institute: string
    degree: string
    major: string
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
  key_skills: string[]
  profile_summary: string
  experience_years?: number
}

interface Resume {
  filename: string
  filelink: string
  uploadedAt: Timestamp
  analysis: ResumeAnalysis
}

interface ResumeDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  resume: Resume | null
  onDownload: (fileUrl: string, filename: string) => void
  selectedKeywords: string[]
}

export function ResumeDetailsDialog({
  isOpen,
  onOpenChange,
  resume,
  onDownload,
  selectedKeywords,
}: ResumeDetailsDialogProps) {
  const [isViewingResume, setIsViewingResume] = useState(false)

  // Check if a skill matches any selected keyword
  const isSkillHighlighted = (skill: string) => {
    if (selectedKeywords.length === 0) return false
    return selectedKeywords.some((keyword) => skill.toLowerCase().includes(keyword.toLowerCase()))
  }

  // Open resume in new tab
  const openResumeInNewTab = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  // Toggle between resume view and details view
  const toggleResumeView = () => {
    setIsViewingResume(!isViewingResume)
  }

  if (!resume) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) setIsViewingResume(false)
      onOpenChange(open)
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background pt-4 px-6 pb-2 border-b border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-900 dark:text-violet-100 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <span>{resume.analysis.name || "Candidate Resume"}</span>
              {!isViewingResume && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 sm:mt-0 border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/20"
                  onClick={toggleResumeView}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Original Resume
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              {isViewingResume ? "Viewing original resume document" : "Detailed information about this candidate's resume"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {isViewingResume ? (
          <div className="bg-gray-100 dark:bg-gray-900 p-4 min-h-[70vh] flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex-1 overflow-hidden">
              <iframe 
                src={`${resume.filelink}#toolbar=1&navpanes=1&scrollbar=1`} 
                className="w-full h-[65vh]" 
                title="Resume Preview"
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" onClick={toggleResumeView}>
                Back to Details
              </Button>
              <Button
                variant="outline"
                className="border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/20"
                onClick={() => openResumeInNewTab(resume.filelink)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
                onClick={() => onDownload(resume.filelink, resume.filename)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile Summary */}
            {resume.analysis.profile_summary && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-violet-900 dark:text-violet-100">Profile Summary</h3>
                <p className="text-muted-foreground">{resume.analysis.profile_summary}</p>
              </div>
            )}

            {/* Education */}
            {resume.analysis.education_details.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-violet-900 dark:text-violet-100 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  Education
                </h3>
                <div className="space-y-4">
                  {resume.analysis.education_details.map((edu, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50"
                    >
                      <div className="font-medium text-blue-900 dark:text-blue-300">{edu.degree}</div>
                      {edu.major && <div className="text-blue-700 dark:text-blue-400">{edu.major}</div>}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 text-sm text-muted-foreground gap-2">
                        <div>{edu.institute}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          {edu.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                              {edu.location}
                            </span>
                          )}
                          {edu.dates && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {edu.dates}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {resume.analysis.work_experience_details.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-violet-900 dark:text-violet-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  Work Experience
                </h3>
                <div className="space-y-4">
                  {resume.analysis.work_experience_details.map((exp, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-800/50"
                    >
                      <div className="font-medium text-amber-900 dark:text-amber-300">{exp.title}</div>
                      <div className="text-amber-700 dark:text-amber-400">{exp.company}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 text-sm text-muted-foreground gap-2">
                        {exp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            {exp.location}
                          </div>
                        )}
                        {exp.dates && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            {exp.dates}
                          </div>
                        )}
                      </div>
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Responsibilities:</div>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {exp.responsibilities.map((resp, respIdx) => (
                              <li key={respIdx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-violet-900 dark:text-violet-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {resume.analysis.key_skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    className={`px-3 py-1 ${
                      isSkillHighlighted(skill)
                        ? "bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-700"
                        : "bg-gray-100 dark:bg-gray-800/40 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Resume Actions */}
            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button 
                variant="outline" 
                className="border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/20"
                onClick={toggleResumeView}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Original Resume
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
                onClick={() => onDownload(resume.filelink, resume.filename)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

