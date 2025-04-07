"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Upload, FileText, X, FileUp, CloudUpload, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import { s3Client, bucketName } from "@/AWSConfig"
import { PutObjectCommand } from "@aws-sdk/client-s3"

import { useAuth } from "@/context/auth-context"
import { generateUUID } from "@/utils/generate-id"
import { useToast } from "@/hooks/use-toast"
import { analyzeResume } from "@/utils/analyze-resume"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"

import { useTheme } from "next-themes"


import { checkDuplicateResume } from "@/utils/firebase-helpers"

// Add this type definition at the top of the file
type AnalysisResult = {
  // Type definitions unchanged...
  skills: string[];
  name: string;
  phone_number: string;
  email: string;

  social_profile_links: {
    linkedin?: string
    github?: string
  }
  education: Array<{
    institution: string
    degree: string
    major: string
    location: string
    dates: string
  }>
  work_experience: Array<{
    company: string
    title: string
    location: string
    dates: string
    responsibilities: string[]
  }>
  key_skills: {
    languages: string[]
    frameworks_and_libraries: string[]
    databases_and_orm: string[]
    developer_tools: string[]
    cloud_and_services: string[]
    coursework: string[]
  }
  project_experience: Array<{
    name: string
    technologies: string[]
    link: string
    description: string[]
  }>
  profile_summary: string | null
  vendor_id?: string
  vendor_name?: string
  vendor_details?: {
    address?: string
    contact_person?: string
    country?: string
    email?: string
    phone?: string
    state?: string
  }
}

// Add this interface near the top of the file with other type definitions
interface FirebaseError {
  code: string
  message: string
  name: string
}

// Update the Vendor interface
interface Vendor {
  id: string
  name: string
  address?: string
  contact_person?: string
  country?: string
  email?: string
  phone?: string
  state?: string
  status?: string
}

export function DragDropUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { theme } = useTheme()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Add these new states
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string>("no-vendor")
  const [isLoadingVendors, setIsLoadingVendors] = useState(true)

  // Replace the existing fetchVendors function in your useEffect
  useEffect(() => {
    const fetchVendors = async () => {

      setIsLoadingVendors(true)

      try {
        const vendorsList: Vendor[] = []

        // Get all vendor documents
        const vendorsCollection = collection(db, "vendors")
        const vendorsSnapshot = await getDocs(vendorsCollection)

        // For each vendor, try to get details from the details/info subcollection
        for (const vendorDoc of vendorsSnapshot.docs) {
          try {
            const vendorId = vendorDoc.id
            const infoRef = doc(db, "vendors", vendorId, "details", "info")
            const infoSnap = await getDoc(infoRef)

            if (infoSnap.exists()) {
              // If details/info exists, use that data
              const infoData = infoSnap.data()
              vendorsList.push({
                id: vendorId,
                name: infoData.name || "Unknown Vendor",
                address: infoData.address,
                contact_person: infoData.contact_person,
                country: infoData.country,
                email: infoData.email,
                phone: infoData.phone,
                state: infoData.state,
                status: infoData.status,
              })
            } else {
              // Fallback to checking if name exists in the main vendor document
              const vendorData = vendorDoc.data()
              if (vendorData.name) {
                vendorsList.push({
                  id: vendorId,
                  name: vendorData.name,
                })
              }
            }
          } catch (error) {
            console.error(`Error fetching details for vendor ${vendorDoc.id}:`, error)
          }
        }

        // Sort vendors alphabetically by name
        vendorsList.sort((a, b) => a.name.localeCompare(b.name))
        setVendors(vendorsList)
      } catch (error) {
        console.error("Error fetching vendors:", error)
      } finally {
        setIsLoadingVendors(false)
      }
    }

    fetchVendors()
  }, [])

  // Event handlers unchanged
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

  // Updated to use AWS S3 instead of Firebase Storage
  const validateAndUploadFile = async (file: File) => {
    try {
      if (!user) {
        throw new Error("User not authenticated")
      }
      console.log("Validating and uploading file:", file);

      setFile(file)
      setUploadStatus("uploading")

      // Generate file hash for duplicate check

      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      console .log("File hash:", fileHash);

      // Check for duplicates
      const isDuplicate = await checkDuplicateResume(user.uid, fileHash)
      if (isDuplicate) {
        setUploadStatus("error")
        toast({
          title: "Duplicate Resume",
          description: "This resume has already been uploaded to your account",
          variant: "destructive",
        })
        return
      }
      console.log("File is not a duplicate, proceeding with upload...");


      const resumeId = generateUUID();
      const fileExtension = file.name.split('.').pop();
      const s3Key = `resumes/${user.uid}/${resumeId}.${fileExtension}`;

      // Create S3 upload parameters
      const uploadParams = {
        Bucket: bucketName,
        Key: s3Key,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
      };
      console.log("Uploading to S3 with key:", s3Key);
      console.log("uplaod details:", uploadParams);

      // Track upload progress manually
      let uploadStartTime = Date.now();
      let uploadTracker = setInterval(() => {
        // Simulate progress (actual S3 client doesn't provide real-time progress)
        const elapsed = Date.now() - uploadStartTime;
        const estimatedTotalTime = file.size / 50000; // Rough estimate based on file size
        let progress = Math.min(95, (elapsed / estimatedTotalTime) * 100);
        setUploadProgress(progress);
      }, 200);

      try {
        // Upload to S3
        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // Clear progress tracker and set to 100%
        clearInterval(uploadTracker);
        setUploadProgress(100);
        
        // Start analysis
        setIsAnalyzing(true);
        
        // Get vendor details for the selected vendor, but only pass ID and name to analyzeResume
        const selectedVendorObj = selectedVendor === "no-vendor" ? null : 
          vendors.find(v => v.id === selectedVendor);
        
        // Pass only vendor ID and name to analyze resume
        const analysisResult = await analyzeResume(
          file, 
          user.uid, 
          user.email!, 
          selectedVendor === "no-vendor" ? null : selectedVendor,
          selectedVendorObj?.name || null
        );

        // Store the analysis result in state
        setAnalysisResult(analysisResult.analysis);
        setUploadStatus("success");
        
        toast({
          title: "Success",
          description: "Resume analyzed" + (selectedVendorObj ? ` and tagged with ${selectedVendorObj.name}` : ""),
        });
      } catch (error) {
        clearInterval(uploadTracker);
        throw error;
      }
    } catch (error: unknown) {
      console.error('Error in validateAndUploadFile:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setAnalysisError(errorMessage);
      setUploadStatus("error");
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",

      });
    } finally {
      setIsAnalyzing(false);

    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadProgress(0)
    setUploadStatus("idle")
    setAnalysisResult(null)
    setAnalysisError(null)
    setIsAnalyzing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // UI remains unchanged
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
            className={`relative overflow-hidden rounded-xl backdrop-blur-md border-2 border-dashed transition-all ${
              isDragging
                ? "border-violet-500 bg-violet-500/10 scale-[1.02] shadow-lg"
                : theme === "dark"
                  ? "border-gray-700 hover:border-violet-500/50"
                  : "border-gray-300 hover:border-violet-500/50"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Background gradient effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 z-0"></div>

            {/* Animated background circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-violet-500/10 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full filter blur-3xl opacity-30 animate-pulse-slow delay-1000"></div>

            <div className="relative z-10 py-12 px-6 flex flex-col items-center justify-center">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg"
                animate={{
                  y: isDragging ? [-10, -5, -10] : [0, -5, 0],
                  boxShadow: isDragging
                    ? [
                        "0px 0px 0px rgba(139, 92, 246, 0.3)",
                        "0px 20px 30px rgba(139, 92, 246, 0.3)",
                        "0px 0px 0px rgba(139, 92, 246, 0.3)",
                      ]
                    : [
                        "0px 0px 0px rgba(139, 92, 246, 0.2)",
                        "0px 10px 20px rgba(139, 92, 246, 0.2)",
                        "0px 0px 0px rgba(139, 92, 246, 0.2)",
                      ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              >
                <CloudUpload className="w-12 h-12 text-violet-500" />
              </motion.div>

              <motion.h3
                className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-500"
                animate={{ scale: isDragging ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {isDragging ? "Drop to Upload" : "Upload Your Resume"}
              </motion.h3>

              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Drag and drop your resume file here, or click to browse. We'll analyze it against ATS systems and
                provide detailed feedback.
              </p>

              <div className="mb-6 w-full max-w-md bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <label className="text-sm font-medium mb-2 block">Select Vendor (Optional)</label>
                <Select value={selectedVendor} onValueChange={setSelectedVendor} disabled={isLoadingVendors}>
                  <SelectTrigger className="w-full bg-background/70 border-violet-500/20 focus:ring-violet-500/30 focus:border-violet-500">
                    <SelectValue placeholder={isLoadingVendors ? "Loading vendors..." : "Choose a vendor"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="no-vendor">No Vendor</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        <div className="flex flex-col">
                          <span>{vendor.name}</span>
                          {vendor.state && vendor.country && (
                            <span className="text-xs text-muted-foreground">
                              {vendor.state}, {vendor.country}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <motion.div className="relative" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileInputChange}
                    accept=".pdf,.docx,.doc"
                    ref={fileInputRef}
                  />
                  <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <FileUp className="w-5 h-5" />
                    Browse Files
                  </button>
                </motion.div>

                <p className="text-xs text-muted-foreground">Supported formats: PDF, DOCX, DOC</p>
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
            className="relative overflow-hidden rounded-xl backdrop-blur-md border border-violet-500/20 shadow-lg"
          >
            {/* Background gradient effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 z-0"></div>

            {/* Upload Progress Section */}
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center shadow-md">
                    {uploadStatus === "uploading" && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <div className="h-full w-full rounded-lg border-t-2 border-r-2 border-violet-500" />
                      </motion.div>
                    )}
                    {uploadStatus === "success" && <CheckCircle className="w-6 h-6 text-violet-500" />}
                    {uploadStatus === "error" && <AlertCircle className="w-6 h-6 text-destructive" />}
                    {uploadStatus === "uploading" && <FileText className="w-6 h-6 text-violet-500" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {uploadStatus === "uploading" && "Uploading Resume"}
                      {uploadStatus === "success" && "Upload Complete"}
                      {uploadStatus === "error" && "Upload Failed"}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="truncate max-w-[200px]">{file?.name}</span>
                      <span className="mx-2">•</span>
                      <span>{Math.round((file?.size || 0) / 1024)} KB</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={resetUpload}
                  className="p-2 rounded-full hover:bg-muted/80 transition-colors"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Progress Bar */}
              {uploadStatus === "uploading" && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Uploading...</span>
                    <span className="font-medium">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm p-0.5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              )}

              {/* Analysis Status */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-xl bg-background/50 backdrop-blur-sm border border-violet-500/20"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mr-4">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Analyzing Your Resume</h4>
                      <p className="text-sm text-muted-foreground">Our AI is processing your document</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-3 py-4">
                    <motion.div
                      className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-500">
                      AI Analysis in Progress...
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500/40 to-blue-500/40"
                        animate={{
                          width: ["0%", "100%"],
                          x: ["-100%", "0%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Extracting information</span>
                      <span>Analyzing content</span>
                      <span>Generating feedback</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Analysis Results */}
              {analysisResult && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-xl bg-background/50 backdrop-blur-sm border border-violet-500/20"
                >

                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mr-4">
                      <CheckCircle className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Analysis Complete</h4>
                      <p className="text-sm text-muted-foreground">Your resume has been analyzed successfully</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-muted/30 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium">Resume Details</h5>
                      <motion.button
                        className="text-xs text-violet-500 flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Full Analysis
                      </motion.button>
                    </div>

                    {/* Show minimal analysis results */}
                    <div className="space-y-2 text-sm">
                      {analysisResult.name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{analysisResult.name}</span>
                        </div>
                      )}
                      {analysisResult.skills && analysisResult.skills.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Skills:</span>
                          <span className="font-medium">
                            {analysisResult.skills.slice(0, 3).join(", ")}
                            {analysisResult.skills.length > 3 ? "..." : ""}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {analysisError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-xl bg-destructive/5 backdrop-blur-sm border border-destructive/20"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mr-4">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-destructive">Analysis Error</h4>
                      <p className="text-sm text-muted-foreground">There was a problem analyzing your resume</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-destructive/5">
                    <p className="text-sm">{analysisError}</p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <motion.button
                      onClick={resetUpload}
                      className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Try Again
                    </motion.button>
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


