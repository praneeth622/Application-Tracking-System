"use client"

import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { motion } from "framer-motion"
import {
  Calendar,
  UserCheck,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle
} from "lucide-react"
import { Candidate, CandidateStatus } from "@/app/jobs/[jobId]/candidates/page"
import { format } from "date-fns"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { toast } from "sonner"

const stages = [
  { id: 'matched', label: 'Profiles Matched', icon: UserCheck, color: 'bg-blue-500' },
  { id: 'shortlisted', label: 'Shortlisted', icon: CheckCircle, color: 'bg-green-500' },
  { id: 'contacted', label: 'Contacted', icon: Mail, color: 'bg-purple-500' },
  { id: 'interested', label: 'Interested', icon: UserCheck, color: 'bg-indigo-500' },
  { id: 'rate_confirmed', label: 'Rate Confirmed', icon: DollarSign, color: 'bg-yellow-500' },
  { id: 'interview_scheduled', label: 'Interview Scheduled', icon: Calendar, color: 'bg-orange-500' },
  { id: 'approved', label: 'Approved', icon: CheckCircle, color: 'bg-green-600' },
  { id: 'disapproved', label: 'Disapproved', icon: XCircle, color: 'bg-red-500' }
]

interface HiringStagesBoardProps {
  candidates: Candidate[]
  jobId: string
  onCandidateUpdate: () => void
}

export function HiringStagesBoard({ candidates, jobId, onCandidateUpdate }: HiringStagesBoardProps) {

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(candidate => 
      (stage === 'matched' && !candidate.tracking?.status) || 
      candidate.tracking?.status === stage
    )
  }

  const updateCandidateStage = async (candidateId: string, newStatus: CandidateStatus) => {
    try {
      const candidateRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles")
      await updateDoc(candidateRef, {
        [`candidates.${candidateId}.tracking`]: {
          status: newStatus,
          lastUpdated: new Date(),
          updatedBy: 'current_user' // Replace with actual user email/id
        }
      })
      onCandidateUpdate()
      toast.success(`Candidate moved to ${newStatus}`)
    } catch (error) {
      console.error("Error updating candidate stage:", error)
      toast.error("Failed to update candidate stage")
    }
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId as CandidateStatus
    
    updateCandidateStage(draggableId, newStatus)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {stages.map((stage) => (
          <Droppable key={stage.id} droppableId={stage.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`bg-background rounded-lg border p-4 ${
                  snapshot.isDraggingOver ? 'border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <stage.icon className={`w-5 h-5 ${stage.color} text-white rounded p-1`} />
                  <h3 className="font-semibold">{stage.label}</h3>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {getCandidatesByStage(stage.id).length}
                  </span>
                </div>

                <div className="space-y-3">
                  {getCandidatesByStage(stage.id).map((candidate, index) => (
                    <Draggable
                      key={candidate.filename}
                      draggableId={candidate.filename}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <motion.div
                            className={`p-3 rounded-lg border bg-card ${
                              snapshot.isDragging ? 'shadow-lg border-primary' : ''
                            }`}
                            initial={false}
                            animate={{
                              scale: snapshot.isDragging ? 1.05 : 1
                            }}
                          >
                            <h4 className="font-medium truncate">{candidate.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {candidate.email}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                              <span className="text-primary font-medium">
                                {candidate.matchAnalysis.matchPercentage}%
                              </span>
                              {candidate.tracking?.lastUpdated && (
                                <span className="text-muted-foreground">
                                  {format(
                                    new Date(candidate.tracking.lastUpdated),
                                    'MMM d, h:mm a'
                                  )}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
