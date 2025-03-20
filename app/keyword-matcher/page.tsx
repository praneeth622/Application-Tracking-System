"use client"

import { useState, useEffect } from 'react'
import { db } from "@/FirebaseConfig"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { useAuth } from "@/context/auth-context"
import { RecentFileCard } from "@/components/recent-file-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Tag } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Resume {
  filename: string
  filelink: string
  uploadedAt: any
  analysis: {
    key_skills: Record<string, string[]> // Dynamic skill categories
  }
}

export default function KeywordMatcherPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [keywords, setKeywords] = useState<Set<string>>(new Set())
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid, "resumes", "data");
        const userDoc = await getDoc(userDocRef);
        
        const allKeywords = new Set<string>();
        const fetchedResumes: Resume[] = [];

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.resumes && Array.isArray(userData.resumes)) {
            fetchedResumes.push(...userData.resumes);
            
            // Process each resume to extract skills
            userData.resumes.forEach((resume: Resume) => {
              if (resume?.analysis?.key_skills && Array.isArray(resume.analysis.key_skills)) {
                // Extract skills directly from the array
                resume.analysis.key_skills.forEach(skill => {
                  if (typeof skill === 'string' && skill.trim()) {
                    // Add normalized skill to keywords set
                    allKeywords.add(skill.toLowerCase().trim());
                  }
                });
              }
            });
          }
        }

        // Update state with found data
        setKeywords(allKeywords);
        setResumes(fetchedResumes);
        
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    };

    fetchResumes();
  }, [user]);

  // Update the filter function to match keywords more accurately
  const filteredResumes = resumes.filter(resume => {
    if (selectedKeywords.length === 0) return true;

    if (!resume?.analysis?.key_skills || !Array.isArray(resume.analysis.key_skills)) return false;

    const resumeSkills = new Set(
      resume.analysis.key_skills
        .filter(skill => typeof skill === 'string')
        .map(skill => skill.toLowerCase().trim())
    );

    // Check if all selected keywords are present in the resume's skills
    return selectedKeywords.every(keyword => 
      Array.from(resumeSkills).some(skill => 
        skill.includes(keyword.toLowerCase())
      )
    );
  });

  // Add debugging log for filtered resumes
  useEffect(() => {
    console.log('Filtered resumes count:', filteredResumes.length);
  }, [filteredResumes.length]);

  // Toggle keyword selection
  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    )
  }

  // Filter keywords based on search
  const filteredKeywords = Array.from(keywords).filter(keyword =>
    keyword.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Add Dashboard Sidebar */}
      <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content area */}
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
          <div className="flex gap-8">
            {/* Keyword Filter Sidebar */}
            <div className="w-64 flex-shrink-0 hidden md:block">
              <div className="sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Filter by Keywords</h2>
                
                {/* Search keywords */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search keywords..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Keywords list */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredKeywords.map(keyword => (
                    <Badge
                      key={keyword}
                      variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                      className="mr-2 mb-2 cursor-pointer"
                      onClick={() => toggleKeyword(keyword)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumes Grid */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">
                Matching Resumes ({filteredResumes.length})
              </h2>
              
              <div className="space-y-4">
                {filteredResumes.map((resume, index) => (
                  <RecentFileCard
                    key={index}
                    fileName={resume.filename}
                    fileSize="N/A"
                    uploadDate={new Date(resume.uploadedAt.seconds * 1000).toLocaleString()}
                    score={75}
                    fileUrl={resume.filelink}
                  />
                ))}

                {filteredResumes.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No resumes match the selected keywords
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
