import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarIcon, DollarSign } from "lucide-react"
import { toast } from 'sonner'
import type { Candidate, CandidateStatus } from '@/app/jobs/[jobId]/candidates/page'
import apiClient from "@/lib/api-client"

export function CandidateActions({ 
  candidate, 
  jobId,
  onUpdate 
}: { 
  candidate: Candidate
  jobId: string
  onUpdate: () => void
}) {
  const [showRateInput, setShowRateInput] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [rate, setRate] = useState(candidate.tracking?.rateConfirmed || '')
  const [interviewDate] = useState<Date>()

  const updateCandidateStatus = async (candidate: Candidate, status: CandidateStatus, additionalData = {}) => {
    try {
      // Use the API client to update candidate status
      await apiClient.jobs.updateCandidateStatus(
        jobId,
        candidate.filename, // Using filename as the candidateId
        status,
        additionalData
      );
      
      onUpdate();
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  }

  const confirmRate = async () => {
    if (!rate) return
    try {
      await updateCandidateStatus(candidate, 'rate_confirmed', { rateConfirmed: parseFloat(rate.toString()) });
      setShowRateInput(false)
    } catch (error: unknown) {
      console.error('Error confirming rate:', error);
      toast.error("Failed to confirm rate")
    }
  }

  const scheduleInterview = async (date: Date) => {
    try {
      await updateCandidateStatus(candidate, 'interview_scheduled', { interviewDate: date.toISOString() });
      setShowCalendar(false)
    } catch (error: unknown) {
      console.error('Error scheduling interview:', error);
      toast.error("Failed to schedule interview")
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateCandidateStatus(candidate, 'shortlisted')}
      >
        Shortlist
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => updateCandidateStatus(candidate, 'contacted')}
      >
        Mark Contacted
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => updateCandidateStatus(candidate, 'interested')}
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
        onClick={() => updateCandidateStatus(candidate, 'approved')}
        className="bg-green-100 hover:bg-green-200"
      >
        Approve
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => updateCandidateStatus(candidate, 'disapproved')}
        className="bg-red-100 hover:bg-red-200"
      >
        Disapprove
      </Button>
    </div>
  )
}
