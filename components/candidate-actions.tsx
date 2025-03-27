import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon, DollarSign } from "lucide-react"
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/FirebaseConfig'
import { toast } from 'sonner'
import type { Candidate, CandidateStatus } from '@/app/jobs/[jobId]/candidates/page'
import { useAuth } from "@/context/auth-context"

export function CandidateActions({ 
  candidate, 
  jobId,
  onUpdate 
}: { 
  candidate: Candidate
  jobId: string
  onUpdate: () => void
}) {
  const { user } = useAuth()
  const [showRateInput, setShowRateInput] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [rate, setRate] = useState(candidate.tracking?.rateConfirmed || '')
  const [interviewDate, setInterviewDate] = useState<Date>()

  const updateCandidateStatus = async (status: CandidateStatus) => {
    try {
      const candidateRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles")
      await updateDoc(candidateRef, {
        [`candidates.${candidate.filename}.tracking`]: {
          ...candidate.tracking,
          status,
          lastUpdated: new Date(),
          updatedBy: user?.email || 'unknown'
        }
      })
      onUpdate()
      toast.success("Status updated successfully")
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const confirmRate = async () => {
    if (!rate) return
    try {
      const candidateRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles")
      await updateDoc(candidateRef, {
        [`candidates.${candidate.filename}.tracking`]: {
          ...candidate.tracking,
          rateConfirmed: parseFloat(rate.toString()),
          status: 'rate_confirmed',
          lastUpdated: new Date(),
          updatedBy: user?.email || 'unknown'
        }
      })
      setShowRateInput(false)
      onUpdate()
      toast.success("Rate confirmed successfully")
    } catch (error) {
      toast.error("Failed to confirm rate")
    }
  }

  const scheduleInterview = async (date: Date) => {
    try {
      const candidateRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles")
      await updateDoc(candidateRef, {
        [`candidates.${candidate.filename}.tracking`]: {
          ...candidate.tracking,
          interviewDate: date,
          status: 'interview_scheduled',
          lastUpdated: new Date(),
          updatedBy: user?.email || 'unknown'
        }
      })
      setShowCalendar(false)
      onUpdate()
      toast.success("Interview scheduled successfully")
    } catch (error) {
      toast.error("Failed to schedule interview")
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateCandidateStatus('shortlisted')}
      >
        Shortlist
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => updateCandidateStatus('contacted')}
      >
        Mark Contacted
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => updateCandidateStatus('interested')}
      >
        Mark Interested
      </Button>

      <Popover open={showRateInput} onOpenChange={setShowRateInput}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <DollarSign className="w-4 h-4 mr-2" />
            Confirm Rate
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Confirm Rate</h4>
              <Input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Enter rate"
              />
            </div>
            <Button onClick={confirmRate}>Confirm</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={interviewDate}
            onSelect={(date: Date | undefined) => {
              if (date) {
                scheduleInterview(date)
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={() => updateCandidateStatus('approved')}
        className="bg-green-100 hover:bg-green-200"
      >
        Approve
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => updateCandidateStatus('disapproved')}
        className="bg-red-100 hover:bg-red-200"
      >
        Disapprove
      </Button>
    </div>
  )
}
