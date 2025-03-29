"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { collection, getDocs, doc, getDoc, writeBatch, onSnapshot } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { ArrowLeft, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { analyzeBatchMatches } from "@/utils/analyze-match"
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

interface WorkExperience {
  company: string
  position: string
  duration?: {
    start: string
    end?: string
  }
  responsibilities?: string[]
  technologies?: string[]
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
    work_experience_details: WorkExperience[]
  }
  tracking?: CandidateTracking
}

interface ResumeData {
  filename: string
  analysis: {
    name: string
    email: string
    key_skills: string[]
    education_details: Array<{
      degree: string
      major: string
      institute: string
    }>
    work_experience_details: WorkExperience[]
  }
  userId: string
  userEmail: string
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

interface AdditionalStatusData {
  rateConfirmed?: number
  interviewDate?: string
  contactedDate?: string
  notes?: string
  reason?: string
  feedback?: string
}

interface StatusHistoryEntry {
  status: CandidateStatus
  timestamp: string
  updatedBy: string
  additionalData?: AdditionalStatusData
}

export interface CandidateTracking {
  status: CandidateStatus
  statusHistory: StatusHistoryEntry[]
  lastUpdated: string
  updatedBy: string
  rateConfirmed?: number
  interviewDate?: string
  contactedDate?: string
  notes?: string
  additionalData?: AdditionalStatusData
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
  

  const fetchResumes = async () => {
    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      let allResumes: ResumeData[] = [];

      for (const userDoc of usersSnapshot.docs) {
        try {
          const userResumesRef = doc(db, "users", userDoc.id, "resumes", "data");
          const userResumesDoc = await getDoc(userResumesRef);
          
          if (userResumesDoc.exists()) {
            const userData = userResumesDoc.data();
            if (userData.resumes && Array.isArray(userData.resumes)) {
              const userResumes = userData.resumes.map((resume: Omit<ResumeData, 'userId' | 'userEmail'>) => ({
                ...resume,
                userId: userDoc.id,
                userEmail: userData.user_emailid || 'No email'
              }));
              allResumes = [...allResumes, ...userResumes];
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch resumes for user ${userDoc.id}:`, error);
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

  useEffect(() => {
    const analyzeCandidates = async () => {
      if (!user) {
        toast.error("Please sign in to view candidates");
        return;
      }

      setIsLoading(true);
      setIsAnalyzing(true);
      

      try {
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

        console.log("Performing new analysis");
        const jobDetailsRef = doc(db, "jobs", jobId, "data", "details");
        const jobDetailsDoc = await getDoc(jobDetailsRef);

        if (!jobDetailsDoc.exists()) {
          throw new Error("Job not found");
        }

        const jobData = jobDetailsDoc.data();
        const resumesData = await fetchResumes();

        if (resumesData.length === 0) {
          toast.error("No resumes found in the system");
          setIsLoading(false);
          setIsAnalyzing(false);
          return;
        }

        const analysisResults = await analyzeBatchMatches(jobData, resumesData);

        if (!analysisResults || analysisResults.length === 0) {
          toast.error("No matching candidates found");
          return;
        }

        const matchedCandidates = analysisResults
          .filter(result => result.matchPercentage > 50)
          .map(result => {
            const resumeData = resumesData.find((r: ResumeData) => r.filename === result.filename);
            return {
              filename: result.filename,
              name: resumeData?.analysis.name || "Unknown",
              email: resumeData?.analysis.email || "No email",
              matchAnalysis: {
                matchPercentage: result.matchPercentage,
                matchingSkills: result.matchingSkills || [],
                missingRequirements: result.missingRequirements || [],
                experienceMatch: result.experienceMatch || false,
                educationMatch: result.educationMatch || false,
                overallAssessment: result.overallAssessment || ""
              },
              analysis: {
                key_skills: resumeData?.analysis.key_skills || [],
                education_details: resumeData?.analysis.education_details || [],
                work_experience_details: resumeData?.analysis.work_experience_details || []
              }
            } as Candidate;
          });

        const batch = writeBatch(db);

        const jobResumesRef = doc(db, "jobs", jobId, "resumes", "details");
        batch.set(jobResumesRef, {
          relevant_candidates: matchedCandidates,
          updated_at: new Date(),
          total_matches: matchedCandidates.length,
          status: "analyzed"
        });

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
        toast.error(`Analysis failed: ${errorMessage}`);
      } finally {
        setIsLoading(false);
        setIsAnalyzing(false);
      }
    };

    analyzeCandidates();
  }, [jobId, user]);

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

  const fetchCandidatesByStatus = async (status: CandidateStatus | 'all') => {
    try {
      const relevantProfilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles");
      const profilesDoc = await getDoc(relevantProfilesRef);

      if (!profilesDoc.exists()) {
        return [];
      }

      const data = profilesDoc.data();
      let filteredCandidates = data.candidates || [];

      if (status !== 'all') {
        filteredCandidates = filteredCandidates.filter(
          (candidate: Candidate) => candidate.tracking?.status === status
        );
      }

      return filteredCandidates.sort((a: Candidate, b: Candidate) => {
        const dateA = a.tracking?.lastUpdated ? new Date(a.tracking.lastUpdated).getTime() : 0;
        const dateB = b.tracking?.lastUpdated ? new Date(b.tracking.lastUpdated).getTime() : 0;
        return dateB - dateA;
      });

    } catch (error) {
      console.error("Error fetching candidates:", error);
      throw new Error("Failed to fetch candidates");
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

  useEffect(() => {
    if (!jobId) return;

    const relevantProfilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles");
    
    const unsubscribe = onSnapshot(relevantProfilesRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.candidates) {
          const filteredCandidates = statusFilter === 'all' 
            ? data.candidates 
            : data.candidates.filter((c: Candidate) => c.tracking?.status === statusFilter);
          
          const sortedCandidates = filteredCandidates.sort((a: Candidate, b: Candidate) => {
            const dateA = a.tracking?.lastUpdated ? new Date(a.tracking.lastUpdated).getTime() : 0;
            const dateB = b.tracking?.lastUpdated ? new Date(b.tracking.lastUpdated).getTime() : 0;
            return dateB - dateA;
          });

          setCandidates(sortedCandidates);
        }
      }
    }, (error) => {
      console.error("Error in real-time updates:", error);
      toast.error("Failed to get real-time updates");
    });

    return () => unsubscribe();
  }, [jobId, statusFilter]);

  const handleStatusFilterChange = async (newStatus: CandidateStatus | 'all') => {
    setStatusFilter(newStatus);
    setIsLoading(true);
    try {
      const filteredCandidates = await fetchCandidatesByStatus(newStatus);
      setCandidates(filteredCandidates);
    } catch  {
      toast.error("Failed to filter candidates");
    } finally {
      setIsLoading(false);
    }
  };

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
                onValueChange={(value) => handleStatusFilterChange(value as CandidateStatus | 'all')}
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
                            <p>Interview: {format(new Date(candidate.tracking.interviewDate), 'PPp')}</p>
                          )}
                          <p>Last updated: {format(new Date(candidate.tracking.lastUpdated), 'PPp')}</p>
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
