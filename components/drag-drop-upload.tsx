"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, CheckCircle, AlertCircle, X, FileUp } from "lucide-react"
import { storage } from "@/FirebaseConfig"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { useAuth } from "@/context/auth-context"
import { generateUUID } from "@/utils/generate-id"
import { useToast } from "@/hooks/use-toast"
import { analyzeResume } from "@/utils/analyze-resume"

// Add this type definition at the top of the file
type AnalysisResult = {
  name: string;
  phone_number: string;
  email: string;
  social_profile_links: {
    linkedin?: string;
    github?: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    major: string;
    location: string;
    dates: string;
  }>;
  work_experience: Array<{
    company: string;
    title: string;
    location: string;
    dates: string;
    responsibilities: string[];
  }>;
  key_skills: {
    languages: string[];
    frameworks_and_libraries: string[];
    databases_and_orm: string[];
    developer_tools: string[];
    cloud_and_services: string[];
    coursework: string[];
  };
  project_experience: Array<{
    name: string;
    technologies: string[];
    link: string;
    description: string[];
  }>;
  profile_summary: string | null;
};

export function DragDropUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndUploadFile(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndUploadFile(files[0])
    }
  }

  const validateAndUploadFile = async (file: File) => {
    // Check if file is PDF or DOCX
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!validTypes.includes(file.type)) {
      setUploadStatus("error")
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      setUploadStatus("error")
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      })
      return
    }

    setFile(file)
    setUploadStatus("uploading")

    try {
      const resumeId = generateUUID()
      const fileExtension = file.name.split('.').pop()
      const storageRef = ref(storage, `resumes/${user.uid}/${resumeId}.${fileExtension}`)
      
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          setUploadStatus("error")
          toast({
            title: "Upload failed",
            description: "There was an error uploading your file",
            variant: "destructive",
          })
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            setFileUrl(downloadURL)
            setUploadStatus("success")
            toast({
              title: "Upload complete",
              description: "Analyzing your resume...",
            })

            // Start resume analysis
            setIsAnalyzing(true)
            const result = await analyzeResume(file, user?.uid || '', user?.email || '')
            
            // Show success message
            toast({
              title: "Analysis complete",
              description: "Your resume has been analyzed successfully"
            })

            // Reset the component state after successful analysis
            resetUpload()
          } catch (error: any) {
            console.error('Error:', error)
            setAnalysisError(error.message)
            toast({
              title: "Analysis failed",
              description: "There was an error analyzing your resume",
              variant: "destructive"
            })
          } finally {
            setIsAnalyzing(false)
          }
        }
      )
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus("error")
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      })
    }
  }

  const handleFileAnalysis = async (file: File) => {
    try {
      const result = await analyzeResume(file, user?.uid || '', user?.email || '');
      // Handle the response
      console.log('Analysis saved:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetUpload = () => {
    setFile(null)
    setUploadProgress(0)
    setUploadStatus("idle")
    setFileUrl(null)
    setAnalysisResult(null)
    setAnalysisError(null)
    setIsAnalyzing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {uploadStatus === "idle" ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`glass-card border-2 border-dashed transition-all ${
              isDragging ? "border-primary bg-primary/5 scale-[1.02] shadow-lg" : "border-border"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="py-8 flex flex-col items-center justify-center">
              <motion.div
                className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
                animate={{
                  y: isDragging ? -10 : 0,
                  scale: isDragging ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Upload className="w-8 h-8 text-primary" />
              </motion.div>

              <h3 className="text-lg font-semibold mb-2">
                {isDragging ? "Drop your resume here" : "Drag & drop your resume here"}
              </h3>

              <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
                Upload your resume in PDF or DOCX format. We'll analyze it against ATS systems and provide detailed
                feedback.
              </p>

              <div className="flex items-center justify-center">
                <div className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileInputChange}
                    accept=".pdf,.docx"
                    ref={fileInputRef}
                  />
                  <motion.button className="btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <FileUp className="w-4 h-4 mr-2" />
                    Browse Files
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload-status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="glass-card"
          >
            {analysisResult && (
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">{analysisResult.name}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <p>Phone: {analysisResult.phone_number}</p>
                    <p>Email: {analysisResult.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.key_skills.languages.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Work Experience</h3>
                  {analysisResult.work_experience.map((exp, index) => (
                    <div key={index} className="mt-2">
                      <h4 className="font-medium">{exp.company} - {exp.title}</h4>
                      <p className="text-sm text-muted-foreground">{exp.dates}</p>
                      <ul className="list-disc list-inside mt-1">
                        {exp.responsibilities.map((resp, idx) => (
                          <li key={idx} className="text-sm">{resp}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Education</h3>
                  {analysisResult.education.map((edu, index) => (
                    <div key={index} className="mt-2">
                      <h4 className="font-medium">{edu.institution}</h4>
                      <p className="text-sm">{edu.degree} in {edu.major}</p>
                      <p className="text-sm text-muted-foreground">{edu.dates}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Analyzing resume...</span>
              </div>
            )}

            {analysisError && (
              <div className="p-6 text-destructive">
                <p>Error analyzing resume: {analysisError}</p>
              </div>
            )}
            <div className="py-6 px-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      uploadStatus === "error" ? "bg-red-100" : "bg-primary/10"
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {uploadStatus === "uploading" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <FileText className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                    {uploadStatus === "success" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                    {uploadStatus === "error" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </motion.div>
                    )}
                  </motion.div>
                  <div>
                    <h3 className="font-medium">
                      {uploadStatus === "uploading" && "Uploading resume..."}
                      {uploadStatus === "success" && "Upload complete!"}
                      {uploadStatus === "error" && "Upload failed"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {uploadStatus === "uploading" &&
                        `${file?.name} (${
                          (file?.size || 0) / 1024 / 1024 < 1
                            ? `${Math.round((file?.size || 0) / 1024)} KB`
                            : `${((file?.size || 0) / 1024 / 1024).toFixed(1)} MB`
                        })`}
                      {uploadStatus === "success" && "Your resume has been uploaded successfully"}
                      {uploadStatus === "error" && "Please upload a PDF or DOCX file"}
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={resetUpload}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {uploadStatus === "uploading" && (
                <div className="w-full bg-muted rounded-full h-2 mb-1 overflow-hidden">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}

              {uploadStatus === "success" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="flex justify-end mt-4">
                    <motion.a
                      href={fileUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View File
                    </motion.a>
                  </div>
                </motion.div>
              )}

              {uploadStatus === "error" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="flex justify-end mt-4">
                    <motion.button
                      className="btn-primary"
                      onClick={resetUpload}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Try Again
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {uploadStatus === "success" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }}
                  className="mt-6 space-y-4"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Analyzing resume...</span>
                    </div>
                  ) : analysisResult ? (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Analysis Results</h4>
                      <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(analysisResult, null, 2)}</pre>
                    </div>
                  ) : analysisError ? (
                    <div className="bg-destructive/10 text-destructive rounded-lg p-4">
                      <h4 className="font-medium mb-2">Analysis Error</h4>
                      <p className="text-sm">{analysisError}</p>
                    </div>
                  ) : null}

                  <div className="flex justify-end space-x-2">
                    <motion.button
                      onClick={resetUpload}
                      className="btn-secondary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Upload Another
                    </motion.button>
                    {fileUrl && (
                      <motion.a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View File
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

