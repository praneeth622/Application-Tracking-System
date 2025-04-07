"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Calendar, CheckCircle } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Timestamp, doc, writeBatch } from "firebase/firestore"
import { db } from "@/FirebaseConfig" // Adjust the path to your Firebase configuration file
import { v4 as uuidv4 } from "uuid"
import { SkillInput } from "@/components/skill-input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface JobFormData {
  title: string
  company: string
  location: string
  employment_type: string
  experience_required: string
  salary_range: string
  description: string
  requirements: string[]
  benefits: string[]
  working_hours: string
  mode_of_work: string
  key_responsibilities: string[]
  nice_to_have_skills: string[]
  about_company: string
  deadline: string
}

export default function CreateJobPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    company: "",
    location: "",
    employment_type: "",
    experience_required: "",
    salary_range: "",
    description: "",
    requirements: [],
    benefits: [],
    working_hours: "",
    mode_of_work: "",
    key_responsibilities: [],
    nice_to_have_skills: [],
    about_company: "",
    deadline: "",
  })

  const [skills, setSkills] = useState<string[]>([])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Basic info validation
    if (!formData.title) errors.title = "Job title is required"
    if (!formData.company) errors.company = "Company name is required"
    if (!formData.location) errors.location = "Location is required"
    if (!formData.employment_type) errors.employment_type = "Employment type is required"
    if (!formData.experience_required) errors.experience_required = "Experience is required"
    if (!formData.salary_range) errors.salary_range = "Salary range is required"
    if (!formData.description) errors.description = "Job description is required"
    if (!formData.working_hours) errors.working_hours = "Working hours is required"
    if (!formData.mode_of_work) errors.mode_of_work = "Mode of work is required"
    if (!formData.deadline) errors.deadline = "Application deadline is required"

    // Requirements validation
    if (formData.requirements.length === 0 || (formData.requirements.length === 1 && !formData.requirements[0])) {
      errors.requirements = "At least one requirement is required"
    }

    // Benefits validation
    if (formData.benefits.length === 0 || (formData.benefits.length === 1 && !formData.benefits[0])) {
      errors.benefits = "At least one benefit is required"
    }

    // Skills validation
    if (skills.length === 0) {
      errors.skills = "At least one required skill is required"
    }

    // Responsibilities validation
    if (
      formData.key_responsibilities.length === 0 ||
      (formData.key_responsibilities.length === 1 && !formData.key_responsibilities[0])
    ) {
      errors.key_responsibilities = "At least one responsibility is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Find the first tab with errors and switch to it
      if (
        Object.keys(formErrors).some((key) =>
          [
            "title",
            "company",
            "location",
            "employment_type",
            "experience_required",
            "salary_range",
            "description",
          ].includes(key),
        )
      ) {
        setActiveTab("basic")
      } else if (
        Object.keys(formErrors).some((key) => ["requirements", "skills", "nice_to_have_skills"].includes(key))
      ) {
        setActiveTab("requirements")
      } else if (
        Object.keys(formErrors).some((key) => ["key_responsibilities", "working_hours", "mode_of_work"].includes(key))
      ) {
        setActiveTab("details")
      } else if (Object.keys(formErrors).some((key) => ["benefits", "about_company", "deadline"].includes(key))) {
        setActiveTab("additional")
      }

      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (!user) throw new Error("User not authenticated")

      // Generate a unique job ID
      const jobId = `job_${uuidv4()}`

      // Convert text areas with multiple lines to arrays
      const requirementsArray =
        typeof formData.requirements === "string"
          ? formData.requirements.split("\n").filter(Boolean)
          : formData.requirements.filter(Boolean)

      const benefitsArray =
        typeof formData.benefits === "string"
          ? formData.benefits.split("\n").filter(Boolean)
          : formData.benefits.filter(Boolean)

      const responsibilitiesArray =
        typeof formData.key_responsibilities === "string"
          ? formData.key_responsibilities.split("\n").filter(Boolean)
          : formData.key_responsibilities.filter(Boolean)

      const niceToHaveArray =
        typeof formData.nice_to_have_skills === "string"
          ? formData.nice_to_have_skills.split("\n").filter(Boolean)
          : formData.nice_to_have_skills.filter(Boolean)

      // Create job data object
      const jobData = {
        job_id: jobId,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        employment_type: formData.employment_type,
        experience_required: formData.experience_required,
        salary_range: formData.salary_range,
        description: formData.description,
        status: "active",
        total_applications: 0,
        shortlisted: 0,
        rejected: 0,
        in_progress: 0,
        benefits: benefitsArray,
        requirements: requirementsArray,
        skills_required: skills,
        working_hours: formData.working_hours,
        mode_of_work: formData.mode_of_work,
        key_responsibilities: responsibilitiesArray,
        nice_to_have_skills: niceToHaveArray,
        about_company: formData.about_company,
        deadline: formData.deadline,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        hr_id: user.uid,
        metadata: {
          created_by: user.email || "",
          last_modified_by: user.email || "",
        },
      }

      // Create the nested structure
      const jobRef = doc(db, "jobs", jobId)
      const jobDetailsRef = doc(db, "jobs", jobId, "data", "details")
      const jobResumesRef = doc(db, "jobs", jobId, "resumes", "details")

      // Create a batch to ensure all writes succeed or fail together
      const batch = writeBatch(db)

      // Add the job document
      batch.set(jobRef, {
        created_at: Timestamp.now(),
        hr_id: user.uid,
      })

      // Add job details
      batch.set(jobDetailsRef, jobData)

      // Initialize resumes collection
      batch.set(jobResumesRef, {
        resumes: [],
        updated_at: Timestamp.now(),
      })

      // Commit the batch
      await batch.commit()

      toast({
        title: "Success",
        description: "Job posted successfully",
      })

      router.push("/job")
    } catch (error) {
      console.error("Error creating job:", error)
      toast({
        title: "Error",
        description: "Failed to post job",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear error for this field if it exists
    if (formErrors[field]) {
      const newErrors = { ...formErrors }
      delete newErrors[field]
      setFormErrors(newErrors)
    }
  }

  const handleTextAreaChange = (field: keyof JobFormData, value: string) => {
    const arrayValue = value.split("\n")
    setFormData({ ...formData, [field]: arrayValue })
    // Clear error for this field if it exists
    if (formErrors[field]) {
      const newErrors = { ...formErrors }
      delete newErrors[field]
      setFormErrors(newErrors)
    }
  }

  const getCompletionPercentage = () => {
    const totalFields = 14 // Total number of required fields
    const filledFields = [
      formData.title,
      formData.company,
      formData.location,
      formData.employment_type,
      formData.experience_required,
      formData.salary_range,
      formData.description,
      formData.requirements.length > 0 && formData.requirements[0] !== "",
      formData.benefits.length > 0 && formData.benefits[0] !== "",
      formData.working_hours,
      formData.mode_of_work,
      formData.key_responsibilities.length > 0 && formData.key_responsibilities[0] !== "",
      skills.length > 0,
      formData.deadline,
    ].filter(Boolean).length

    return Math.round((filledFields / totalFields) * 100)
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
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl">
          <Button variant="ghost" className="mb-6 group" onClick={() => router.push("/job")}>
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Jobs
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create New Job</h1>
            <p className="text-muted-foreground">Post a new job opportunity for candidates</p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Job Creation Progress</h3>
                    <p className="text-sm text-muted-foreground">Fill in all required fields to post the job</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-primary/20 relative">
                    <div
                      className="absolute inset-0 rounded-full border-4 border-primary"
                      style={{
                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                        clipPath: `path('M 50 0 A 50 50 0 ${getCompletionPercentage() >= 50 ? 1 : 0} 1 ${50 + 50 * Math.cos((2 * Math.PI * getCompletionPercentage()) / 100)} ${50 + 50 * Math.sin((2 * Math.PI * getCompletionPercentage()) / 100)} L 50 50 Z')`,
                      }}
                    ></div>
                    <span className="text-lg font-bold">{getCompletionPercentage()}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="basic" className="relative">
                  Basic Info
                  {Object.keys(formErrors).some((key) =>
                    [
                      "title",
                      "company",
                      "location",
                      "employment_type",
                      "experience_required",
                      "salary_range",
                      "description",
                    ].includes(key),
                  ) && <span className="absolute top-0 right-1 w-2 h-2 bg-destructive rounded-full"></span>}
                </TabsTrigger>
                <TabsTrigger value="requirements" className="relative">
                  Requirements
                  {Object.keys(formErrors).some((key) =>
                    ["requirements", "skills", "nice_to_have_skills"].includes(key),
                  ) && <span className="absolute top-0 right-1 w-2 h-2 bg-destructive rounded-full"></span>}
                </TabsTrigger>
                <TabsTrigger value="details" className="relative">
                  Job Details
                  {Object.keys(formErrors).some((key) =>
                    ["key_responsibilities", "working_hours", "mode_of_work"].includes(key),
                  ) && <span className="absolute top-0 right-1 w-2 h-2 bg-destructive rounded-full"></span>}
                </TabsTrigger>
                <TabsTrigger value="additional" className="relative">
                  Additional Info
                  {Object.keys(formErrors).some((key) => ["benefits", "about_company", "deadline"].includes(key)) && (
                    <span className="absolute top-0 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Basic Information</CardTitle>
                    <CardDescription>Enter the fundamental details about the job position</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className={formErrors.title ? "text-destructive" : ""}>
                          Job Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className={formErrors.title ? "border-destructive" : ""}
                        />
                        {formErrors.title && <p className="text-sm text-destructive">{formErrors.title}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className={formErrors.company ? "text-destructive" : ""}>
                          Company Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          placeholder="e.g. Tech Corp"
                          className={formErrors.company ? "border-destructive" : ""}
                        />
                        {formErrors.company && <p className="text-sm text-destructive">{formErrors.company}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className={formErrors.location ? "text-destructive" : ""}>
                          Location <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            placeholder="e.g. New York, NY"
                            className={`pl-9 ${formErrors.location ? "border-destructive" : ""}`}
                          />
                        </div>
                        {formErrors.location && <p className="text-sm text-destructive">{formErrors.location}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="employment_type"
                          className={formErrors.employment_type ? "text-destructive" : ""}
                        >
                          Employment Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.employment_type}
                          onValueChange={(value) => handleInputChange("employment_type", value)}
                        >
                          <SelectTrigger
                            id="employment_type"
                            className={formErrors.employment_type ? "border-destructive" : ""}
                          >
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.employment_type && (
                          <p className="text-sm text-destructive">{formErrors.employment_type}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="experience_required"
                          className={formErrors.experience_required ? "text-destructive" : ""}
                        >
                          Minimum Experience <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="experience_required"
                            value={formData.experience_required}
                            onChange={(e) => handleInputChange("experience_required", e.target.value)}
                            placeholder="e.g. 5+ years"
                            className={`pl-9 ${formErrors.experience_required ? "border-destructive" : ""}`}
                          />
                        </div>
                        {formErrors.experience_required && (
                          <p className="text-sm text-destructive">{formErrors.experience_required}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salary_range" className={formErrors.salary_range ? "text-destructive" : ""}>
                          Salary Range <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="salary_range"
                            value={formData.salary_range}
                            onChange={(e) => handleInputChange("salary_range", e.target.value)}
                            placeholder="e.g. $120,000 - $150,000"
                            className={`pl-9 ${formErrors.salary_range ? "border-destructive" : ""}`}
                          />
                        </div>
                        {formErrors.salary_range && (
                          <p className="text-sm text-destructive">{formErrors.salary_range}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className={formErrors.description ? "text-destructive" : ""}>
                        Job Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Enter detailed job description"
                        className={`min-h-32 ${formErrors.description ? "border-destructive" : ""}`}
                      />
                      {formErrors.description && <p className="text-sm text-destructive">{formErrors.description}</p>}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="button" onClick={() => setActiveTab("requirements")}>
                      Continue to Requirements
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Requirements & Skills</CardTitle>
                    <CardDescription>Define the qualifications and skills needed for this position</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="requirements" className={formErrors.requirements ? "text-destructive" : ""}>
                        Required Qualifications <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="requirements"
                        value={formData.requirements.join("\n")}
                        onChange={(e) => handleTextAreaChange("requirements", e.target.value)}
                        placeholder="Enter each requirement on a new line"
                        className={`min-h-32 ${formErrors.requirements ? "border-destructive" : ""}`}
                      />
                      {formErrors.requirements && <p className="text-sm text-destructive">{formErrors.requirements}</p>}
                      <p className="text-sm text-muted-foreground">Enter each requirement on a new line</p>
                    </div>

                    <div className="space-y-2">
                      <Label className={formErrors.skills ? "text-destructive" : ""}>
                        Required Skills <span className="text-destructive">*</span>
                      </Label>
                      <SkillInput
                        skills={skills}
                        setSkills={setSkills}
                        className={formErrors.skills ? "border-destructive" : ""}
                      />
                      {formErrors.skills && <p className="text-sm text-destructive">{formErrors.skills}</p>}
                      <p className="text-sm text-muted-foreground">Press Enter or comma to add a skill</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nice_to_have_skills">
                        Nice-to-Have Skills <span className="text-muted-foreground">(Optional)</span>
                      </Label>
                      <Textarea
                        id="nice_to_have_skills"
                        value={formData.nice_to_have_skills.join("\n")}
                        onChange={(e) => handleTextAreaChange("nice_to_have_skills", e.target.value)}
                        placeholder="Enter each nice-to-have skill on a new line"
                        className="min-h-24"
                      />
                      <p className="text-sm text-muted-foreground">Enter each skill on a new line</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("details")}>
                      Continue to Job Details
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Job Details</CardTitle>
                    <CardDescription>
                      Provide specific details about the job responsibilities and working conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="key_responsibilities"
                        className={formErrors.key_responsibilities ? "text-destructive" : ""}
                      >
                        Key Responsibilities <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="key_responsibilities"
                        value={formData.key_responsibilities.join("\n")}
                        onChange={(e) => handleTextAreaChange("key_responsibilities", e.target.value)}
                        placeholder="Enter each responsibility on a new line"
                        className={`min-h-32 ${formErrors.key_responsibilities ? "border-destructive" : ""}`}
                      />
                      {formErrors.key_responsibilities && (
                        <p className="text-sm text-destructive">{formErrors.key_responsibilities}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Enter each responsibility on a new line</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="working_hours" className={formErrors.working_hours ? "text-destructive" : ""}>
                          Working Hours <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="working_hours"
                            value={formData.working_hours}
                            onChange={(e) => handleInputChange("working_hours", e.target.value)}
                            placeholder="e.g. 40 hours/week"
                            className={`pl-9 ${formErrors.working_hours ? "border-destructive" : ""}`}
                          />
                        </div>
                        {formErrors.working_hours && (
                          <p className="text-sm text-destructive">{formErrors.working_hours}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mode_of_work" className={formErrors.mode_of_work ? "text-destructive" : ""}>
                          Mode of Work <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.mode_of_work}
                          onValueChange={(value) => handleInputChange("mode_of_work", value)}
                        >
                          <SelectTrigger
                            id="mode_of_work"
                            className={formErrors.mode_of_work ? "border-destructive" : ""}
                          >
                            <SelectValue placeholder="Select mode of work" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="in-office">In-office</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.mode_of_work && (
                          <p className="text-sm text-destructive">{formErrors.mode_of_work}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("requirements")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("additional")}>
                      Continue to Additional Info
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="additional" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Additional Information</CardTitle>
                    <CardDescription>Add final details about the company and application process</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="benefits" className={formErrors.benefits ? "text-destructive" : ""}>
                        Benefits Offered <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="benefits"
                        value={formData.benefits.join("\n")}
                        onChange={(e) => handleTextAreaChange("benefits", e.target.value)}
                        placeholder="Enter each benefit on a new line"
                        className={`min-h-32 ${formErrors.benefits ? "border-destructive" : ""}`}
                      />
                      {formErrors.benefits && <p className="text-sm text-destructive">{formErrors.benefits}</p>}
                      <p className="text-sm text-muted-foreground">Enter each benefit on a new line</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="about_company">
                        About the Company <span className="text-muted-foreground">(Optional)</span>
                      </Label>
                      <Textarea
                        id="about_company"
                        value={formData.about_company}
                        onChange={(e) => handleInputChange("about_company", e.target.value)}
                        placeholder="Enter information about the company"
                        className="min-h-24"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline" className={formErrors.deadline ? "text-destructive" : ""}>
                        Application Deadline <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => handleInputChange("deadline", e.target.value)}
                          className={`pl-9 ${formErrors.deadline ? "border-destructive" : ""}`}
                        />
                      </div>
                      {formErrors.deadline && <p className="text-sm text-destructive">{formErrors.deadline}</p>}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Posting Job...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Post Job
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {Object.keys(formErrors).length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Error</AlertTitle>
                    <AlertDescription>Please fill in all required fields before submitting the form.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

