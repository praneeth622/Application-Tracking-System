"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"

interface ShowRelevantCandidatesButtonProps {
  jobId: string
}

export function ShowRelevantCandidatesButton({ jobId }: ShowRelevantCandidatesButtonProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  const handleClick = async () => {
    setIsChecking(true)
    try {
      // Check if we have candidates via the API
      const candidates = await apiClient.jobs.getCandidates(jobId);
      
      // Navigate to candidates page
      router.push(`/jobs/${jobId}/candidates`)

    } catch (error) {
      console.error("Error checking job candidates:", error)
      toast.error("Failed to check candidates")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="secondary"
      disabled={isChecking}
      className="w-full sm:w-auto"
    >
      {isChecking ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
          Checking profiles...
        </>
      ) : (
        <>
          <Users className="w-4 h-4 mr-2" />
          Show Relevant Candidates
        </>
      )}
    </Button>
  )
}