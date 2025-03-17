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
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
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
          // Handle progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
          console.log('Upload is ' + progress + '% done')
        },
        (error) => {
          // Handle error
          console.error('Upload error:', error)
          setUploadStatus("error")
          toast({
            title: "Upload failed",
            description: "There was an error uploading your file",
            variant: "destructive",
          })
        },
        async () => {
          // Handle success
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
            const analysis = await analyzeResume(file)
            setAnalysisResult(analysis)
            console.log('Analysis:', analysis)
            toast({
              title: "Analysis complete",
              description: "Your resume has been analyzed successfully",
              icon: <CheckCircle className="w-4 h-4 text-green-500" />
            })
          } catch (error: any) {
            console.error('Error:', error)
            setAnalysisError(error.message)
            toast({
              title: "Analysis failed",
              description: "There was an error analyzing your resume",
              variant: "destructive",
              icon: <AlertCircle className="w-4 h-4" />
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
      const result = await analyzeResume(file, user?.uid, user.email);
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
                      <pre className="text-sm whitespace-pre-wrap">{analysisResult}</pre>
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

