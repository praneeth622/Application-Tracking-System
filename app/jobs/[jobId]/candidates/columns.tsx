"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { CandidateDetailsSheet } from "@/components/candidate-details-sheet"
import { useState } from "react"
import { Eye } from "lucide-react"
import { Candidate } from "./page"
import { Badge } from "@/components/ui/badge"

// Helper function to get status badge style
const getStatusBadge = (status?: string) => {
  const styles: Record<string, { variant: "default" | "outline" | "secondary" | "destructive", label: string }> = {
    pending: { variant: "outline", label: "Pending" },
    shortlisted: { variant: "secondary", label: "Shortlisted" },
    contacted: { variant: "secondary", label: "Contacted" },
    interested: { variant: "secondary", label: "Interested" },
    not_interested: { variant: "destructive", label: "Not Interested" },
    rate_confirmed: { variant: "secondary", label: "Rate Confirmed" },
    interview_scheduled: { variant: "secondary", label: "Interview Scheduled" },
    approved: { variant: "default", label: "Approved" },
    disapproved: { variant: "destructive", label: "Disapproved" }
  }
  
  return styles[status || "pending"] || { variant: "outline", label: "Pending" }
}

// Cell component for viewing candidate details
const ViewDetailsCell = ({ candidate, jobId, onUpdate }: { 
  candidate: Candidate, 
  jobId: string,
  onUpdate: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Eye className="w-4 h-4 mr-2" />
        View
      </Button>
      <CandidateDetailsSheet
        candidate={candidate}
        jobId={jobId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  )
}

export const columns: ColumnDef<Candidate>[] = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    accessorKey: "matchAnalysis.matchPercentage",
    header: "Match Score",
    cell: ({ row }) => {
      const matchPercentage = row.getValue("matchAnalysis.matchPercentage") as number || 0
      return (
        <div className="font-medium">
          {matchPercentage}%
        </div>
      )
    }
  },
  {
    accessorKey: "analysis.years_of_experience",
    header: "Experience",
    cell: ({ row }) => {
      const years = row.getValue("analysis.years_of_experience") as number || 0
      return `${years} years`
    }
  },
  {
    accessorKey: "tracking.status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("tracking.status") as string
      const badge = getStatusBadge(status)
      return <Badge variant={badge.variant}>{badge.label}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const candidate = row.original
      const jobId = (table.options.meta as { jobId: string })?.jobId || ""
      const onUpdate = (table.options.meta as { onUpdate: () => void })?.onUpdate || (() => {})
      
      return (
        <ViewDetailsCell 
          candidate={candidate} 
          jobId={jobId} 
          onUpdate={onUpdate} 
        />
      )
    }
  }
]