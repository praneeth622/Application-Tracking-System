"use client"

import { useEffect, useState } from "react"
import { collection, doc, getDoc, getDocs, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { HiringStagesBoard } from "@/components/hiring-stages-board"
import { analyzeBatchMatches } from "@/utils/analyze-match"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
 
// Define types for candidates and job data
export type CandidateStatus = 
  | "pending"
  | "shortlisted" 
  | "contacted" 
  | "interested" 
  | "not_interested" 
  | "rate_confirmed" 
  | "interview_scheduled" 
  | "approved" 
  | "disapproved"

export interface Candidate {
  name: string
  email: string
  filename: string
  fileUrl?: string
  analysis: {
    summary: string
    skills: string[]
    years_of_experience: number
    work_experience_details: {
      company: string
      position: string
      duration?: {
        start: string
        end?: string
      }
      responsibilities?: string[]
    }[]
    education_details: {
      degree: string
      major: string
      institute: string
      year?: string
    }[]
    certifications?: string[]
  }
  matchAnalysis: {
    matchPercentage: number
    matchingSkills: string[]
    missingRequirements: string[]
    experienceMatch: boolean
    educationMatch: boolean
    overallAssessment: string
  }
  tracking?: {
    status?: CandidateStatus
    lastUpdated: string
    rateConfirmed?: number
    interviewDate?: string
    statusHistory?: {
      status: CandidateStatus
      timestamp: string
      updatedBy?: string
    }[]
  }
}

export default function CandidatesPage({ params }: { params: { jobId: string } }) {
  const { jobId } = params
  const { user } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [jobDetails, setJobDetails] = useState<any>(null)

  // Set up real-time listener for candidates
  useEffect(() => {
    if (!jobId) return

    // Set up listener on the primary location
    const unsubscribe = onSnapshot(
      doc(db, "jobs", jobId, "resumes", "details"),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          if (data.relevant_candidates) {
            setCandidates(data.relevant_candidates)
          }
          setIsLoading(false)
        } else {
          setIsLoading(false)
        }
      },
      (error) => {
        console.error("Error in real-time candidates updates:", error)
        setIsLoading(false)
        toast.error("Failed to load candidates")
      }
    )

    // Cleanup subscription
    return () => unsubscribe()
  }, [jobId])

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return
      try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId, "data", "details"))
        if (jobDoc.exists()) {
          setJobDetails(jobDoc.data())
        }
      } catch (error) {
        console.error("Error fetching job details:", error)
      }
    }
    
    fetchJobDetails()
  }, [jobId])

  // Check if candidates have already been analyzed, if not initiate analysis
  useEffect(() => {
    const checkAndAnalyzeCandidates = async () => {
      if (!jobId || isAnalyzing || candidates.length > 0) return
      
      try {
        // Check if we already have analyzed candidates
        const resumesDoc = await getDoc(doc(db, "jobs", jobId, "resumes", "details"))
        
        if (resumesDoc.exists() && resumesDoc.data().relevant_candidates?.length > 0) {
          return // We already have analyzed candidates
        }
        
        // If no candidates have been analyzed, start analysis process
        await analyzeCandidates()
      } catch (error) {
        console.error("Error checking for analyzed candidates:", error)
      }
    }
    
    if (!isLoading) {
      checkAndAnalyzeCandidates()
    }
  }, [jobId, isLoading, candidates, isAnalyzing])

  // Function to analyze candidates for the job
  const analyzeCandidates = async () => {
    if (!jobId || !jobDetails) return
    
    setIsAnalyzing(true)
    try {
      // 1. Get all resumes from the system
      const resumesSnapshot = await getDocs(collection(db, "resumes"))
      const allResumes = resumesSnapshot.docs.map(doc => doc.data())
      
      // Filter out resumes that don't have analysis data
      const validResumes = allResumes.filter(resume => resume.analysis)
      
      if (validResumes.length === 0) {
        toast.error("No resumes available to analyze")
        setIsAnalyzing(false)
        return
      }
      
      // 2. Get job details - we already have them from the useEffect

      // 3. Call analyzeBatchMatches to get AI-powered matching results
      const matchResults = await analyzeBatchMatches(jobDetails, validResumes)
      
      // Filter candidates with > 50% match
      const relevantCandidates = matchResults
        .filter(candidate => candidate.matchAnalysis.matchPercentage > 50)
        .map(candidate => ({
          ...candidate,
          tracking: {
            status: "pending",
            lastUpdated: new Date().toISOString(),
            statusHistory: [{
              status: "pending",
              timestamp: new Date().toISOString(),
              updatedBy: user?.email || 'system'
            }]
          }
        }))
      
      // 4. Store results in Firestore at the primary location
      await setDoc(doc(db, "jobs", jobId, "resumes", "details"), {
        relevant_candidates: relevantCandidates,
        metadata: {
          lastUpdated: new Date().toISOString(),
          updatedBy: user?.email || 'system',
          totalCandidates: relevantCandidates.length
        }
      })
      
      // Also store in secondary location for robustness (as mentioned in requirements)
      await setDoc(doc(db, "jobs", jobId, "relevant_profiles", "profiles"), {
        profiles: relevantCandidates,
        metadata: {
          lastUpdated: new Date().toISOString(),
          updatedBy: user?.email || 'system',
          totalCandidates: relevantCandidates.length
        }
      })
      
      // Also update status counts for the job
      await setDoc(doc(db, "jobs", jobId, "data", "status"), {
        totalCandidates: relevantCandidates.length,
        statusCounts: {
          pending: relevantCandidates.length,
          shortlisted: 0,
          contacted: 0,
          interested: 0,
          not_interested: 0,
          rate_confirmed: 0,
          interview_scheduled: 0,
          approved: 0,
          disapproved: 0
        }
      }, { merge: true })
      
      toast.success(`Found ${relevantCandidates.length} matching candidates`)
      setCandidates(relevantCandidates)
    } catch (error) {
      console.error("Error analyzing candidates:", error)
      toast.error("Failed to analyze candidates")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle candidate updates
  const handleCandidateUpdate = () => {
    // Improved implementation to manually refresh data if needed
    // This ensures data is consistent across components
    const jobRef = doc(db, "jobs", jobId, "resumes", "details");
    getDoc(jobRef)
      .then((doc) => {
        if (doc.exists() && doc.data().relevant_candidates) {
          setCandidates(doc.data().relevant_candidates);
        }
      })
      .catch((error) => {
        console.error("Error refreshing candidate data:", error);
      });
  }

  // Function to refresh candidate analysis
  const handleRefreshAnalysis = () => {
    analyzeCandidates()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading candidates...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matching Candidates</h1>
          <p className="text-muted-foreground">
            {jobDetails?.title ? `For: ${jobDetails.title} at ${jobDetails.company}` : ""}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleRefreshAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </>
          )}
        </Button>
      </div>
      
      {candidates.length === 0 && !isAnalyzing ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-6">
          <p className="text-lg text-muted-foreground mb-4">
            No matching candidates found for this job
          </p>
          <Button onClick={handleRefreshAnalysis}>
            Analyze Candidates
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList>
            <TabsTrigger value="kanban">Hiring Pipeline</TabsTrigger>
            <TabsTrigger value="list">Candidates List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban" className="mt-6">
            <HiringStagesBoard 
              candidates={candidates} 
              jobId={jobId} 
              onCandidateUpdate={handleCandidateUpdate} 
            />
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            <DataTable 
              columns={columns} 
              data={candidates}
              jobId={jobId}
              onUpdate={handleCandidateUpdate}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}