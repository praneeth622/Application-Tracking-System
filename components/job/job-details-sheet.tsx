"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  CalendarIcon,
  ClockIcon,
  Globe,
  Award,
  Bookmark,
  Share2,
  FileText,
  BarChart4,
  Layers,
  Sparkles,
  Zap,
  Users,
  AlertCircle,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ShowRelevantCandidatesButton } from "@/components/show-relevant-candidates-button"
import { toast } from "@/components/ui/use-toast"
import type { Job } from "@/types/job"
import { doc, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { useRouter } from "next/navigation"

interface JobDetailsSheetProps {
  job: Job | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onJobUpdate: (updatedJob: Job) => void
  currentUserId?: string
  onDeleteJob?: (jobId: string) => void
}

export function JobDetailsSheet({
  job,
  isOpen,
  onOpenChange,
  onJobUpdate,
  currentUserId,
  onDeleteJob,
}: JobDetailsSheetProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  if (!job) return null

  // Check if the current user is the creator of the job
  const isJobCreator = currentUserId && job.metadata && job.metadata.created_by_id === currentUserId

  // Calculate application progress percentage
  const totalApplications = job.total_applications || 0
  const applicationProgress = totalApplications > 0 ? Math.round((job.shortlisted / totalApplications) * 100) : 0

  // Check if we have application data to display
  const hasApplicationData = totalApplications > 0

  const handleAssignJob = async () => {
    if (!job || !currentUserId) return

    setIsAssigning(true)
    try {
      const jobDataRef = doc(db, "jobs", job.job_id, "data", "details")
      await updateDoc(jobDataRef, {
        assigned_recruiters: arrayUnion(currentUserId),
        updated_at: new Date(),
        metadata: {
          ...job.metadata,
          last_modified_by: currentUserId,
        },
      })

      toast({
        title: "Success",
        description: "Job assigned successfully!",
      })

      // Update the job in the parent component
      const updatedJob = {
        ...job,
        assigned_recruiters: [...(job.assigned_recruiters || []), currentUserId],
      }
      onJobUpdate(updatedJob)
    } catch (error) {
      console.error("Error assigning job:", error)
      toast({
        title: "Error",
        description: "Failed to assign job",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked ? "Job has been removed from your bookmarks" : "Job has been added to your bookmarks",
    })
  }

  const shareJob = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${job.title} at ${job.company}`,
          text: `Check out this job: ${job.title} at ${job.company}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Job link has been copied to clipboard",
      })
    }
  }

  const handleDeleteJob = async () => {
    if (!job || !currentUserId) return

    setIsDeleting(true)
    try {
      // Delete the job document
      await deleteDoc(doc(db, "jobs", job.job_id))

      // Delete the details document in the nested structure
      await deleteDoc(doc(db, "jobs", job.job_id, "data", "details"))

      toast({
        title: "Success",
        description: "Job deleted successfully",
      })

      if (onDeleteJob) {
        onDeleteJob(job.job_id)
      }

      onOpenChange(false)
      router.push("/job")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const navigateToEditJob = () => {
    router.push(`/edit-job/${job.job_id}`)
    onOpenChange(false)
  }

  const navigateToCandidates = () => {
    router.push(`/jobs/${job.job_id}/candidates`)
    onOpenChange(false)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="p-6">
              <SheetHeader className="mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <SheetTitle className="text-2xl font-bold">{job.title}</SheetTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === "active" ? "default" : "destructive"} className="ml-2">
                      {job.status === "active" ? (
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                      )}
                      {job.status}
                    </Badge>

                    {isJobCreator && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete job</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {isJobCreator && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigateToEditJob()
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit job</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <SheetDescription className="flex items-center text-base">
                    <Building className="w-4 h-4 mr-2" />
                    {job.company}
                  </SheetDescription>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleBookmark()
                            }}
                          >
                            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              shareJob()
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share job</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </SheetHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {job.location && (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Location</span>
                    <span className="text-sm font-medium flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                      {job.location}
                    </span>
                  </div>
                )}
                {job.employment_type && (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Job Type</span>
                    <span className="text-sm font-medium flex items-center mt-1">
                      <Briefcase className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                      {job.employment_type}
                    </span>
                  </div>
                )}
                {job.experience_required && (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Experience</span>
                    <span className="text-sm font-medium flex items-center mt-1">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                      {job.experience_required}
                    </span>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Salary</span>
                    <span className="text-sm font-medium flex items-center mt-1">
                      <DollarSign className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                      {job.salary_range}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start rounded-none border-b p-0 h-auto">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Details
                </TabsTrigger>
                {hasApplicationData && (
                  <TabsTrigger
                    value="stats"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Stats
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="p-6 pt-4 space-y-6 m-0">
                {/* Job Summary */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Job Summary</h3>
                    {job.deadline && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        Deadline: {job.deadline}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                </div>

                <Separator />

                {/* Key Details - Only show if we have working hours or mode of work */}
                {(job.working_hours || job.mode_of_work) && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Key Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {job.working_hours && (
                          <div className="flex items-start gap-3">
                            <div className="bg-muted/50 p-2 rounded-md">
                              <ClockIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Working Hours</p>
                              <p className="text-sm text-muted-foreground">{job.working_hours}</p>
                            </div>
                          </div>
                        )}
                        {job.mode_of_work && (
                          <div className="flex items-start gap-3">
                            <div className="bg-muted/50 p-2 rounded-md">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Work Mode</p>
                              <p className="text-sm text-muted-foreground">{job.mode_of_work}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Skills - Only show if we have skills */}
                {job.skills_required && job.skills_required.length > 0 && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1.5 rounded-full">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {job.nice_to_have_skills && job.nice_to_have_skills.length > 0 && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Nice to Have Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.nice_to_have_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="px-3 py-1.5 rounded-full">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Application Stats Summary - Only show if we have applications */}
                {hasApplicationData && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Application Progress</h3>
                      <span className="text-sm text-muted-foreground">
                        {job.shortlisted} of {totalApplications} applications
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={applicationProgress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>{applicationProgress}% shortlisted</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="p-6 pt-4 space-y-6 m-0">
                {/* Requirements - Only show if we have requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Requirements</h3>
                      </div>
                      <ul className="space-y-2 pl-6">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="text-muted-foreground list-disc">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Key Responsibilities - Only show if we have responsibilities */}
                {job.key_responsibilities && job.key_responsibilities.length > 0 && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Key Responsibilities</h3>
                      </div>
                      <ul className="space-y-2 pl-6">
                        {job.key_responsibilities.map((resp, index) => (
                          <li key={index} className="text-muted-foreground list-disc">
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Benefits - Only show if we have benefits */}
                {job.benefits && job.benefits.length > 0 && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Benefits</h3>
                      </div>
                      <ul className="space-y-2 pl-6">
                        {job.benefits.map((benefit, index) => (
                          <li key={index} className="text-muted-foreground list-disc">
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                  </>
                )}

                {/* About Company - Only show if we have company info */}
                {job.about_company && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">About the Company</h3>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{job.about_company}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Posted Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Job Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {job.metadata?.created_by && (
                      <div>
                        <p className="text-sm font-medium">Posted by</p>
                        <p className="text-sm text-muted-foreground">{job.metadata.created_by}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Posted on</p>
                      <p className="text-sm text-muted-foreground">{format(job.created_at, "PPP")}</p>
                    </div>
                    {job.metadata?.last_modified_by && (
                      <div>
                        <p className="text-sm font-medium">Last modified by</p>
                        <p className="text-sm text-muted-foreground">{job.metadata.last_modified_by}</p>
                      </div>
                    )}
                    {job.deadline && (
                      <div>
                        <p className="text-sm font-medium">Application Deadline</p>
                        <p className="text-sm text-muted-foreground">{job.deadline}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Stats tab - Only show if we have application data */}
              {hasApplicationData && (
                <TabsContent value="stats" className="p-6 pt-4 space-y-6 m-0">
                  {/* Application Stats */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <BarChart4 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Application Statistics</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-none shadow-none bg-muted/30">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <Users className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-3xl font-bold">{job.total_applications || 0}</p>
                          <p className="text-sm text-muted-foreground">Total Applications</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none shadow-none bg-green-50 dark:bg-green-950/30">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                          <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                            {job.shortlisted || 0}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-400">Shortlisted</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none shadow-none bg-yellow-50 dark:bg-yellow-950/30">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <AlertCircle className="h-8 w-8 text-yellow-500 mb-2" />
                          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                            {job.in_progress || 0}
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">In Progress</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none shadow-none bg-red-50 dark:bg-red-950/30">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <XCircle className="h-8 w-8 text-red-500 mb-2" />
                          <p className="text-3xl font-bold text-red-700 dark:text-red-400">{job.rejected || 0}</p>
                          <p className="text-sm text-red-700 dark:text-red-400">Rejected</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* View Candidates Button */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Candidate Management</h3>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={navigateToCandidates}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View All Candidates for This Job
                    </Button>
                  </div>

                  <Separator />

                  {/* Application Progress */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Application Progress</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Shortlisted</span>
                          <span className="text-sm text-muted-foreground">
                            {totalApplications > 0 ? Math.round((job.shortlisted / totalApplications) * 100) : 0}%
                          </span>
                        </div>
                        <Progress
                          value={totalApplications > 0 ? (job.shortlisted / totalApplications) * 100 : 0}
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">In Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {totalApplications > 0 ? Math.round((job.in_progress / totalApplications) * 100) : 0}%
                          </span>
                        </div>
                        <Progress
                          value={totalApplications > 0 ? (job.in_progress / totalApplications) * 100 : 0}
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Rejected</span>
                          <span className="text-sm text-muted-foreground">
                            {totalApplications > 0 ? Math.round((job.rejected / totalApplications) * 100) : 0}%
                          </span>
                        </div>
                        <Progress
                          value={totalApplications > 0 ? (job.rejected / totalApplications) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Assignment Status */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Assignment Status</h3>
                    </div>
                    <Card className="border-none shadow-none bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Current Status</p>
                            <p className="text-sm text-muted-foreground">
                              {job.assigned_recruiters?.includes(currentUserId || "")
                                ? "Assigned to you"
                                : job.assigned_recruiters?.length
                                  ? `Assigned to ${job.assigned_recruiters.length} recruiter(s)`
                                  : "Not assigned"}
                            </p>
                          </div>
                          {job.assigned_recruiters?.length ? (
                            <div className="flex -space-x-2">
                              {job.assigned_recruiters.slice(0, 3).map((_, i) => (
                                <Avatar key={i} className="border-2 border-background h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    R{i + 1}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {job.assigned_recruiters.length > 3 && (
                                <Avatar className="border-2 border-background h-8 w-8">
                                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                    +{job.assigned_recruiters.length - 3}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="sticky bottom-0 bg-background border-t p-4 flex justify-between gap-4 mt-auto">
            <ShowRelevantCandidatesButton jobId={job.job_id} />
            <Button
              onClick={handleAssignJob}
              disabled={isAssigning || (job.assigned_recruiters || []).includes(currentUserId || "")}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Assigning...
                </>
              ) : (job.assigned_recruiters || []).includes(currentUserId || "") ? (
                "Already Assigned"
              ) : (
                "Assign to Recruiter"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting and remove all associated data
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteJob()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Job"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

