"use client"

import { useEffect, useState } from "react"
import { Candidate, CandidateStatus } from "@/app/jobs/[jobId]/candidates/page"
import { format } from "date-fns"
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { Check, Circle, CircleDot } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { CandidateActions } from "@/components/candidate-actions"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const getStatusOrder = (status: CandidateStatus): number => {
  const order: Record<CandidateStatus, number> = {
    pending: 0,
    shortlisted: 1,
    contacted: 2,
    interested: 3,
    not_interested: 3,
    rate_confirmed: 4,
    interview_scheduled: 5,
    approved: 6,
    disapproved: 6
  }
  return order[status]
}

interface CandidateDetailsSheetProps {
  candidate: Candidate | null
  jobId: string
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

const StatusButton = ({ 
  status, 
  currentStatus, 
  onClick, 
  children 
}: { 
  status: CandidateStatus
  currentStatus?: CandidateStatus
  onClick: (status: CandidateStatus) => void
  children: React.ReactNode 
}) => {
  const isActive = currentStatus === status
  const isPrevious = currentStatus && getStatusOrder(currentStatus) > getStatusOrder(status)

  return (
    <Button
      variant={isActive ? "default" : isPrevious ? "secondary" : "outline"}
      className="w-full justify-start"
      onClick={() => onClick(status)}
    >
      {isPrevious && <Check className="w-4 h-4 mr-2" />}
      {isActive && <CircleDot className="w-4 h-4 mr-2" />}
      {!isPrevious && !isActive && <Circle className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  )
}

export function CandidateDetailsSheet({
  candidate: initialCandidate,
  jobId,
  isOpen,
  onClose,
  onUpdate
}: CandidateDetailsSheetProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(initialCandidate)

  useEffect(() => {
    setCandidate(initialCandidate)
  }, [initialCandidate])

  useEffect(() => {
    if (!isOpen || !jobId || !initialCandidate) return

    // Set up real-time listener for candidate updates
    const unsubscribe = onSnapshot(
      doc(db, "jobs", jobId, "resumes", "details"),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          const updatedCandidate = data.relevant_candidates?.find(
            (c: Candidate) => c.filename === initialCandidate.filename
          )
          if (updatedCandidate) {
            setCandidate(updatedCandidate)
          }
        }
      },
      (error) => {
        console.error("Error in real-time candidate updates:", error)
      }
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [jobId, initialCandidate, isOpen])

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    if (!candidate || !jobId) return

    try {
      const profilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles")
      const now = new Date().toISOString()

      const updatedCandidate = {
        ...candidate,
        tracking: {
          ...candidate.tracking,
          status: newStatus,
          lastUpdated: now,
          statusHistory: [
            ...(candidate.tracking?.statusHistory || []),
            {
              status: newStatus,
              timestamp: now,
            }
          ],
          ...(newStatus === 'interview_scheduled' ? { interviewDate: now } : {})
        }
      }

      await updateDoc(profilesRef, {
        candidates: arrayUnion(updatedCandidate)
      })

      onUpdate()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  if (!candidate) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">{candidate.name}</SheetTitle>
          <SheetDescription>{candidate.email}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Match Score */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Match Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">
                {candidate.matchAnalysis.matchPercentage}%
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <span className={candidate.matchAnalysis.experienceMatch ? 
                  "text-green-600" : "text-yellow-600"}>
                  Experience: {candidate.matchAnalysis.experienceMatch ? "✓" : "✗"}
                </span>
                <span className={candidate.matchAnalysis.educationMatch ? 
                  "text-green-600" : "text-yellow-600"}>
                  Education: {candidate.matchAnalysis.educationMatch ? "✓" : "✗"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Matching Skills */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Matching Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.matchAnalysis.matchingSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Requirements */}
          {candidate.matchAnalysis.missingRequirements.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-yellow-600">Missing Requirements</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {candidate.matchAnalysis.missingRequirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Separator />

          {/* Work Experience */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Work Experience</h3>
            <div className="space-y-4">
              {candidate.analysis.work_experience_details.map((exp, index) => (
                <div key={index} className="space-y-1">
                  <h4 className="font-medium">{exp.position} at {exp.company}</h4>
                  {exp.duration && (
                    <p className="text-sm text-muted-foreground">
                      {exp.duration.start} - {exp.duration.end || 'Present'}
                    </p>
                  )}
                  {exp.responsibilities && (
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Education */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Education</h3>
            <div className="space-y-2">
              {candidate.analysis.education_details.map((edu, index) => (
                <div key={index}>
                  <h4 className="font-medium">{edu.degree} in {edu.major}</h4>
                  <p className="text-sm text-muted-foreground">{edu.institute}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Candidate Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Actions</h3>
            <CandidateActions
              candidate={candidate}
              jobId={jobId}
              onUpdate={onUpdate}
            />
          </div>

          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Update Status</h3>
            <div className="space-y-2">
              <StatusButton 
                status="shortlisted" 
                currentStatus={candidate.tracking?.status}
                onClick={handleStatusChange}
              >
                Shortlisted
              </StatusButton>
              <StatusButton 
                status="contacted" 
                currentStatus={candidate.tracking?.status}
                onClick={handleStatusChange}
              >
                Contacted
              </StatusButton>
              <StatusButton 
                status="interested" 
                currentStatus={candidate.tracking?.status}
                onClick={handleStatusChange}
              >
                Interested
              </StatusButton>
              <StatusButton 
                status="rate_confirmed" 
                currentStatus={candidate.tracking?.status}
                onClick={handleStatusChange}
              >
                Rate Confirmed
              </StatusButton>
              <StatusButton 
                status="interview_scheduled" 
                currentStatus={candidate.tracking?.status}
                onClick={handleStatusChange}
              >
                Schedule Interview
              </StatusButton>
              <StatusButton 
                status="approved" 
                currentStatus={candidate.tracking?.status}
                onClick={handleStatusChange}
              >
                Approve
              </StatusButton>
              <StatusButton 
                status="disapproved" 
                currentStatus={candidate.tracking?.status}
                onClick={handleStatusChange}
              >
                Disapprove
              </StatusButton>
            </div>
          </div>

          {/* Tracking Information */}
          {candidate.tracking && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Status Information</h3>
                <div className="space-y-1 text-sm">
                  <p>Current Status: <span className="font-medium">{candidate.tracking.status}</span></p>
                  {candidate.tracking.rateConfirmed && (
                    <p>Rate: <span className="font-medium">${candidate.tracking.rateConfirmed}/hr</span></p>
                  )}
                  {candidate.tracking.interviewDate && (
                    <p>Interview: <span className="font-medium">{format(new Date(candidate.tracking.interviewDate), 'PPp')}</span></p>
                  )}
                  <p className="text-muted-foreground">
                    Last updated: {format(new Date(candidate.tracking.lastUpdated), 'PPp')}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
