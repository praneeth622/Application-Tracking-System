"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Plus, Briefcase, Search, Filter, ArrowUpDown, List } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

// Import components
import { JobCard } from "@/components/job/job-card"
import { JobCardSkeleton } from "@/components/job/job-card-skeleton"
import { EmptyState } from "@/components/job/empty-state"
import { JobPagination } from "@/components/job/job-pagination"
import { JobDetailsSheet } from "@/components/job/job-details-sheet"

// Import types
import type { Job } from "@/types/job"

export default function JobPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { user } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [jobsPerPage, setJobsPerPage] = useState(9)
  const [paginatedJobs, setPaginatedJobs] = useState<Job[]>([])
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return

      try {
        const jobsCollection = collection(db, "jobs")
        const jobsSnapshot = await getDocs(jobsCollection)
        const fetchedJobs: Job[] = []

        // Fetch each job's data from the nested structure
        for (const jobDoc of jobsSnapshot.docs) {
          const jobDataRef = doc(db, "jobs", jobDoc.id, "data", "details")
          const jobDataSnap = await getDoc(jobDataRef)

          if (jobDataSnap.exists()) {
            const data = jobDataSnap.data()

            // Fetch the relevant profiles to get accurate application stats
            const applicationStats = {
              total_applications: data.total_applications || 0,
              shortlisted: data.shortlisted || 0,
              rejected: data.rejected || 0,
              in_progress: data.in_progress || 0,
            }

            try {
              // Try to get more accurate stats from the relevant_profiles collection
              const profilesRef = doc(db, "jobs", jobDoc.id, "relevant_profiles", "profiles")
              const profilesSnap = await getDoc(profilesRef)

              if (profilesSnap.exists() && profilesSnap.data().candidates) {
                const candidates = profilesSnap.data().candidates
                applicationStats.total_applications = candidates.length

                // Count candidates by status
                applicationStats.shortlisted = candidates.filter(
                  (c: any) => c.tracking?.status === "shortlisted" || c.tracking?.status === "approved",
                ).length

                applicationStats.rejected = candidates.filter(
                  (c: any) => c.tracking?.status === "disapproved" || c.tracking?.status === "not_interested",
                ).length

                applicationStats.in_progress = candidates.filter(
                  (c: any) =>
                    c.tracking?.status &&
                    c.tracking.status !== "shortlisted" &&
                    c.tracking.status !== "approved" &&
                    c.tracking.status !== "disapproved" &&
                    c.tracking.status !== "not_interested",
                ).length
              }
            } catch (error) {
              console.warn("Error fetching application stats:", error)
              // Continue with the default stats
            }

            fetchedJobs.push({
              job_id: jobDoc.id,
              title: data.title,
              company: data.company,
              location: data.location,
              employment_type: data.employment_type,
              experience_required: data.experience_required,
              salary_range: data.salary_range,
              created_at: data.created_at.toDate(),
              description: data.description,
              status: data.status,
              total_applications: applicationStats.total_applications,
              shortlisted: applicationStats.shortlisted,
              rejected: applicationStats.rejected,
              in_progress: applicationStats.in_progress,
              benefits: data.benefits || [],
              requirements: data.requirements || [],
              skills_required: data.skills_required || [],
              working_hours: data.working_hours,
              mode_of_work: data.mode_of_work,
              key_responsibilities: data.key_responsibilities,
              nice_to_have_skills: data.nice_to_have_skills,
              about_company: data.about_company,
              deadline: data.deadline,
              metadata: {
                created_by: data.metadata?.created_by || "",
                created_by_id: data.metadata?.created_by_id || "", // Store creator's ID
                last_modified_by: data.metadata?.last_modified_by || "",
              },
              assigned_recruiters: data.assigned_recruiters || [],
            })
          }
        }

        setJobs(fetchedJobs)
        setFilteredJobs(fetchedJobs)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load jobs",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [user])

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
      setJobsPerPage(6)
    } else {
      setJobsPerPage(viewMode === "grid" ? 9 : 6)
    }
  }, [isMobile, viewMode])

  useEffect(() => {
    let result = [...jobs]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.skills_required?.some((skill) => skill && skill.toLowerCase().includes(query)),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((job) => job.status === statusFilter)
    }

    // Apply sort
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return b.created_at.getTime() - a.created_at.getTime()
      } else {
        return a.created_at.getTime() - b.created_at.getTime()
      }
    })

    setFilteredJobs(result)
    setTotalPages(Math.ceil(result.length / jobsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [jobs, searchQuery, statusFilter, sortOrder, jobsPerPage])

  // Update paginated jobs when filtered jobs or pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * jobsPerPage
    const endIndex = startIndex + jobsPerPage
    setPaginatedJobs(filteredJobs.slice(startIndex, endIndex))
  }, [filteredJobs, currentPage, jobsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setIsSheetOpen(true)
  }

  const handleJobUpdate = (updatedJob: Job) => {
    setJobs((prevJobs) => prevJobs.map((job) => (job.job_id === updatedJob.job_id ? updatedJob : job)))
  }

  // Add job deletion function after the handleJobUpdate function
  const handleJobDelete = (jobId: string) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.job_id !== jobId))
        toast({
          title: "Success",
      description: "Job deleted successfully",
    })
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <motion.div
        className="flex-1 min-h-screen relative"
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : isSidebarOpen ? "16rem" : "4.5rem",
          width: isMobile ? "100%" : isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 4.5rem)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto py-8 px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Job Management</h1>
              <p className="text-muted-foreground">Create and manage your job postings</p>
            </div>
            <Button
              onClick={() => router.push("/create-job")}
              className="flex items-center bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Job
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-auto flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search jobs..."
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
                        {statusFilter === "all" ? "All Status" : statusFilter === "active" ? "Active" : "Inactive"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortOrder("newest")}>Newest First</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Oldest First</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  >
                    {viewMode === "grid" ? (
                      <>
                        <List className="w-4 h-4 mr-2" />
                        List View
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-4 h-4 mr-2" />
                        Grid View
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              hasFilters={searchQuery !== "" || statusFilter !== "all"}
              onCreateJob={() => router.push("/create-job")}
            />
          ) : (
            <>
              <AnimatePresence>
                <div
                  className={
                    viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid gap-4"
                  }
                >
                  {paginatedJobs.map((job) => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      viewMode={viewMode}
                      onClick={handleJobClick}
                      isAssignedToCurrentUser={(job.assigned_recruiters || []).includes(user?.uid || "")}
                    />
                  ))}
                </div>
              </AnimatePresence>

              <JobPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isMobile={isMobile}
              />
            </>
          )}
        </div>
      </motion.div>

      <JobDetailsSheet
        job={selectedJob}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onJobUpdate={handleJobUpdate}
        onDeleteJob={handleJobDelete}
        currentUserId={user?.uid}
      />
    </div>
  )
}

