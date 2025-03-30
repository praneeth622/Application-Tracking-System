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
  skills: any
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

// Add this interface near the top of the file with other type definitions
interface FirebaseError {
  code: string;
  message: string;
  name: string;
}

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
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setFile(file);
      setUploadStatus("uploading");

      // Generate file hash for duplicate check
      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Check for duplicates
      const isDuplicate = await checkDuplicateResume(user.uid, fileHash);
      if (isDuplicate) {
        setUploadStatus("error");
        toast({
          title: "Duplicate Resume",
          description: "This resume has already been uploaded to your account",
          variant: "destructive",
        });
        return;
      }

      const resumeId = generateUUID();
      const fileExtension = file.name.split('.').pop();
      const storageRef = ref(storage, `resumes/${user.uid}/${resumeId}.${fileExtension}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadStatus("error");
          toast({
            title: "Upload failed",
            description: "There was an error uploading your file",
            variant: "destructive",
          });
        },
        async () => {
          try {
            setIsAnalyzing(true);
            toast({
              title: "Upload successful",
              description: "Now analyzing your resume...",
            });
            
            const analysisResult = await analyzeResume(file, user.uid, user.email!);
            
            setAnalysisResult(analysisResult.analysis);
            setUploadStatus("success");
            
            toast({
              title: "Analysis Complete",
              description: "Your resume has been analyzed successfully",
              variant: "default",
            });
          } catch (error: unknown) {
            const firebaseError = error as FirebaseError;
            console.error('Analysis error:', firebaseError);
            setAnalysisError(firebaseError.message);
            toast({
              title: "Analysis failed",
              description: "There was an error analyzing your resume",
              variant: "destructive",
            });
          } finally {
            setIsAnalyzing(false);
          }
        }
      );
    } catch (error) {
      console.error('Error in validateAndUploadFile:', error);
      setUploadStatus("error");
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    }
  }


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
                Upload your resume in PDF or DOCX format. We&apos;ll analyze it against ATS systems and provide detailed
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
            {/* Upload Progress Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {uploadStatus === "uploading" && (
                      <motion.div
                        className="absolute inset-0"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="h-full w-full rounded-full border-t-2 border-primary" />
                      </motion.div>
                    )}
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {uploadStatus === "uploading" && "Uploading resume..."}
                      {uploadStatus === "success" && "Upload complete!"}
                      {uploadStatus === "error" && "Upload failed"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {file?.name} ({Math.round((file?.size || 0) / 1024)} KB)
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={resetUpload}
                  className="p-2 rounded-full hover:bg-muted"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Progress Bar */}
              {uploadStatus === "uploading" && (
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              )}

              {/* Analysis Status */}
              {isAnalyzing && (
                <div className="mt-6">
                  <div className="flex items-center justify-center space-x-3">
                    <motion.div
                      className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-sm text-muted-foreground">
                      Analyzing resume with AI...
                    </span>
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {analysisResult && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-muted/50 rounded-lg"
                >
                  <h4 className="font-medium mb-2">Analysis Complete</h4>
                  <div className="space-y-2">
                    {/* <p className="text-sm">
                      Name: {analysisResult.name}
                    </p> */}
                    {/* <p className="text-sm">
                      Skills: {analysisResult.skills?.join(", ")}
                    </p> */}
                    {/* Add more analysis results as needed */}
                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {analysisError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg"
                >
                  <h4 className="font-medium mb-2">Analysis Error</h4>
                  <p className="text-sm">{analysisError}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mock implementation of checkDuplicateResume
async function checkDuplicateResume(uid: string, fileHash: string): Promise<boolean> {
  // Replace this with actual logic to check for duplicates in your database or storage
  console.log(`Checking for duplicate resume for user: ${uid}, hash: ${fileHash}`);
  return false; // Assume no duplicate for now
}

