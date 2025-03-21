"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Briefcase, Building, MapPin, DollarSign } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  company: string
  location: string
  employmentType: string
  experience: string
  salary: string
  createdAt: Date
}

export default function JobPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { user } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([
    // Dummy data
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'New York, NY',
      employmentType: 'Full-time',
      experience: '5+ years',
      salary: '$120,000 - $150,000',
      createdAt: new Date(),
    },
    // Add more dummy jobs...
  ])

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [isMobile])

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
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-lg border hover:border-primary cursor-pointer transition-all"
                onClick={() => router.push(`/job/${job.id}`)}
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
                        {job.employmentType} • {job.experience}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {job.salary}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Posted {job.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
