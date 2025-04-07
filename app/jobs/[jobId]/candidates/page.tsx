"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { collection, getDocs, doc, getDoc, writeBatch, onSnapshot } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import {
  ArrowLeft,
  LayoutGrid,
  Grid3X3,
  List,
  Search,
  Filter,
  SlidersHorizontal,
  User,
  Briefcase,
  GraduationCap,
  Clock,
  Mail,
  Calendar,
  DollarSign,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { analyzeBatchMatches } from "@/utils/analyze-match"
import { toast } from "sonner"
import { format } from "date-fns"
import { HiringStagesBoard } from "@/components/hiring-stages-board"
import { useHiringStages } from "@/store/hiring-stages"
import { Input } from "@/components/ui/input"
import { CandidateDetailsSheet } from "@/components/candidate-details-sheet"
import { CandidateGridView } from "@/components/candidate-grid-view"
import { Pagination } from "@/components/pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { filterDuplicateCandidates } from "@/utils/filter-duplicates"

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
  | "shortlisted"
  | "contacted"
  | "interested"
  | "not_interested"
  | "rate_confirmed"
  | "interview_scheduled"
  | "approved"
  | "disapproved"
  | "pending"

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

// Number of candidates to show per page
const CANDIDATES_PER_PAGE = 9

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
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [jobDetails, setJobDetails] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<"match" | "name" | "date">("match")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(0)

  const fetchResumes = async () => {
    try {

      let allResumes: ResumeData[] = [];
      
      // 1. First try to get job-specific resumes from the current job
      try {
        const jobResumesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles");
        const jobResumesDoc = await getDoc(jobResumesRef);
        
        if (jobResumesDoc.exists() && jobResumesDoc.data().resumes) {
          console.log(`Found job-specific resumes: ${jobResumesDoc.data().resumes.length}`);
          // Format job-specific resumes to match the ResumeData interface
          const jobResumes = jobResumesDoc.data().resumes.map((resume: any) => ({
            filename: resume.filename,
            analysis: {
              name: resume.name || resume.analysis?.name || "Unknown",
              email: resume.email || resume.analysis?.email || "No email",
              key_skills: resume.analysis?.key_skills || [],
              education_details: resume.analysis?.education_details || [],
              work_experience_details: resume.analysis?.work_experience_details || []
            },
            userId: resume.user_id || "unknown",
            userEmail: resume.user_emailid || resume.analysis?.email || "No email"
          }));
          
          allResumes = [...allResumes, ...jobResumes];
        }
      } catch (error) {
        console.warn("Failed to fetch job-specific resumes:", error);
      }
      
      // 2. Try to get resumes from users collection
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      console.log(`Found ${usersSnapshot.size} users`);
      
      for (const userDoc of usersSnapshot.docs) {
        try {
          const userId = userDoc.id;
          const userResumesRef = doc(db, "users", userId, "resumes", "data");
          console.log(`${userId} - Checking resumes at: ${userResumesRef.path}`);
          const userResumesDoc = await getDoc(userResumesRef);
          
          if (userResumesDoc.exists()) {
            const userData = userResumesDoc.data();
            console.log(`User data for ${userId}:`, userData);
            
            if (userData.resumes && Array.isArray(userData.resumes)) {
              console.log(`Found ${userData.resumes.length} resumes for user ${userId}`);
              
              const userResumes = userData.resumes.map((resume: any) => ({
                filename: resume.filename,
                analysis: {
                  name: resume.analysis?.name || "Unknown",
                  email: resume.analysis?.email || userData.user_emailid || "No email",
                  key_skills: resume.analysis?.key_skills || [],
                  education_details: resume.analysis?.education_details || [],
                  work_experience_details: resume.analysis?.work_experience_details || []
                },
                userId: userId,
                userEmail: userData.user_emailid || resume.analysis?.email || "No email"
              }));
              
              allResumes = [...allResumes, ...userResumes];

            }
          } else {
            // Try alternate path: some systems store at /users/{userId}/data/resumes
            try {
              const altUserResumesRef = doc(db, "users", userId, "data", "resumes");
              const altUserResumesDoc = await getDoc(altUserResumesRef);
              
              if (altUserResumesDoc.exists()) {
                const userData = altUserResumesDoc.data();
                console.log(`Found alternate resume path for ${userId}`);
                
                if (userData.resumes && Array.isArray(userData.resumes)) {
                  const userResumes = userData.resumes.map((resume: any) => ({
                    filename: resume.filename,
                    analysis: {
                      name: resume.analysis?.name || "Unknown",
                      email: resume.analysis?.email || "No email",
                      key_skills: resume.analysis?.key_skills || [],
                      education_details: resume.analysis?.education_details || [],
                      work_experience_details: resume.analysis?.work_experience_details || []
                    },
                    userId: userId,
                    userEmail: resume.analysis?.email || "No email"
                  }));
                  
                  allResumes = [...allResumes, ...userResumes];
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch from alternate path for user ${userId}:`, error);
            }
          }
        } catch (error) {

          console.warn(`Failed to fetch resumes for user ${userId}:`, error);
          continue;
        }
      }
      
      // 3. Check if we have resumes directly in the job document
      try {
        const jobRef = doc(db, "jobs", jobId);
        const jobDoc = await getDoc(jobRef);
        
        if (jobDoc.exists() && jobDoc.data().resumes && Array.isArray(jobDoc.data().resumes)) {
          console.log(`Found resumes directly in job document: ${jobDoc.data().resumes.length}`);
          const jobResumes = jobDoc.data().resumes.map((resume: any) => ({
            filename: resume.filename,
            analysis: {
              name: resume.name || resume.analysis?.name || "Unknown",
              email: resume.email || resume.analysis?.email || "No email",
              key_skills: resume.analysis?.key_skills || [],
              education_details: resume.analysis?.education_details || [],
              work_experience_details: resume.analysis?.work_experience_details || []
            },
            userId: resume.user_id || "unknown",
            userEmail: resume.user_emailid || resume.analysis?.email || "No email"
          }));
          
          allResumes = [...allResumes, ...jobResumes];
        }
      } catch (error) {
        console.warn("Failed to fetch resumes from job document:", error);
      }
      
      // 4. Finally check if job/resumes/data exists
      try {
        const jobResumesDataRef = doc(db, "jobs", jobId, "resumes", "data");
        const jobResumesDataDoc = await getDoc(jobResumesDataRef);
        
        if (jobResumesDataDoc.exists() && jobResumesDataDoc.data().resumes && Array.isArray(jobResumesDataDoc.data().resumes)) {
          console.log(`Found resumes in job/resumes/data: ${jobResumesDataDoc.data().resumes.length}`);
          const jobResumes = jobResumesDataDoc.data().resumes.map((resume: any) => ({
            filename: resume.filename,
            analysis: {
              name: resume.name || resume.analysis?.name || "Unknown",
              email: resume.email || resume.analysis?.email || "No email",
              key_skills: resume.analysis?.key_skills || [],
              education_details: resume.analysis?.education_details || [],
              work_experience_details: resume.analysis?.work_experience_details || []
            },
            userId: resume.user_id || "unknown",
            userEmail: resume.user_emailid || resume.analysis?.email || "No email"
          }));
          
          allResumes = [...allResumes, ...jobResumes];
        }
      } catch (error) {
        console.warn("Failed to fetch resumes from job/resumes/data:", error);
      }
  
      // 5. If still no resumes, try getting all resumes from all users in a flat structure
      if (allResumes.length === 0) {
        try {
          // This is a catch-all approach to get resumes from anywhere in the database
          const resumesCollection = collection(db, "resumes");
          const resumesSnapshot = await getDocs(resumesCollection);
          
          if (!resumesSnapshot.empty) {
            console.log(`Found ${resumesSnapshot.size} resumes in direct resumes collection`);
            
            resumesSnapshot.forEach(doc => {
              const resumeData = doc.data();
              allResumes.push({
                filename: resumeData.filename || doc.id,
                analysis: {
                  name: resumeData.name || resumeData.analysis?.name || "Unknown",
                  email: resumeData.email || resumeData.analysis?.email || "No email",
                  key_skills: resumeData.analysis?.key_skills || [],
                  education_details: resumeData.analysis?.education_details || [],
                  work_experience_details: resumeData.analysis?.work_experience_details || []
                },
                userId: resumeData.userId || "unknown",
                userEmail: resumeData.userEmail || resumeData.analysis?.email || "No email"
              });
            });
          }
        } catch (error) {
          console.warn("Failed to fetch from direct resumes collection:", error);
        }
      }
      
      // Remove duplicates based on filename
      const uniqueResumes = allResumes.filter((resume, index, self) =>
        index === self.findIndex(r => r.filename === resume.filename)
      );
      
      console.log(`Successfully fetched ${uniqueResumes.length} unique resumes`);
      return uniqueResumes;

    } catch (error) {
      console.error("Error in fetchResumes:", error)
      throw new Error("Failed to fetch resumes")
    }
  }

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobDetailsRef = doc(db, "jobs", jobId, "data", "details")
        const jobDetailsDoc = await getDoc(jobDetailsRef)

        if (jobDetailsDoc.exists()) {
          setJobDetails(jobDetailsDoc.data())
        }
      } catch (error) {
        console.error("Error fetching job details:", error)
      }
    }

    fetchJobDetails()
  }, [jobId])

  useEffect(() => {
    const analyzeCandidates = async () => {
      if (!user) {
        toast.error("Please sign in to view candidates")
        return
      }

      setIsLoading(true)
      setIsAnalyzing(true)

      try {

        const relevantProfilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles");
        const storedProfilesDoc = await getDoc(relevantProfilesRef);
        console.log("Stored profiles document exists:", storedProfilesDoc.exists());

        if (storedProfilesDoc.exists()) {
          const data = storedProfilesDoc.data();
          console.log("Stored profiles data:", data);

          if (data.candidates?.length > 0) {
            // Filter out duplicate candidates
            const allCandidates = data.candidates
            const uniqueCandidates = filterDuplicateCandidates(allCandidates)

            // Track how many duplicates were removed
            setDuplicatesRemoved(allCandidates.length - uniqueCandidates.length)

            // Sort candidates by match percentage
            const sortedCandidates = uniqueCandidates.sort((a: Candidate, b: Candidate) => {
              return b.matchAnalysis.matchPercentage - a.matchAnalysis.matchPercentage
            })

            setCandidates(sortedCandidates)
            setIsAnalyzing(false)
            setIsLoading(false)
            return
          }
        }


        console.log("Performing new analysis");
        const jobDetailsRef = doc(db, "jobs", jobId, "data", "details");
        const jobDetailsDoc = await getDoc(jobDetailsRef);
        console.log("Job details document exists:", jobDetailsDoc.exists());

        if (!jobDetailsDoc.exists()) {
          throw new Error("Job not found")
        }


        const jobData = jobDetailsDoc.data();
        console.log("Job data:", jobData);
        const resumesData = await fetchResumes();
        console.log("Resumes data:", resumesData);

        if (resumesData.length === 0) {
          toast.error("No resumes found in the system");
          console.log ("No resumes found");
          setIsLoading(false);
          setIsAnalyzing(false);
          return;

        }

        const analysisResults = await analyzeBatchMatches(jobData, resumesData)

        if (!analysisResults || analysisResults.length === 0) {

          toast.error("No matching candidates found");
          console.log ("No matching candidates found");
          return;

        }

        const matchedCandidates = analysisResults
          .filter((result) => result.matchPercentage > 50)
          .map((result) => {
            const resumeData = resumesData.find((r: ResumeData) => r.filename === result.filename)
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
                overallAssessment: result.overallAssessment || "",
              },
              analysis: {
                key_skills: resumeData?.analysis.key_skills || [],
                education_details: resumeData?.analysis.education_details || [],
                work_experience_details: resumeData?.analysis.work_experience_details || [],
              },
            } as Candidate
          })

        // Filter out duplicate candidates
        const uniqueCandidates = filterDuplicateCandidates(matchedCandidates)

        // Track how many duplicates were removed
        setDuplicatesRemoved(matchedCandidates.length - uniqueCandidates.length)

        const batch = writeBatch(db)

        const jobResumesRef = doc(db, "jobs", jobId, "resumes", "details")
        batch.set(jobResumesRef, {
          relevant_candidates: uniqueCandidates,
          updated_at: new Date(),
          total_matches: uniqueCandidates.length,
          status: "analyzed",
        })

        batch.set(relevantProfilesRef, {
          candidates: uniqueCandidates,
          metadata: {
            analyzed_at: new Date(),
            analyzed_by: user.email,
            total_candidates: uniqueCandidates.length,
            total_resumes_analyzed: resumesData.length,
            job_id: jobId,
          },
        })

        await batch.commit()
        setCandidates(uniqueCandidates)
      } catch (error) {
        console.error("Error in analyzeCandidates:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to analyze candidates"
        toast.error(`Analysis failed: ${errorMessage}`)
      } finally {
        setIsLoading(false)
        setIsAnalyzing(false)
      }
    }

    analyzeCandidates()
  }, [jobId, user])

  const refreshCandidates = async () => {
    try {
      const relevantProfilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles")
      const storedProfilesDoc = await getDoc(relevantProfilesRef)

      if (storedProfilesDoc.exists()) {
        const data = storedProfilesDoc.data()
        if (data.candidates?.length > 0) {
          // Filter out duplicate candidates
          const allCandidates = data.candidates
          const uniqueCandidates = filterDuplicateCandidates(allCandidates)

          // Track how many duplicates were removed
          setDuplicatesRemoved(allCandidates.length - uniqueCandidates.length)

          setCandidates(uniqueCandidates)
        }
      }
    } catch (error) {
      console.error("Error refreshing candidates:", error)
      toast.error("Failed to refresh candidates")
    }
  }

  const { currentView, setCurrentView, statusFilter, searchQuery, setSearchQuery } = useHiringStages()

  useEffect(() => {
    if (!jobId) return

    const relevantProfilesRef = doc(db, "jobs", jobId, "relevant_profiles", "profiles")

    const unsubscribe = onSnapshot(
      relevantProfilesRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          if (data.candidates) {
            // Filter by status if needed
            const statusFilteredCandidates =
              statusFilter === "all"
                ? data.candidates
                : data.candidates.filter((c: Candidate) => c.tracking?.status === statusFilter)

            // Filter out duplicate candidates
            const uniqueCandidates = filterDuplicateCandidates(statusFilteredCandidates)

            // Track how many duplicates were removed
            setDuplicatesRemoved(statusFilteredCandidates.length - uniqueCandidates.length)

            setCandidates(uniqueCandidates)
          }
        }
      },
      (error) => {
        console.error("Error in real-time updates:", error)
        toast.error("Failed to get real-time updates")
      },
    )

    return () => unsubscribe()
  }, [jobId, statusFilter])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery, sortBy, sortOrder])

  // Filter and sort candidates
  const filteredAndSortedCandidates = useMemo(() => {
    // First filter by search query
    const filtered = candidates.filter((candidate) => {
      if (!searchQuery) return true

      const query = searchQuery.toLowerCase()
      return (
        candidate.name?.toLowerCase().includes(query) ||
        candidate.email?.toLowerCase().includes(query) ||
        candidate.analysis.key_skills.some((skill) => skill && skill.toLowerCase().includes(query))
      )
    })

    // Then sort
    return [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "match":
          comparison = b.matchAnalysis.matchPercentage - a.matchAnalysis.matchPercentage
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "date":
          const dateA = a.tracking?.lastUpdated ? new Date(a.tracking.lastUpdated).getTime() : 0
          const dateB = b.tracking?.lastUpdated ? new Date(b.tracking.lastUpdated).getTime() : 0
          comparison = dateB - dateA
          break
      }

      return sortOrder === "asc" ? -comparison : comparison
    })
  }, [candidates, searchQuery, sortBy, sortOrder])

  // Paginate candidates
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * CANDIDATES_PER_PAGE
    return filteredAndSortedCandidates.slice(startIndex, startIndex + CANDIDATES_PER_PAGE)
  }, [filteredAndSortedCandidates, currentPage])

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCandidates.length / CANDIDATES_PER_PAGE))

  // Loading skeleton for candidate cards
  const CandidateCardSkeleton = () => (
    <div className="p-6 rounded-lg border animate-pulse">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-16 rounded-full" />
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16 px-4">
      <div className="bg-muted/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <User className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Candidates Found</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        {searchQuery || statusFilter !== "all"
          ? "Try adjusting your filters or search query"
          : "No matching candidates found for this job"}
      </p>
      <Button variant="outline" onClick={() => router.push("/job")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>
    </div>
  )

  // Candidate card component for list view
  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border hover:border-primary hover:shadow-md transition-all cursor-pointer p-6"
      onClick={() => setSelectedCandidate(candidate)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback className="bg-primary/10 text-primary">
              {candidate.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{candidate.name}</h3>
            <div className="flex items-center text-muted-foreground">
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              {candidate.email}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl font-bold text-primary">{candidate.matchAnalysis.matchPercentage}%</div>
                <div className="text-sm text-muted-foreground">Match Score</div>
              </div>
              <Progress value={candidate.matchAnalysis.matchPercentage} className="h-2 w-full max-w-xs" />
            </div>
          </div>
        </div>

        {candidate.tracking?.status && (
          <Badge
            variant={
              candidate.tracking.status === "shortlisted" || candidate.tracking.status === "approved"
                ? "default"
                : candidate.tracking.status === "not_interested" || candidate.tracking.status === "disapproved"
                  ? "destructive"
                  : "secondary"
            }
            className="text-xs"
          >
            {candidate.tracking.status.replace("_", " ")}
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Matching Skills</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {candidate.matchAnalysis.matchingSkills.slice(0, 5).map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
            >
              {skill}
            </Badge>
          ))}
          {candidate.matchAnalysis.matchingSkills.length > 5 && (
            <Badge variant="outline">+{candidate.matchAnalysis.matchingSkills.length - 5} more</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span
            className={
              candidate.matchAnalysis.experienceMatch
                ? "text-green-600 flex items-center"
                : "text-yellow-600 flex items-center"
            }
          >
            <Briefcase className="w-3.5 h-3.5 mr-1" />
            Experience: {candidate.matchAnalysis.experienceMatch ? "Match" : "Partial"}
          </span>
          <span
            className={
              candidate.matchAnalysis.educationMatch
                ? "text-green-600 flex items-center"
                : "text-yellow-600 flex items-center"
            }
          >
            <GraduationCap className="w-3.5 h-3.5 mr-1" />
            Education: {candidate.matchAnalysis.educationMatch ? "Match" : "Partial"}
          </span>
        </div>
      </div>

      {candidate.tracking && (
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground space-y-1">
          {candidate.tracking.rateConfirmed && (
            <div className="flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              Rate: ${candidate.tracking.rateConfirmed}/hr
            </div>
          )}
          {candidate.tracking.interviewDate && (
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Interview: {format(new Date(candidate.tracking.interviewDate), "PPp")}
            </div>
          )}
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Updated: {format(new Date(candidate.tracking.lastUpdated), "PP")}
          </div>
        </div>
      )}
    </motion.div>
  )

  // Toggle sort order
  const toggleSort = (type: "match" | "name" | "date") => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(type)
      setSortOrder("desc")
    }
  }

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
          <Button variant="ghost" className="mb-6 group" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Job Details
          </Button>

          {jobDetails && (
            <Card className="mb-8 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{jobDetails.title}</h2>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <Building className="w-4 h-4 mr-2" />
                      {jobDetails.company} • {jobDetails.location}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {jobDetails.employment_type}
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {jobDetails.experience_required}
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {jobDetails.mode_of_work}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <div className="text-sm text-muted-foreground mb-1">Matching Candidates</div>
                    <div className="text-3xl font-bold">{candidates.length}</div>
                    {duplicatesRemoved > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {duplicatesRemoved} duplicate profile{duplicatesRemoved !== 1 ? "s" : ""} filtered out
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold">Relevant Candidates</h1>
            <div className="flex items-center gap-2">
              <Button
                variant={currentView === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("list")}
                className="flex items-center"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={currentView === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("grid")}
                className="flex items-center"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={currentView === "board" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("board")}
                className="flex items-center"
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Board
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-auto flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      {statusFilter === "all" ? "All Status" : statusFilter.replace("_", " ")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "all" })}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "shortlisted" })}>
                      Shortlisted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "contacted" })}>
                      Contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "interested" })}>
                      Interested
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "not_interested" })}>
                      Not Interested
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "rate_confirmed" })}>
                      Rate Confirmed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "interview_scheduled" })}>
                      Interview Scheduled
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "approved" })}>
                      Approved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "disapproved" })}>
                      Disapproved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useHiringStages.setState({ statusFilter: "pending" })}>
                      Pending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Sort by: {sortBy === "match" ? "Match" : sortBy === "name" ? "Name" : "Date"}
                      {sortOrder === "asc" ? " (A-Z)" : " (Z-A)"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleSort("match")}>
                      Sort by Match {sortBy === "match" && (sortOrder === "desc" ? "↓" : "↑")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSort("name")}>
                      Sort by Name {sortBy === "name" && (sortOrder === "desc" ? "↓" : "↑")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSort("date")}>
                      Sort by Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <CandidateCardSkeleton key={index} />
                ))}
            </div>
          ) : isAnalyzing ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analyzing Candidates</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our AI is analyzing resumes to find the best matches for this job position
              </p>
            </div>
          ) : filteredAndSortedCandidates.length === 0 ? (
            <EmptyState />
          ) : currentView === "board" ? (
            <HiringStagesBoard
              candidates={filteredAndSortedCandidates}
              jobId={jobId}
              onCandidateUpdate={refreshCandidates}
            />
          ) : (
            <>
              <AnimatePresence>
                {currentView === "list" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedCandidates.map((candidate) => (
                      <CandidateCard key={candidate.filename} candidate={candidate} />
                    ))}
                  </div>
                ) : (
                  <CandidateGridView candidates={paginatedCandidates} onSelectCandidate={setSelectedCandidate} />
                )}
              </AnimatePresence>

              {/* Pagination */}
              {filteredAndSortedCandidates.length > CANDIDATES_PER_PAGE && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}

              {/* Results summary */}
              <div className="text-center text-sm text-muted-foreground mt-4">
                Showing {paginatedCandidates.length} of {filteredAndSortedCandidates.length} candidates
                {duplicatesRemoved > 0 && ` (${duplicatesRemoved} duplicates filtered out)`}
              </div>
            </>
          )}

          <CandidateDetailsSheet
            candidate={selectedCandidate}
            jobId={jobId}
            isOpen={!!selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            onUpdate={refreshCandidates}
          />
        </div>
      </motion.div>
    </div>
  )
}

