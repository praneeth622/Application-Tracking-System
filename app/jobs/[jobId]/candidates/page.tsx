"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
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
  RefreshCw,
  Loader2,
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
import apiClient from "@/lib/api-client"

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
  userId?: string
  userEmail?: string
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
      // First try to get candidates for this job from the API
      const candidates = await apiClient.jobs.getCandidates(jobId);
      const existingCandidateFilenames = candidates.map(c => c.filename);
      console.log(`Found ${existingCandidateFilenames.length} existing candidates for job`);
      
      // Get all resumes to check for new ones
      console.log("Fetching all resumes to check for new ones");
      let allResumes = [];
      
      try {
        // Try to get all resumes from the dedicated endpoint
        allResumes = await apiClient.resumes.getAllForMatching();
        if (allResumes && allResumes.length > 0) {
          console.log(`Found ${allResumes.length} total resumes in the system`);
        } else {
          // Fallback approach if the dedicated endpoint returns empty
          allResumes = await fetchResumesFallback();
        }
      } catch (error) {
        console.error("Error fetching all resumes:", error);
        // Fallback to individual user approach
        allResumes = await fetchResumesFallback();
      }
      
      // Filter out resumes that have already been analyzed
      const newResumes = allResumes.filter(resume => 
        !existingCandidateFilenames.includes(resume.filename)
      );
      
      console.log(`Found ${newResumes.length} new resumes that need analysis`);
      
      // If we have new resumes, return them for analysis
      // If not, return existing candidates
      if (newResumes.length > 0) {
        return {
          resumes: newResumes,
          isNew: true
        };
      } else {
        return {
          resumes: candidates,
          isNew: false
        };
      }
    } catch (error) {
      console.error("Error in fetchResumes:", error);
      return {
        resumes: [],
        isNew: false
      };
    }
  }

  // Fallback method to fetch resumes if the central endpoint fails
  const fetchResumesFallback = async () => {
    try {
      // Create an array to store all resumes
      let allResumes: any[] = [];
      
      // Try to get current user's resumes first as the most reliable approach
      if (user && user.uid) {
        console.log("Fetching current user's resumes");
        try {
          const userResumes = await apiClient.resumes.getUserResumes(user.uid);
          
          if (userResumes && userResumes.length > 0) {
            console.log(`Found ${userResumes.length} resumes for current user`);
            
            const transformedResumes = userResumes.map((resume: any) => ({
              filename: resume.filename,
              analysis: resume.analysis || {
                name: "Unknown",
                email: "unknown@example.com",
                key_skills: [],
                education_details: [],
                work_experience_details: []
              },
              userId: user.uid,
              userEmail: user.email || "unknown@example.com"
            }));
            
            allResumes = transformedResumes;
          }
        } catch (error) {
          console.error("Error fetching current user's resumes:", error);
        }
      }
      
      // Try to get additional resumes if user might be admin
      try {
        const currentUserData = await apiClient.auth.getCurrentUser();
        if (currentUserData && currentUserData.role === 'admin') {
          console.log("User is admin, attempting to fetch all resumes from users");
          
          try {
            const users = await apiClient.auth.getAllUsers();
            
            if (users && users.length > 0) {
              console.log(`Found ${users.length} users to check for resumes`);
              
              // For each user, fetch their resumes (but skip current user as we already have those)
              for (const userItem of users) {
                if (userItem.uid && userItem.uid !== user?.uid) {
                  try {
                    const userResumes = await apiClient.resumes.getUserResumes(userItem.uid);
                    if (userResumes && userResumes.length > 0) {
                      console.log(`Found ${userResumes.length} resumes for user ${userItem.uid}`);
                      
                      const transformedResumes = userResumes.map((resume: any) => ({
                        filename: resume.filename,
                        analysis: resume.analysis || {
                          name: "Unknown",
                          email: "unknown@example.com",
                          key_skills: [],
                          education_details: [],
                          work_experience_details: []
                        },
                        userId: userItem.uid,
                        userEmail: userItem.email || "unknown@example.com"
                      }));
                      
                      allResumes = [...allResumes, ...transformedResumes];
                    }
                  } catch (err) {
                    // Continue to next user if we can't fetch this user's resumes
                    console.warn(`Couldn't fetch resumes for user ${userItem.uid}`);
                  }
                }
              }
            }
          } catch (error) {
            console.warn("Error fetching all users:", error);
          }
        } else {
          console.log("User is not admin, using only current user's resumes");
        }
      } catch (userError) {
        // This is normal for non-admin users
        console.log("Not allowed to access all users or error checking user status");
      }
      
      console.log(`Total resumes collected through fallback: ${allResumes.length}`);
      return allResumes;
    } catch (error) {
      console.error("Error in fetchResumesFallback:", error);
      return [];
    }
  }

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobData = await apiClient.jobs.getById(jobId);
        if (jobData) {
          setJobDetails(jobData);
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    }

    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    const analyzeCandidates = async () => {
      if (!user) {
        toast.error("Please sign in to view candidates")
        return
      }

      setIsLoading(true)
      setIsAnalyzing(true)

      try {
        // Fetch job details first so we have it for analysis
        const jobData = await apiClient.jobs.getById(jobId);
        
        if (!jobData) {
          toast.error("Job not found");
          setIsLoading(false);
          setIsAnalyzing(false);
          return;
        }
        
        setJobDetails(jobData);
        console.log("Job data retrieved:", jobData.title);
        
        // Get resumes and check if we have new ones
        const { resumes: resumesData, isNew } = await fetchResumes();
        
        if (resumesData.length === 0) {
          toast.error("No resumes found. Please upload resumes to find matching candidates.");
          setIsLoading(false);
          setIsAnalyzing(false);
          return;
        }
        
        // If we have existing candidates and no new resumes, just show them
        if (!isNew && resumesData.length > 0) {
          console.log("Using existing candidate analysis");
          
          // Filter out duplicate candidates
          const uniqueCandidates = filterDuplicateCandidates(resumesData);
          setDuplicatesRemoved(resumesData.length - uniqueCandidates.length);

          // Sort candidates by match percentage
          const sortedCandidates = uniqueCandidates.sort((a, b) => 
            b.matchAnalysis.matchPercentage - a.matchAnalysis.matchPercentage
          );

          setCandidates(sortedCandidates);
          setIsAnalyzing(false);
          setIsLoading(false);
          return;
        }
        
        // If we have new resumes, analyze them
        console.log(`Analyzing ${resumesData.length} resumes for matching candidates...`);
        toast.info(`Analyzing ${resumesData.length} resumes for matching candidates...`);
        
        const analysisResults = await analyzeBatchMatches(jobData, resumesData);

        if (!analysisResults || analysisResults.length === 0) {
          toast.error("No matching candidates found");
          console.log("No matching candidates found in analysis");
          setIsLoading(false);
          setIsAnalyzing(false);
          return;
        }

        console.log(`Found ${analysisResults.length} potential matches`);
        
        // Filter for candidates with > 50% match and map to Candidate structure
        const matchedCandidates = analysisResults
          .filter((result) => result !== null)
          .filter((result) => result.matchPercentage > 50)
          .map((result) => {
            const resumeData = resumesData.find((r) => r.filename === result.filename);
            return {
              filename: result.filename,
              name: resumeData?.analysis?.name || "Unknown",
              email: resumeData?.analysis?.email || "No email",
              matchAnalysis: {
                matchPercentage: result.matchPercentage,
                matchingSkills: result.matchingSkills || [],
                missingRequirements: result.missingRequirements || [],
                experienceMatch: result.experienceMatch || false,
                educationMatch: result.educationMatch || false,
                overallAssessment: result.overallAssessment || "",
              },
              analysis: {
                key_skills: resumeData?.analysis?.key_skills || [],
                education_details: resumeData?.analysis?.education_details || [],
                work_experience_details: resumeData?.analysis?.work_experience_details || [],
              },
              userId: resumeData?.userId,
              userEmail: resumeData?.userEmail,
            } as Candidate;
          });

        console.log(`${matchedCandidates.length} candidates matched with > 50% match rate`);
        
        // Get existing candidates to merge with new ones
        let existingCandidates = [];
        if (isNew) {
          try {
            existingCandidates = await apiClient.jobs.getCandidates(jobId);
            console.log(`Retrieved ${existingCandidates.length} existing candidates from database`);
          } catch (err) {
            console.log("No existing candidates found or error retrieving them");
          }
        }
        
        // Combine existing and new candidates
        const combinedCandidates = [...existingCandidates, ...matchedCandidates];
        
        // Filter out duplicate candidates
        const uniqueCandidates = filterDuplicateCandidates(combinedCandidates);
        console.log(`${uniqueCandidates.length} unique candidates after removing duplicates`);

        // Track how many duplicates were removed
        setDuplicatesRemoved(combinedCandidates.length - uniqueCandidates.length);

        try {
          // Store the candidates in the database
          // For new resumes, we're saving them
          // For existing candidates, this will update the data
          await apiClient.jobs.saveCandidates(jobId, uniqueCandidates);
          
          if (isNew) {
            toast.success(`Found ${matchedCandidates.length} new matching candidates and saved to database`);
          } else {
            toast.success(`Updated ${uniqueCandidates.length} candidates in database`);
          }
        } catch (saveError) {
          console.error("Error saving candidates:", saveError);
          
          // Get more detailed error information if available
          let errorMessage = "Failed to save analysis results";
          if (saveError instanceof Error) {
            errorMessage += `: ${saveError.message}`;
          }
          
          // Show error but continue with UI update
          toast.error(errorMessage, {
            duration: 4000,
            description: "Results are being shown but may not persist between sessions"
          });
        }

        // Final update to UI
        setCandidates(uniqueCandidates);
        
      } catch (error) {
        console.error("Error in analyzeCandidates:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to analyze candidates";
        toast.error(`Analysis failed: ${errorMessage}`);
      } finally {
        setIsLoading(false);
        setIsAnalyzing(false);
      }
    }

    analyzeCandidates();
  }, [jobId, user]);

  const refreshCandidates = async () => {
    try {
      setIsLoading(true);
      
      console.log(`Refreshing candidates for job ${jobId}`);
      
      // Fetch candidates using API client
      const candidatesData = await apiClient.jobs.getCandidates(jobId);
      
      if (candidatesData && candidatesData.length > 0) {
        console.log(`Retrieved ${candidatesData.length} candidates from API`);
        
        // Filter out duplicate candidates
        const uniqueCandidates = filterDuplicateCandidates(candidatesData);
        console.log(`After duplicate filtering: ${uniqueCandidates.length} candidates`);
        
        // Sort candidates by match percentage
        const sortedCandidates = uniqueCandidates.sort(
          (a: Candidate, b: Candidate) => b.matchAnalysis.matchPercentage - a.matchAnalysis.matchPercentage
        );
        
        // Apply status filter if needed
        let filteredCandidates = sortedCandidates;
        if (statusFilter !== 'all') {
          console.log(`Filtering by status: ${statusFilter}`);
          
          filteredCandidates = sortedCandidates.filter(
            (candidate) => candidate.tracking?.status === statusFilter
          );
          
          console.log(`After status filtering: ${filteredCandidates.length} candidates`);
        }
        
        // Check if any candidates have tracking information
        const candidatesWithTracking = sortedCandidates.filter(c => c.tracking && c.tracking.status);
        console.log(`Candidates with tracking: ${candidatesWithTracking.length}`);
        if (candidatesWithTracking.length > 0) {
          console.log(`Example tracking for first candidate: ${JSON.stringify(candidatesWithTracking[0].tracking)}`);
        }
        
        // Update state with filtered candidates
        setCandidates(filteredCandidates);
        toast.success("Candidates refreshed");
        
        // Return the refreshed candidates for any chained operations
        return filteredCandidates;
      } else {
        console.warn("No candidates found for this job");
        toast.error("No candidates found for this job");
        return [];
      }
    } catch (error) {
      console.error("Error refreshing candidates:", error);
      let errorMessage = "Failed to refresh candidates";
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        console.error(`Error details: ${JSON.stringify(error)}`);
      }
      
      toast.error(errorMessage);
      throw error; // Re-throw the error so callers can catch it
    } finally {
      setIsLoading(false);
    }
  }

  const { currentView, setCurrentView, statusFilter, searchQuery, setSearchQuery, setStatusFilter } = useHiringStages()

  // Updated lifecycle effect for tracking changes
  useEffect(() => {
    // We need to implement a different approach for real-time updates
    // with our API client. For now, we'll just do initial loading
    // and manual refreshes instead of real-time updates.
    
    // TODO: Implement a websocket or polling mechanism for real-time updates
    // when the backend support is available.
    
    // Initial load of candidates is handled in the other useEffect

    return () => {
      // Cleanup function
      // No need for cleanup with the current approach
    };
  }, [jobId]);

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

  // React to statusFilter changes
  useEffect(() => {
    if (candidates.length === 0 || !jobId) return;
    
    // We'll use refreshCandidates to handle the filtering
    refreshCandidates();
  }, [statusFilter]);

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

                <div className="flex items-center gap-2 ml-auto">
                  <Button 
                    size="sm" 
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        // Check for new resumes
                        const newResumeCheck = await apiClient.jobs.checkForNewResumes(jobId);
                        
                        if (newResumeCheck.hasNewResumes) {
                          toast.info(`Found ${newResumeCheck.newResumeCount} new resumes to analyze`);
                          // Force re-run of the analyzeCandidates effect by refreshing
                          await analyzeCandidates();
                        } else {
                          toast.success("All resumes have been analyzed. You're up to date!");
                          // Just refresh the current candidates
                          await refreshCandidates();
                        }
                      } catch (error) {
                        console.error("Error checking for new resumes:", error);
                        toast.error("Failed to check for new resumes");
                        // Fallback to just refreshing current candidates
                        await refreshCandidates();
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading || isAnalyzing}
                  >
                    {isLoading || isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Check for New Resumes
                      </>
                    )}
                  </Button>
                </div>
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

