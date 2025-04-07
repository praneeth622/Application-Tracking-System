"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Briefcase, Building, MapPin, DollarSign, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Job } from "@/types/job"

interface JobCardProps {
  job: Job
  viewMode: "grid" | "list"
  onClick: (job: Job) => void
  isAssignedToCurrentUser: boolean
}

export function JobCard({ job, viewMode, onClick, isAssignedToCurrentUser }: JobCardProps) {
  // Calculate time ago
  const timeAgo = formatDistanceToNow(job.created_at, { addSuffix: true })

  // Calculate application progress
  const totalApplications = job.total_applications || 0
  const applicationProgress = totalApplications > 0 ? Math.round((job.shortlisted / totalApplications) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg border hover:border-primary hover:shadow-md transition-all cursor-pointer
        ${viewMode === "grid" ? "p-5" : "p-6"}`}
      onClick={() => onClick(job)}
    >
      <div className={`flex ${viewMode === "grid" ? "flex-col" : "justify-between items-start"}`}>
        <div className={`${viewMode === "grid" ? "mb-4" : "flex-1"}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl font-semibold line-clamp-1">{job.title}</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-muted-foreground">
              <Building className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{job.company}</span>
            </div>
            {job.location && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="line-clamp-1">{job.location}</span>
              </div>
            )}
            {(job.employment_type || job.experience_required) && (
              <div className="flex items-center text-muted-foreground">
                <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="line-clamp-1">
                  {job.employment_type}
                  {job.employment_type && job.experience_required && " • "}
                  {job.experience_required}
                </span>
              </div>
            )}
            {job.salary_range && (
              <div className="flex items-center text-muted-foreground">
                <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="line-clamp-1">{job.salary_range}</span>
              </div>
            )}
          </div>

          {viewMode === "grid" && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">Posted {timeAgo}</div>
              <Badge variant={job.status === "active" ? "default" : "destructive"}>
                {job.status === "active" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {job.status}
              </Badge>
            </div>
          )}
        </div>

        {viewMode === "list" && (
          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="flex items-center">
              <div className="text-sm text-muted-foreground mr-3">Posted {timeAgo}</div>
              <Badge variant={job.status === "active" ? "default" : "destructive"}>
                {job.status === "active" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {job.status}
              </Badge>
            </div>
            {job.skills_required && job.skills_required.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {job.skills_required.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills_required.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.skills_required.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Only show application progress if there are applications */}
      {totalApplications > 0 && (
        <div className={`${viewMode === "grid" ? "mt-4 pt-4 border-t" : "mt-4"}`}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-muted-foreground">Application Progress</span>
            <span className="text-xs font-medium">{applicationProgress}%</span>
          </div>
          <Progress value={applicationProgress} className="h-1.5" />

          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center text-sm">
              <Users className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{job.total_applications}</span>
            </div>
            {job.shortlisted > 0 && (
              <div className="flex items-center text-sm">
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" />
                <span className="text-green-500">{job.shortlisted}</span>
              </div>
            )}
            {job.in_progress > 0 && (
              <div className="flex items-center text-sm">
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                <span className="text-yellow-500">{job.in_progress}</span>
              </div>
            )}
            {job.rejected > 0 && (
              <div className="flex items-center text-sm">
                <XCircle className="w-3.5 h-3.5 mr-1 text-red-500" />
                <span className="text-red-500">{job.rejected}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {isAssignedToCurrentUser && (
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
            Assigned to you
          </Badge>
        </div>
      )}
    </motion.div>
  )
}

