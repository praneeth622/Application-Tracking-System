"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Upload, FileText, X, FileUp, CloudUpload, CheckCircle, AlertCircle, Sparkles, Clock, Trash2 } from "lucide-react"

import { s3Client, bucketName } from "@/AWSConfig"
import { PutObjectCommand } from "@aws-sdk/client-s3"

import { useAuth } from "@/context/auth-context"
import { generateUUID } from "@/utils/generate-id"
import { useToast } from "@/hooks/use-toast"
import { analyzeResume } from "@/utils/analyze-resume"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"

import { checkDuplicateResume } from "@/utils/firebase-helpers"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Resume queue item type
interface ResumeQueueItem {
  id: string
  file: File
  status: "queued" | "uploading" | "analyzing" | "success" | "error"
  progress: number
  errorMessage?: string
  result?: AnalysisResult
  vendorId?: string | null
  vendorName?: string | null
  uploadedAt: Date
  fileHash?: string
}

// Add this type definition at the top of the file
type AnalysisResult = {
  skills: string[]
  name: string
  phone_number: string
  email: string

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
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { theme } = useTheme()

  // Resume queue state
  const [resumeQueue, setResumeQueue] = useState<ResumeQueueItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [totalToProcess, setTotalToProcess] = useState(0)

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

  // Process the next resume in the queue
  useEffect(() => {
    const processNextResume = async () => {
      // Find the next queued resume
      const nextResumeIndex = resumeQueue.findIndex((item) => item.status === "queued")

      if (nextResumeIndex === -1 || !isProcessing) {
        // No more resumes to process or processing paused
        if (isProcessing && resumeQueue.every((item) => ["success", "error"].includes(item.status))) {
          setIsProcessing(false)
          setUploadStatus("idle")
          toast({
            title: "Processing complete",
            description: `Processed ${resumeQueue.filter((item) => item.status === "success").length} of ${resumeQueue.length} resumes successfully`,
          })
        }
        return
      }

      // Get the next resume
      const nextResume = resumeQueue[nextResumeIndex]

      try {
        // Update status to uploading
        setResumeQueue((prev) =>
          prev.map((item, idx) => (idx === nextResumeIndex ? { ...item, status: "uploading" } : item)),
        )

        // Generate file hash for duplicate check
        const fileBuffer = await nextResume.file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

        // Update the file hash
        setResumeQueue((prev) => prev.map((item, idx) => (idx === nextResumeIndex ? { ...item, fileHash } : item)))

        // Check for duplicates in the current queue (frontend)
        const isDuplicateInQueue =
          resumeQueue.filter((item, idx) => idx !== nextResumeIndex && item.fileHash === fileHash).length > 0

        if (isDuplicateInQueue) {
          setResumeQueue((prev) =>
            prev.map((item, idx) =>
              idx === nextResumeIndex
                ? {
                    ...item,
                    status: "error",
                    errorMessage: "Duplicate resume in current upload batch",
                  }
                : item,
            ),
          )

          // Process next resume
          setProcessedCount((prev) => prev + 1)
          return
        }

        // Check for duplicates in the database
        if (user) {
          const isDuplicate = await checkDuplicateResume(user.uid, fileHash)
          if (isDuplicate) {
            setResumeQueue((prev) =>
              prev.map((item, idx) =>
                idx === nextResumeIndex
                  ? {
                      ...item,
                      status: "error",
                      errorMessage: "This resume has already been uploaded to your account",
                    }
                  : item,
              ),
            )

            // Process next resume
            setProcessedCount((prev) => prev + 1)
            return
          }
        }

        // Validate if the file is actually a resume
        const isValidResume = await validateResumeContent(nextResume.file)
        if (!isValidResume.valid) {
          setResumeQueue((prev) =>
            prev.map((item, idx) =>
              idx === nextResumeIndex
                ? {
                    ...item,
                    status: "error",
                    errorMessage: isValidResume.message || "This file does not appear to be a valid resume",
                  }
                : item,
            ),
          )

          // Process next resume
          setProcessedCount((prev) => prev + 1)
          return
        }

        // Prepare for S3 upload
        const resumeId = generateUUID()
        const fileExtension = nextResume.file.name.split(".").pop()
        const s3Key = `resumes/${user?.uid || "anonymous"}/${resumeId}.${fileExtension}`

        // Create S3 upload parameters
        const uploadParams = {
          Bucket: bucketName,
          Key: s3Key,
          Body: new Uint8Array(fileBuffer),
          ContentType: nextResume.file.type,
        }

        // Track upload progress
        let uploadProgress = 0
        const progressInterval = setInterval(() => {
          uploadProgress = Math.min(95, uploadProgress + 5)
          setResumeQueue((prev) =>
            prev.map((item, idx) => (idx === nextResumeIndex ? { ...item, progress: uploadProgress } : item)),
          )
        }, 200)

        try {
          // Upload to S3
          await s3Client.send(new PutObjectCommand(uploadParams))
          clearInterval(progressInterval)

          // Update progress to 100%
          setResumeQueue((prev) =>
            prev.map((item, idx) => (idx === nextResumeIndex ? { ...item, progress: 100, status: "analyzing" } : item)),
          )

          // Get vendor details
          const selectedVendorObj =
            nextResume.vendorId === "no-vendor" ? null : vendors.find((v) => v.id === nextResume.vendorId)

          // Analyze the resume
          const analysisResult = await analyzeResume(
            nextResume.file,
            user?.uid || "anonymous",
            user?.email || "anonymous@example.com",
            nextResume.vendorId === "no-vendor" ? null : nextResume.vendorId,
            selectedVendorObj?.name || null,
          )

          // Check if the analysis result indicates this is not a resume
          if (
            !analysisResult.analysis ||
            !analysisResult.analysis.name ||
            !analysisResult.analysis.key_skills ||
            analysisResult.analysis.key_skills.length === 0
          ) {
            setResumeQueue((prev) =>
              prev.map((item, idx) =>
                idx === nextResumeIndex
                  ? {
                      ...item,
                      status: "error",
                      errorMessage:
                        "This file does not appear to be a valid resume. No relevant information was extracted.",
                    }
                  : item,
              ),
            )

            // Process next resume
            setProcessedCount((prev) => prev + 1)
            return
          }

          // Update with success
          setResumeQueue((prev) =>
            prev.map((item, idx) =>
              idx === nextResumeIndex
                ? {
                    ...item,
                    status: "success",
                    result: analysisResult.analysis,
                  }
                : item,
            ),
          )

          // Notify user of successful analysis
          toast({
            title: "Resume Analyzed",
            description: `${nextResume.file.name} has been successfully analyzed and added to your profile.`,
            variant: "default",
          })
        } catch (error) {
          clearInterval(progressInterval)
          console.error("Error in upload/analysis:", error)

          // Update with error
          setResumeQueue((prev) =>
            prev.map((item, idx) =>
              idx === nextResumeIndex
                ? {
                    ...item,
                    status: "error",
                    errorMessage: error instanceof Error ? error.message : "Unknown error",
                  }
                : item,
            ),
          )
        }
      } catch (error) {
        console.error("Error processing resume:", error)

        // Update with error
        setResumeQueue((prev) =>
          prev.map((item, idx) =>
            idx === nextResumeIndex
              ? {
                  ...item,
                  status: "error",
                  errorMessage: error instanceof Error ? error.message : "Unknown error",
                }
              : item,
          ),
        )
      } finally {
        // Increment processed count and continue to next resume
        setProcessedCount((prev) => prev + 1)
      }
    }

    if (isProcessing && resumeQueue.some((item) => item.status === "queued")) {
      processNextResume()
    }
  }, [resumeQueue, isProcessing, processedCount, user, vendors, toast])

  // Function to validate if a file is actually a resume
  const validateResumeContent = async (file: File): Promise<{ valid: boolean; message?: string }> => {
    try {
      // Check file extension first
      const extension = file.name.split(".").pop()?.toLowerCase()
      if (!["pdf", "docx", "doc"].includes(extension || "")) {
        return { valid: false, message: "Only PDF, DOCX, and DOC files are supported" }
      }

      // For PDF files, we can check the header
      if (extension === "pdf") {
        const buffer = await file.arrayBuffer()
        const bytes = new Uint8Array(buffer.slice(0, 5))
        const header = Array.from(bytes)
          .map((byte) => byte.toString(16))
          .join("")

        // PDF files start with %PDF- (hex: 25504446)
        if (!header.startsWith("255044")) {
          return { valid: false, message: "Invalid PDF file format" }
        }
      }

      // For DOCX files, check for the ZIP signature
      if (extension === "docx") {
        const buffer = await file.arrayBuffer()
        const bytes = new Uint8Array(buffer.slice(0, 4))
        const header = Array.from(bytes)
          .map((byte) => byte.toString(16))
          .join("")

        // DOCX files are ZIP files and start with PK (hex: 504B)
        if (!header.startsWith("504b")) {
          return { valid: false, message: "Invalid DOCX file format" }
        }
      }

      // For DOC files, check for the DOC signature
      if (extension === "doc") {
        const buffer = await file.arrayBuffer()
        const bytes = new Uint8Array(buffer.slice(0, 8))
        const header = Array.from(bytes)
          .map((byte) => byte.toString(16))
          .join("")

        // DOC files start with D0CF11E0 (hex: D0CF11E0)
        if (!header.includes("d0cf11e0")) {
          return { valid: false, message: "Invalid DOC file format" }
        }
      }

      // Check file size (resumes are typically under 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return { valid: false, message: "File is too large. Resumes should be under 10MB" }
      }

      // Check if file is empty
      if (file.size === 0) {
        return { valid: false, message: "File is empty" }
      }

      return { valid: true }
    } catch (error) {
      console.error("Error validating resume:", error)
      return { valid: false, message: "Error validating file" }
    }
  }

  // Event handlers for drag and drop
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
      addFilesToQueue(Array.from(files))
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      addFilesToQueue(Array.from(files))
    }
  }

  // Add files to the queue
  const addFilesToQueue = (files: File[]) => {
    // Filter for only PDF, DOCX, DOC files
    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase()
      return ["pdf", "docx", "doc"].includes(extension || "")
    })

    if (validFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload only PDF, DOCX, or DOC files",
        variant: "destructive",
      })
      return
    }

    // Create queue items
    const newQueueItems: ResumeQueueItem[] = validFiles.map((file) => ({
      id: generateUUID(),
      file,
      status: "queued",
      progress: 0,
      uploadedAt: new Date(),
      vendorId: selectedVendor,
      vendorName: selectedVendor === "no-vendor" ? null : vendors.find((v) => v.id === selectedVendor)?.name || null,
    }))

    // Add to queue
    setResumeQueue((prev) => [...prev, ...newQueueItems])

    // Start processing if not already
    if (!isProcessing) {
      setIsProcessing(true)
      setUploadStatus("processing")
      setTotalToProcess((prev) => prev + newQueueItems.length)
    } else {
      setTotalToProcess((prev) => prev + newQueueItems.length)
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Remove item from queue
  const removeFromQueue = (id: string) => {
    setResumeQueue((prev) => prev.filter((item) => item.id !== id))
  }

  // Reset the entire queue
  const resetQueue = () => {
    setResumeQueue([])
    setIsProcessing(false)
    setProcessedCount(0)
    setTotalToProcess(0)
    setUploadStatus("idle")
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  // Format date
  const formatDate = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // If less than a minute ago
    if (diff < 60 * 1000) {
      return "Just now"
    }

    // If less than an hour ago
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
    }

    // If today
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // If yesterday
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // Otherwise show full date
    return date.toLocaleDateString() + ", " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
                {isDragging ? "Drop to Upload" : "Upload Multiple Resumes"}
              </motion.h3>

              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Drag and drop multiple resume files here, or click to browse. We'll analyze them against ATS systems and
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
                    multiple
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
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <div className="h-full w-full rounded-lg border-t-2 border-r-2 border-violet-500" />
                    </motion.div>
                    <FileText className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Processing Resumes</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>
                        {processedCount} of {totalToProcess} complete
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => {
                      fileInputRef.current?.click()
                    }}
                    className="p-2 rounded-full hover:bg-muted/80 transition-colors"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Upload className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={resetQueue}
                    className="p-2 rounded-full hover:bg-muted/80 transition-colors"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-medium">
                    {totalToProcess > 0 ? Math.round((processedCount / totalToProcess) * 100) : 0}%
                  </span>
                </div>
                <Progress value={totalToProcess > 0 ? (processedCount / totalToProcess) * 100 : 0} className="h-3" />
              </div>

              {/* Resume Queue */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <h4 className="font-semibold text-md mb-2">Upload Queue</h4>

                {resumeQueue.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No resumes in queue. Add files to begin processing.
                  </div>
                ) : (
                  resumeQueue.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${
                        item.status === "success"
                          ? "bg-green-500/10 border-green-500/20"
                          : item.status === "error"
                            ? "bg-red-500/10 border-red-500/20"
                            : "bg-background/50 border-violet-500/20"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.file.name}</h3>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{formatDate(item.uploadedAt)}</span>
                              <span className="mx-2">•</span>
                              <span>{formatFileSize(item.file.size)}</span>
                              {item.vendorName && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Vendor: {item.vendorName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status indicator */}
                        <div className="flex items-center">
                          {item.status === "queued" && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">Queued</span>
                          )}
                          {item.status === "uploading" && (
                            <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full">
                              Uploading
                            </span>
                          )}
                          {item.status === "analyzing" && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                              Analyzing
                            </span>
                          )}
                          {item.status === "success" && (
                            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                              Complete
                            </span>
                          )}
                          {item.status === "error" && (
                            <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">Failed</span>
                          )}

                          {(item.status === "queued" || item.status === "error") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2 h-6 w-6"
                              onClick={() => removeFromQueue(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Progress bar for uploading/analyzing */}
                      {(item.status === "uploading" || item.status === "analyzing") && (
                        <div className="mt-2">
                          <Progress value={item.progress} className="h-2" />
                          <div className="flex justify-between text-xs mt-1">
                            <span>{item.status === "uploading" ? "Uploading..." : "Analyzing..."}</span>
                            <span>{Math.round(item.progress)}%</span>
                          </div>
                        </div>
                      )}

                      {/* Error message */}
                      {item.status === "error" && item.errorMessage && (
                        <div className="mt-2 text-sm text-red-500 bg-red-500/10 p-2 rounded">{item.errorMessage}</div>
                      )}

                      {/* Success info */}
                      {item.status === "success" && item.result && (
                        <div className="mt-2 bg-green-500/10 p-2 rounded">
                          <div className="text-sm font-medium">Analysis Complete</div>
                          <div className="text-xs mt-1">
                            {item.result.name && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{item.result.name}</span>
                              </div>
                            )}
                            {item.result.skills && item.result.skills.length > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Skills:</span>
                                <span className="font-medium">
                                  {item.result.skills.slice(0, 3).join(", ")}
                                  {item.result.skills.length > 3 ? "..." : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add more files button */}
              <div className="mt-6 flex justify-center">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept=".pdf,.docx,.doc"
                  ref={fileInputRef}
                  multiple
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-violet-500 to-blue-500 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add More Files
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

