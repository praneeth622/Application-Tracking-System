"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { collection, query, where, getDocs, doc, getDoc, writeBatch } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { ArrowLeft, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { calculateMatchScore } from "@/utils/calculate-match-score"
import { useAuth } from "@/context/auth-context"
import { analyzeMatch, analyzeBatchMatches } from "@/utils/analyze-match"
import { toast } from "sonner"
import { CandidateActions } from "@/components/candidate-actions"
import { format } from "date-fns"
import { HiringStagesBoard } from "@/components/hiring-stages-board"
import { useHiringStages } from "@/store/hiring-stages"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface MatchAnalysis {
  matchPercentage: number
  matchingSkills: string[]
  missingRequirements: string[]
  experienceMatch: boolean
  educationMatch: boolean
  overallAssessment: string
}

export interface Candidate {
  filename: string
  name: string
  email: string
  matchAnalysis: MatchAnalysis
  analysis: {
    key_skills: string[]
    education_details: Array<{
      degree: string
      major: string
      institute: string
    }>
    work_experience_details: any[]
  }
  tracking?: CandidateTracking
}

interface ResumeData {
  filename: string;
  analysis: {
    name: string;
    email: string;
  };
}


export type CandidateStatus = 
  | 'shortlisted'
  | 'contacted'
  | 'interested'
  | 'not_interested'
  | 'rate_confirmed'
  | 'interview_scheduled'
  | 'approved'
  | 'disapproved'
  | 'pending';

export interface CandidateTracking {
  status: CandidateStatus;
  rateConfirmed?: number;
  interviewDate?: Date;
  contactedDate?: Date;
  notes?: string;
  lastUpdated: Date;
  updatedBy: string;
}

export default function CandidatesPage() {
  const params = useParams()
  const jobId = params.jobId as string
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Add new state variables

  const [showFilters, setShowFilters] = useState(false);

  // Update the fetchResumes function
  const fetchResumes = async () => {
    try {
      // Get all users
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      let allResumes: any[] = [];

      // Fetch resumes from each user
      for (const userDoc of usersSnapshot.docs) {
        try {
          const userResumesRef = doc(db, "users", userDoc.id, "resumes", "data");
          const userResumesDoc = await getDoc(userResumesRef);
          
          if (userResumesDoc.exists()) {
            const userData = userResumesDoc.data();
            if (userData.resumes && Array.isArray(userData.resumes)) {
              // Add user information to each resume
              const userResumes = userData.resumes.map((resume: any) => ({
                ...resume,
                userId: userDoc.id,
                userEmail: userData.user_emailid || 'No email'
              }));
              allResumes = [...allResumes, ...userResumes];
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch resumes for user ${userDoc.id}:`, error);
          // Continue with next user instead of breaking the entire operation
          continue;
        }
      }

      console.log(`Successfully fetched ${allResumes.length} resumes`);
      return allResumes;

    } catch (error) {
      console.error("Error in fetchResumes:", error);
      throw new Error("Failed to fetch resumes");
    }
  };

  // Update the analyzeCandidates function to store profiles in the new location
  useEffect(() => {
    const analyzeCandidates = async () => {
      if (!user) {
        toast.error("Please sign in to view candidates");
        return;
      }

      setIsLoading(true);
      setIsAnalyzing(true);
      setAnalysisError(null);

      try {
        // First check if we have stored results in the new path
        const relevantProfilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles");
        const storedProfilesDoc = await getDoc(relevantProfilesRef);

        if (storedProfilesDoc.exists()) {
          const data = storedProfilesDoc.data();
          if (data.candidates?.length > 0) {
            console.log("Using stored relevant profiles");
            setCandidates(data.candidates);
            setIsAnalyzing(false);
            setIsLoading(false);
            return;
          }
        }

        // If no stored results, perform new analysis
        console.log("Performing new analysis");
        const jobDetailsRef = doc(db, "jobs", jobId, "data", "details");
        const jobDetailsDoc = await getDoc(jobDetailsRef);

        if (!jobDetailsDoc.exists()) {
          throw new Error("Job not found");
        }

        const jobData = jobDetailsDoc.data();
        const resumesData = await fetchResumes();

        if (resumesData.length === 0) {
          setAnalysisError("No resumes found in the system");
          return;
        }

        const analysisResults = await analyzeBatchMatches(jobData, resumesData);

        if (!analysisResults || analysisResults.length === 0) {
          setAnalysisError("No matching candidates found");
          return;
        }

        const matchedCandidates = analysisResults
          .filter(result => result.matchPercentage > 50)
          .map(result => ({
            filename: result.filename,
            name: resumesData.find((r: ResumeData) => r.filename === result.filename)?.analysis.name || "Unknown",
            email: resumesData.find((r: ResumeData) => r.filename === result.filename)?.analysis.email || "No email",
            matchAnalysis: {
              matchPercentage: result.matchPercentage,
              matchingSkills: result.matchingSkills || [],
              missingRequirements: result.missingRequirements || [],
              experienceMatch: result.experienceMatch || false,
              educationMatch: result.educationMatch || false,
              overallAssessment: result.overallAssessment || ""
            },
            analysis: resumesData.find((r: ResumeData) => r.filename === result.filename)?.analysis || {}
          }));

        // Store results in both locations using batch write
        const batch = writeBatch(db);

        // Store in original location
        const jobResumesRef = doc(db, "jobs", jobId, "resumes", "details");
        batch.set(jobResumesRef, {
          relevant_candidates: matchedCandidates,
          updated_at: new Date(),
          total_matches: matchedCandidates.length,
          status: "analyzed"
        });

        // Store in new relevant_profiles location
        batch.set(relevantProfilesRef, {
          candidates: matchedCandidates,
          metadata: {
            analyzed_at: new Date(),
            analyzed_by: user.email,
            total_candidates: matchedCandidates.length,
            total_resumes_analyzed: resumesData.length,
            job_id: jobId
          }
        });

        await batch.commit();
        setCandidates(matchedCandidates);

      } catch (error) {
        console.error("Error in analyzeCandidates:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to analyze candidates";
        setAnalysisError(errorMessage);
        toast.error(`Analysis failed: ${errorMessage}`);
      } finally {
        setIsLoading(false);
        setIsAnalyzing(false);
      }
    };

    analyzeCandidates();
  }, [jobId, user]);

  // Add function to load stored results if they exist
  useEffect(() => {
    const loadStoredResults = async () => {
      if (!jobId) return

      try {
        const jobResumesRef = doc(db, "jobs", jobId, "resumes", "details")
        const jobResumesDoc = await getDoc(jobResumesRef)

        if (jobResumesDoc.exists()) {
          const data = jobResumesDoc.data()
          if (data.relevant_candidates?.length > 0) {
            setCandidates(data.relevant_candidates)
            setIsAnalyzing(false)
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error("Error loading stored results:", error)
      }
    }

    loadStoredResults()
  }, [jobId])

  // Add debug info to the UI
//   const renderDebugInfo = () => {
//     if (!debugInfo) return null
//     return (
//       <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
//         <h4 className="font-medium mb-2">Debug Information:</h4>
//         <pre className="whitespace-pre-wrap">
//           {JSON.stringify(debugInfo, null, 2)}
//         </pre>
//       </div>
//     )
//   }

  const refreshCandidates = async () => {
    try {
      const relevantProfilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles");
      const storedProfilesDoc = await getDoc(relevantProfilesRef);

      if (storedProfilesDoc.exists()) {
        const data = storedProfilesDoc.data();
        if (data.candidates?.length > 0) {
          setCandidates(data.candidates);
        }
      }
    } catch (error) {
      console.error("Error refreshing candidates:", error);
      toast.error("Failed to refresh candidates");
    }
  };

  const { 
    currentView, 
    setCurrentView,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery
  } = useHiringStages()

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <motion.div
        className="flex-1 min-h-screen"
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : isSidebarOpen ? "16rem" : "4.5rem",
          width: isMobile ? "100%" : isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 4.5rem)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto py-8 px-4 md:px-8">
          {/* Add debug info */}
          {/* {process.env.NODE_ENV === 'development' && renderDebugInfo()} */}
          
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Details
          </Button>

          <h1 className="text-3xl font-bold mb-2">Relevant Candidates</h1>
          <p className="text-muted-foreground mb-8">
            Showing candidates matching the job requirements
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Button
                variant={currentView === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('list')}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={currentView === 'board' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('board')}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Board
              </Button>
            </div>

            <div className="flex-1 flex items-center gap-4">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as CandidateStatus | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="rate_confirmed">Rate Confirmed</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="disapproved">Disapproved</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : isAnalyzing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Analyzing candidates with AI...
              </p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Matching Candidates Found</h3>
              <p className="text-muted-foreground">
                Try adjusting the job requirements or check back later
              </p>
            </div>
          ) : (
            currentView === 'list' ? (
              <div className="grid gap-6">
                {candidates
                  .filter(candidate => 
                    statusFilter === 'all' || candidate.tracking?.status === statusFilter
                  )
                  .map((candidate) => (
                    <div
                      key={candidate.filename}
                      className="p-6 rounded-lg border hover:border-primary transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-semibold">{candidate.name}</h3>
                            <p className="text-muted-foreground">{candidate.email}</p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Matching Skills</h4>
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

                          {candidate.matchAnalysis.missingRequirements.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 text-yellow-600">Missing Requirements</h4>
                              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {candidate.matchAnalysis.missingRequirements.map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="text-sm text-muted-foreground">
                            <p>{candidate.matchAnalysis.overallAssessment}</p>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="text-3xl font-bold text-primary">
                            {candidate.matchAnalysis.matchPercentage}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Match Score
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
                      
                      <div className="mt-4 pt-4 border-t">
                        <CandidateActions 
                          candidate={candidate} 
                          jobId={jobId}
                          onUpdate={refreshCandidates} 
                        />
                      </div>
                      
                      {candidate.tracking && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          <p>Status: {candidate.tracking.status}</p>
                          {candidate.tracking.rateConfirmed && (
                            <p>Rate: ${candidate.tracking.rateConfirmed}/hr</p>
                          )}
                          {candidate.tracking.interviewDate && (
                            <p>Interview: {format(candidate.tracking.interviewDate, 'PPp')}</p>
                          )}
                          <p>Last updated: {format(candidate.tracking.lastUpdated, 'PPp')}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <HiringStagesBoard 
                candidates={candidates} 
                jobId={jobId}
                onCandidateUpdate={refreshCandidates}
              />
            )
          )}
        </div>
      </motion.div>
    </div>
  )
}
