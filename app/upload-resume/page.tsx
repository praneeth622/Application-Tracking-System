"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, CheckCircle, ChevronRight, Search, User, BarChart2, Sparkles } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DragDropUpload } from "@/components/drag-drop-upload"
import { RecentFileCard } from "@/components/recent-file-card"
import { useMobile } from "@/hooks/use-mobile"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/context/auth-context"
import { UserDropdown } from "@/components/user-dropdown"

export default function UploadResumePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMobile()
  const { user } = useAuth()

  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [isMobile])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content */}
        <motion.div
          className="flex-1 min-h-screen relative"
          initial={false}
          animate={{
            marginLeft: isMobile ? 0 : isSidebarOpen ? "16rem" : "4.5rem",
            width: isMobile ? "100%" : isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 4.5rem)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <header className="bg-background/70 backdrop-blur-xl border-b border-primary/10 sticky top-0 z-30">
            <div className="max-w-full px-4 md:px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-muted-foreground text-sm">Upload and analyze your resume</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative hidden md:block">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="py-2 pl-9 pr-4 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors w-[200px]"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>

                  <UserDropdown user={user} />
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-full px-4 md:px-8 py-8">
            <div className="mb-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                ATS Resume Analyzer
              </div>
              <h2 className="text-3xl font-bold mb-2">Upload Your Resume</h2>
              <p className="text-muted-foreground">
                Our AI will analyze your resume against ATS systems and provide detailed feedback
              </p>
            </div>

            {/* Upload Section */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <DragDropUpload />

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Recent Uploads</h3>
                    <button className="text-sm text-primary flex items-center hover:underline">
                      View all <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <RecentFileCard
                      fileName="resume-john-doe-2023.pdf"
                      fileSize="1.2 MB"
                      uploadDate="Today at 2:30 PM"
                      score={85}
                    />

                    <RecentFileCard
                      fileName="john-doe-software-engineer.pdf"
                      fileSize="0.9 MB"
                      uploadDate="Yesterday"
                      score={72}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="glass-card mb-6">
                  <h3 className="text-lg font-semibold mb-4">Analysis Overview</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Upload your resume to see how it performs against ATS systems and get recommendations.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">ATS Compatibility</h4>
                        <p className="text-sm text-muted-foreground">
                          Check if your resume can be properly parsed by ATS systems
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <Search className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Keyword Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          Identify missing keywords for your target positions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <BarChart2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Content Scoring</h4>
                        <p className="text-sm text-muted-foreground">
                          Get section-by-section scoring and recommendations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <h3 className="text-lg font-semibold mb-4">Pro Tips</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm">Use a clean, simple format that ATS systems can easily parse</p>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm">Include keywords from the job description you're applying to</p>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm">Quantify your achievements with numbers and metrics</p>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm">Tailor your resume for each job application</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}

