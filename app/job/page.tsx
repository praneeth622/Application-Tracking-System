"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Briefcase, Building, MapPin, DollarSign } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from '@/FirebaseConfig'
import { toast } from '@/components/ui/use-toast'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ShowRelevantCandidatesButton } from "@/components/show-relevant-candidates-button"

interface Job {
  job_id: string
  title: string
  company: string
  location: string
  employment_type: string
  experience_required: string
  salary_range: string
  created_at: Date
  description: string
  status: string
  total_applications: number
  shortlisted: number
  rejected: number
  in_progress: number
  benefits: string[]
  requirements: string[]
  skills_required: string[]
  metadata: {
    created_by: string
    last_modified_by: string
  }
  assigned_recruiters?: string[]
}

export default function JobPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { user } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

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
              total_applications: data.total_applications,
              shortlisted: data.shortlisted,
              rejected: data.rejected,
              in_progress: data.in_progress,
              benefits: data.benefits || [],
              requirements: data.requirements || [],
              skills_required: data.skills_required || [],
              metadata: data.metadata || {
                created_by: '',
                last_modified_by: ''
              },
              assigned_recruiters: data.assigned_recruiters || []
            })
          }
        }

        setJobs(fetchedJobs)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load jobs",
          variant: "destructive"
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
    }
  }, [isMobile])

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setIsSheetOpen(true)
  }

  const JobDetailsSheet = () => {
    const [isAssigning, setIsAssigning] = useState(false)

    const handleAssignJob = async () => {
      if (!selectedJob || !user) return

      setIsAssigning(true)
      try {
        const jobDataRef = doc(db, "jobs", selectedJob.job_id, "data", "details")
        await updateDoc(jobDataRef, {
          assigned_recruiters: arrayUnion(user.uid),
          updated_at: new Date(),
          metadata: {
            ...selectedJob.metadata,
            last_modified_by: user.email
          }
        })

        toast({
          title: "Success",
          description: "Job assigned successfully!"
        })
        setIsSheetOpen(false)

        // Refresh the jobs list
        const updatedJobs = jobs.map(job =>
          job.job_id === selectedJob.job_id
            ? {
              ...job,
              assigned_recruiters: [...(job.assigned_recruiters || []), user.uid]
            }
            : job
        )
        setJobs(updatedJobs)

      } catch (error) {
        console.error("Error assigning job:", error)
        toast({
          title: "Error",
          description: "Failed to assign job",
          variant: "destructive"
        })
      } finally {
        setIsAssigning(false)
      }
    }

    if (!selectedJob) return null

    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">{selectedJob.title}</SheetTitle>
            <SheetDescription className="flex items-center text-base">
              <Building className="w-4 h-4 mr-2" />
              {selectedJob.company}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium mb-1">Location</p>
                <p className="text-muted-foreground">{selectedJob.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Employment Type</p>
                <p className="text-muted-foreground">{selectedJob.employment_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Experience Required</p>
                <p className="text-muted-foreground">{selectedJob.experience_required} years</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Salary Range</p>
                <p className="text-muted-foreground">{selectedJob.salary_range}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedJob.requirements.map((req, index) => (
                  <li key={index} className="text-muted-foreground">{req}</li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            {/* Skills */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills_required.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Benefits</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedJob.benefits.map((benefit, index) => (
                  <li key={index} className="text-muted-foreground">{benefit}</li>
                ))}
              </ul>
            </div>

            {/* Application Stats */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Application Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Total Applications</p>
                  <p className="text-2xl">{selectedJob.total_applications}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-700">Shortlisted</p>
                  <p className="text-2xl text-green-700">{selectedJob.shortlisted}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700">In Progress</p>
                  <p className="text-2xl text-yellow-700">{selectedJob.in_progress}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700">Rejected</p>
                  <p className="text-2xl text-red-700">{selectedJob.rejected}</p>
                </div>
              </div>
            </div>

            {/* Assignment and Candidates Buttons */}
            <div className="flex justify-end gap-4 border-t pt-4">
              <ShowRelevantCandidatesButton jobId={selectedJob.job_id} />
              <Button
                onClick={handleAssignJob}
                disabled={isAssigning || (selectedJob.assigned_recruiters || []).includes(user?.uid || '')}
                className="w-full sm:w-auto"
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Assigning...
                  </>
                ) : (selectedJob.assigned_recruiters || []).includes(user?.uid || '') ? (
                  "Already Assigned"
                ) : (
                  "Assign to Recruiter"
                )}
              </Button>
            </div>

            {/* Metadata */}
            <div className="text-sm text-muted-foreground border-t pt-4">
              <p>Posted by: {selectedJob.metadata.created_by}</p>
              <p>Created: {selectedJob.created_at.toLocaleString()}</p>
              <p>Status: <span className={`px-2 py-1 rounded-full text-xs ${selectedJob.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>{selectedJob.status}</span></p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Job Management</h1>
              <p className="text-muted-foreground">Create and manage your job postings</p>
            </div>
            <Button
              onClick={() => router.push('/create-job')}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Job
            </Button>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
                <p className="text-muted-foreground">
                  Start by creating your first job posting
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.job_id}
                  className="p-6 rounded-lg border hover:border-primary cursor-pointer transition-all"
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-muted-foreground">
                          <Building className="w-4 h-4 mr-2" />
                          {job.company}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {job.employment_type} • {job.experience_required} days
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {job.salary_range}
                        </div>
                      </div>

                      {/* Add application stats */}
                      <div className="mt-4 flex gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Applications: {job.total_applications}
                        </span>
                        <span className="text-green-500">
                          Shortlisted: {job.shortlisted}
                        </span>
                        <span className="text-yellow-500">
                          In Progress: {job.in_progress}
                        </span>
                        <span className="text-red-500">
                          Rejected: {job.rejected}
                        </span>
                      </div>
                      {job.assigned_recruiters?.includes(user?.uid || '') && (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mb-2">
                          Assigned to Recruiter
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm text-muted-foreground">
                        Posted {job.created_at.toLocaleDateString()}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {selectedJob && <JobDetailsSheet />}
      </motion.div>
    </div>
  )
}
