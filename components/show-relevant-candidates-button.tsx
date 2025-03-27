"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { toast } from "sonner"

interface ShowRelevantCandidatesButtonProps {
  jobId: string
}

export function ShowRelevantCandidatesButton({ jobId }: ShowRelevantCandidatesButtonProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  const handleClick = async () => {
    setIsChecking(true)
    try {
      // Check if we have stored relevant profiles
      const relevantProfilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles")
      const profilesDoc = await getDoc(relevantProfilesRef)

      // Navigate to candidates page
      router.push(`/jobs/${jobId}/candidates`)

    } catch (error) {
      console.error("Error checking relevant profiles:", error)
      toast.error("Failed to check relevant profiles")
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