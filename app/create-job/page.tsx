"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '@/FirebaseConfig' // Adjust the path to your Firebase configuration file
import { v4 as uuidv4 } from 'uuid'
import { SkillInput } from "@/components/skill-input"

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

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    employment_type: '',
    experience_required: '',
    salary_range: '',
    description: '',
    requirements: [],
    benefits: [],
    working_hours: '',
    mode_of_work: '',
    key_responsibilities: [],
    nice_to_have_skills: [],
    about_company: '',
    deadline: '',
  })

  const [skills, setSkills] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!user) throw new Error('User not authenticated')

      // Convert text areas with multiple lines to arrays
      const requirementsArray = formData.requirements.toString().split('\n').filter(Boolean)
      const benefitsArray = formData.benefits.toString().split('\n').filter(Boolean)
      const responsibilitiesArray = formData.key_responsibilities.toString().split('\n').filter(Boolean)
      const niceToHaveArray = formData.nice_to_have_skills.toString().split('\n').filter(Boolean)

      const jobData = {
        job_id: `job_${uuidv4()}`,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        employment_type: formData.employment_type,
        experience_required: formData.experience_required,
        salary_range: formData.salary_range,
        description: formData.description,
        status: 'active',
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
        resumes: [],
        metadata: {
          created_by: user.email || '',
          last_modified_by: user.email || ''
        }
      }

      // Add the job to Firestore
      const jobsRef = collection(db, 'jobs')
      await addDoc(jobsRef, jobData)

      toast({
        title: "Success",
        description: "Job posted successfully",
      })

      router.push('/job')
    } catch (error) {
      console.error('Error creating job:', error)
      toast({
        title: "Error",
        description: "Failed to post job",
        variant: "destructive",
      })
    }
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
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-3xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push('/job')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create New Job</h1>
            <p className="text-muted-foreground">Post a new job opportunity</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Job Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Tech Corp"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. New York, NY"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Employment Type</label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Minimum Experience</label>
                <Input
                  value={formData.experience_required}
                  onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                  placeholder="e.g. 5+ years"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Salary Range</label>
                <Input
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  placeholder="e.g. $120,000 - $150,000"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Working Hours</label>
                <Input
                  value={formData.working_hours}
                  onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  placeholder="e.g. 40 hours/week"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mode of Work</label>
                <Select
                  value={formData.mode_of_work}
                  onValueChange={(value) => setFormData({ ...formData, mode_of_work: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode of work" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="in-office">In-office</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Job Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed job description"
                  className="h-32"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Key Responsibilities</label>
                <Textarea
                  value={formData.key_responsibilities}
                  onChange={(e) => setFormData({ ...formData, key_responsibilities: e.target.value.split('\n') })}
                  placeholder="Enter detailed Key Responsibilities"
                  className="h-32"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Required Qualifications</label>
                <Textarea
                  value={formData.requirements.join('\n')}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value.split('\n') })}
                  placeholder="Enter Required Skills & Qualifications"
                  className="h-32"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Required Skills</label>
                <SkillInput
                  skills={skills}
                  setSkills={setSkills}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nice-to-Have Skills (Optional)</label>
                <Textarea
                  value={formData.nice_to_have_skills}
                  onChange={(e) => setFormData({ ...formData, nice_to_have_skills: e.target.value.split('\n') })}
                  placeholder="Enter Nice-to-Have Skills (Optional)"
                  className="h-32"
                />
              </div>

              <div>
                <label className="text-sm font-medium">About the Company (Optional)</label>
                <Textarea
                  value={formData.about_company}
                  onChange={(e) => setFormData({ ...formData, about_company: e.target.value })}
                  placeholder="Enter About the Company (Optional)"
                  className="h-32"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Benefits Offered</label>
                <Textarea
                  value={formData.benefits.join('\n')}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value.split('\n') })}
                  placeholder="Enter Benefits Offered"
                  className="h-32"
                  required
                />
              </div>
            </div>

            <div>
                <label className="text-sm font-medium">Application Deadline</label>
                <Input
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>

            <Button type="submit" className="w-full">
              Post Job
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
