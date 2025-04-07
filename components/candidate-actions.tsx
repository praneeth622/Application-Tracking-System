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
import { doc, writeBatch, getDoc, serverTimestamp, increment } from 'firebase/firestore'
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
  const [interviewDate] = useState<Date>()

  const updateCandidateStatus = async (candidate: Candidate, status: CandidateStatus, additionalData = {}) => {
    try {
      const batch = writeBatch(db);
      
      // Get reference to primary source: resumes/details document
      const resumesDetailsRef = doc(db, "jobs", jobId, "resumes", "details");
      const resumesDetailsDoc = await getDoc(resumesDetailsRef);
      
      if (!resumesDetailsDoc.exists()) {
        throw new Error("Resumes details document not found");
      }

      const currentData = resumesDetailsDoc.data();
      const timestamp = new Date().toISOString();
      
      // Update the candidate's status and tracking info
      const updatedCandidates = currentData.relevant_candidates.map((c: Candidate) => {
        if (c.filename === candidate.filename) {
          return {
            ...c,
            tracking: {
              ...c.tracking,
              status,
              statusHistory: [
                ...(c.tracking?.statusHistory || []),
                {
                  status,
                  timestamp,
                  updatedBy: user?.email || 'unknown',
                  ...additionalData
                }
              ],
              lastUpdated: timestamp,
              updatedBy: user?.email || 'unknown',
              ...additionalData
            }
          };
        }
        return c;
      });

      // Update the document with new data
      batch.update(resumesDetailsRef, {
        relevant_candidates: updatedCandidates,
        'metadata.lastUpdated': serverTimestamp(),
        [`statusCounts.${status}`]: increment(1),
      });
      
      // Also update the old location for backward compatibility
      const relevantProfilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles");
      const profilesDoc = await getDoc(relevantProfilesRef);
      
      if (profilesDoc.exists()) {
        const oldData = profilesDoc.data();
        const updatedOldCandidates = oldData.candidates?.map((c: Candidate) => {
          if (c.filename === candidate.filename) {
            return {
              ...c,
              tracking: {
                ...c.tracking,
                status,
                statusHistory: [
                  ...(c.tracking?.statusHistory || []),
                  {
                    status,
                    timestamp,
                    updatedBy: user?.email || 'unknown',
                    ...additionalData
                  }
                ],
                lastUpdated: timestamp,
                updatedBy: user?.email || 'unknown',
                ...additionalData
              }
            };
          }
          return c;
        });
        
        batch.update(relevantProfilesRef, {
          candidates: updatedOldCandidates,
          'metadata.lastUpdated': serverTimestamp()
        });
      }

      await batch.commit();
      onUpdate();
      toast.success(`Status updated to ${status}`);
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
      await updateCandidateStatus(candidate, 'interview_scheduled', { interviewDate: date });
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
