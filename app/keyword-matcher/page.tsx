"use client"

import { useState, useEffect } from 'react'
import { db } from "@/FirebaseConfig"
import { doc, getDoc, Timestamp } from "firebase/firestore"
import { useAuth } from "@/context/auth-context"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Badge } from "@/components/ui/badge"
import { FilterSection } from "@/components/filter-section"
import { Button } from "@/components/ui/button"
import { ResumeCard } from "@/components/resume-card"

// First, let's update the Resume interface to match the JSON structure
interface Resume {
  filename: string;
  filelink: string;
  uploadedAt: Timestamp;
  analysis: {
    name: string;
    education_details: Array<{
      institute: string;
      degree: string;
      major: string;
      location: string;
      dates: string;
    }>;
    work_experience_details: Array<{
      company: string;
      title: string;
      location: string;
      dates: string;
      responsibilities: string[];
    }>;
    key_skills: string[];
    profile_summary: string;
    experience_years?: number;
  };
}

export default function KeywordMatcherPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [keywords, setKeywords] = useState<Set<string>>(new Set())
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const [educationFilters, setEducationFilters] = useState<Set<string>>(new Set())
  const [selectedEducation, setSelectedEducation] = useState<string[]>([])
  const [locations, setLocations] = useState<Set<string>>(new Set())
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [experienceRanges] = useState([
    '0-2 years', '2-5 years', '5-8 years', '8+ years'
  ])
  const [selectedExperience, setSelectedExperience] = useState<string[]>([])

  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid, "resumes", "data");
        const userDoc = await getDoc(userDocRef);
        
        const allKeywords = new Set<string>();
        const newEducationFilters = new Set<string>();
        const newLocations = new Set<string>();
        const fetchedResumes: Resume[] = [];

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.resumes && Array.isArray(userData.resumes)) {
            fetchedResumes.push(...userData.resumes);
            
            userData.resumes.forEach((resume: Resume) => {
              // Process key skills
              if (resume?.analysis?.key_skills && Array.isArray(resume.analysis.key_skills)) {
                resume.analysis.key_skills.forEach(skill => {
                  if (typeof skill === 'string' && skill.trim()) {
                    allKeywords.add(skill.toLowerCase().trim());
                  }
                });
              }
            
              // Process education
              if (resume?.analysis?.education_details) {
                resume.analysis.education_details.forEach(edu => {
                  // Add degree information
                  if (edu.degree) {
                    newEducationFilters.add(edu.degree.toLowerCase().trim());
                  }
                  // Add major information
                  if (edu.major) {
                    newEducationFilters.add(edu.major.toLowerCase().trim());
                  }
                });
              }
            
              // Process location from education details
              if (resume?.analysis?.education_details) {
                resume.analysis.education_details.forEach(edu => {
                  if (edu.location) {
                    newLocations.add(edu.location.toLowerCase().trim());
                  }
                });
              }
            
              // Process experience years
              if (resume?.analysis?.work_experience_details) {
                let totalExperience = 0;
                resume.analysis.work_experience_details.forEach(exp => {
                  if (exp.dates) {
                    const [startDate, endDate] = exp.dates.split('–').map(d => d.trim());
                    const end = endDate === 'Present' ? new Date() : new Date(endDate);
                    const start = new Date(startDate);
                    const years = (end.getFullYear() - start.getFullYear());
                    totalExperience += years;
                  }
                });
                resume.analysis.experience_years = totalExperience;
              }
            });
          }
        }

        // Update state with found data
        setKeywords(allKeywords);
        setResumes(fetchedResumes);
        setEducationFilters(newEducationFilters);
        setLocations(newLocations);
        
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    };

    fetchResumes();
  }, [user]); // Only user as dependency since we're not using educationFilters or locations in the effect

  // Update the filter function to match keywords more accurately
  const filteredResumes = resumes.filter(resume => {
    if (selectedKeywords.length === 0 && 
        selectedEducation.length === 0 && 
        selectedLocations.length === 0 && 
        selectedExperience.length === 0) return true;
  
    // Match skills
    const matchesSkills = selectedKeywords.length === 0 || selectedKeywords.every(keyword =>
      resume.analysis.key_skills.some(skill => 
        skill.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  
    // Match education (check both degree and major)
    const matchesEducation = selectedEducation.length === 0 || selectedEducation.some(edu =>
      resume.analysis.education_details.some(eduDetail => 
        eduDetail.degree.toLowerCase().includes(edu.toLowerCase()) ||
        eduDetail.major.toLowerCase().includes(edu.toLowerCase())
      )
    );
  
    // Match location from education details
    const matchesLocation = selectedLocations.length === 0 || 
      resume.analysis.education_details.some(edu =>
        selectedLocations.includes(edu.location.toLowerCase())
      );
  
    // Match experience range
    const matchesExperience = selectedExperience.length === 0 || 
      selectedExperience.some(range => {
        const years = resume.analysis.experience_years;
        switch(range) {
          case '0-2 years': return (years ?? 0) >= 0 && (years ?? 0) <= 2;
          case '2-5 years': return (years ?? 0) > 2 && (years ?? 0) <= 5;
          case '5-8 years': return (years ?? 0) > 5 && (years ?? 0) <= 8;
          case '8+ years': return (years ?? 0) > 8;
          default: return false;
        }
      });
  
    return matchesSkills && matchesEducation && matchesLocation && matchesExperience;
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
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">Keyword Matcher</h1>
                <p className="text-muted-foreground mt-1">
                  Find resumes matching specific skills and requirements
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {filteredResumes.length} matches found
                </Badge>
              </div>
            </div>

            {selectedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedKeywords.map(keyword => (
                  <Badge 
                    key={keyword}
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer hover:bg-destructive/20"
                    onClick={() => toggleKeyword(keyword)}
                  >
                    {keyword} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-8">
            {/* Filter Sidebar */}
            <div className="w-80 flex-shrink-0 hidden md:block">
              <div className="sticky top-8 bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search keywords..."
                    className="pl-9 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Sections with better styling */}
                <div className="space-y-6">
                  <FilterSection 
                    title="Keywords" 
                    items={filteredKeywords}
                    selected={selectedKeywords}
                    onToggle={toggleKeyword}
                  />
                  
                  <FilterSection 
                    title="Education" 
                    items={Array.from(educationFilters)}
                    selected={selectedEducation}
                    onToggle={(edu) => setSelectedEducation(prev => 
                      prev.includes(edu) ? prev.filter(e => e !== edu) : [...prev, edu]
                    )}
                  />
                  
                  <FilterSection 
                    title="Location" 
                    items={Array.from(locations)}
                    selected={selectedLocations}
                    onToggle={(loc) => setSelectedLocations(prev => 
                      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
                    )}
                  />
                  
                  <FilterSection 
                    title="Experience" 
                    items={experienceRanges}
                    selected={selectedExperience}
                    onToggle={(exp) => setSelectedExperience(prev => 
                      prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Resumes Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Matching Resumes ({filteredResumes.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Sort by
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {filteredResumes.map((resume, index) => (
                  <ResumeCard
                    key={index}
                    // fileName={resume.filename}
                    candidateName={resume.analysis.name}
                    uploadDate={new Date(resume.uploadedAt.seconds * 1000).toLocaleString()}
                    fileUrl={resume.filelink}
                    education={resume.analysis.education_details[0]?.degree}
                    experience={resume.analysis.experience_years}
                  />
                ))}

                {filteredResumes.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No matches found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters to find more resumes
                    </p>
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