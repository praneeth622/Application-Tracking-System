"use client"

import { useState, useEffect } from 'react'
import { db } from "@/FirebaseConfig"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { useAuth } from "@/context/auth-context"
import { RecentFileCard } from "@/components/recent-file-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Tag, X } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

// First, let's update the Resume interface to match the JSON structure
interface Resume {
  filename: string;
  filelink: string;
  uploadedAt: any;
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
    experience_years?: number; // Add this to the interface
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
                    educationFilters.add(edu.degree.toLowerCase().trim());
                  }
                  // Add major information
                  if (edu.major) {
                    educationFilters.add(edu.major.toLowerCase().trim());
                  }
                });
              }
            
              // Process location from education details instead of work experience
              if (resume?.analysis?.education_details) {
                resume.analysis.education_details.forEach(edu => {
                  if (edu.location) {
                    locations.add(edu.location.toLowerCase().trim());
                  }
                });
              }
            
              // Process experience years (calculated from work experience dates)
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
                resume.analysis.experience_years = totalExperience; // Add this to the resume object
              }
            });
          }
        }

        // Update state with found data
        setKeywords(allKeywords);
        setResumes(fetchedResumes);
        setEducationFilters(educationFilters);
        setLocations(locations);
        
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    };

    fetchResumes();
  }, [user]);

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
                <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {filteredKeywords.map(keyword => (
                    <div key={keyword} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${keyword}`}
                        checked={selectedKeywords.includes(keyword)}
                        onCheckedChange={() => toggleKeyword(keyword)}
                      />
                      <label
                        htmlFor={`skill-${keyword}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {keyword}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Education</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {Array.from(educationFilters).map(edu => (
                      <div key={edu} className="flex items-center space-x-2">
                        <Checkbox
                          id={`education-${edu}`}
                          checked={selectedEducation.includes(edu)}
                          onCheckedChange={() => setSelectedEducation(prev => 
                            prev.includes(edu) ? prev.filter(e => e !== edu) : [...prev, edu]
                          )}
                        />
                        <label
                          htmlFor={`education-${edu}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {edu}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Location</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {Array.from(locations).map(location => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location}`}
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={() => setSelectedLocations(prev => 
                            prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
                          )}
                        />
                        <label
                          htmlFor={`location-${location}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Experience</h3>
                  <div className="space-y-2">
                    {experienceRanges.map(range => (
                      <div key={range} className="flex items-center space-x-2">
                        <Checkbox
                          id={`experience-${range}`}
                          checked={selectedExperience.includes(range)}
                          onCheckedChange={() => setSelectedExperience(prev => 
                            prev.includes(range) ? prev.filter(e => e !== range) : [...prev, range]
                          )}
                        />
                        <label
                          htmlFor={`experience-${range}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {range}
                        </label>
                      </div>
                    ))}
                  </div>
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
                    No resumes match the selected filters
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
