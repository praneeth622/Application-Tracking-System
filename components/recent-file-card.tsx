"use client"

import { motion } from "framer-motion"
import { FileText, ExternalLink, Star, Clock } from "lucide-react"
import Link from "next/link"

interface RecentFileCardProps {
  filename: string
  date: string
  matchScore?: number
  fileSize: string
  fileType: "pdf" | "docx" | "doc"
  id: string
  status?: "success" | "error" | "processing"
  errorMessage?: string
}

export function RecentFileCard({
  filename,
  date,
  matchScore,
  fileSize,
  fileType,
  id,
  status = "success",
  errorMessage,
}: RecentFileCardProps) {
  const getFileIcon = () => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-5 h-5 text-primary" />
      case "docx":
      case "doc":
        return <FileText className="w-5 h-5 text-primary" />
      default:
        return <FileText className="w-5 h-5 text-primary" />
    }
  }

  return (
    <motion.div
      className={`glass-card hover:shadow-lg transition-all duration-300 border ${
        status === "success"
          ? "border-border"
          : status === "error"
            ? "border-red-500/20 bg-red-500/5"
            : "border-yellow-500/20 bg-yellow-500/5"
      }`}
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
            {getFileIcon()}
          </div>
          <div>
            <h3 className="font-medium">{filename}</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span>{date}</span>
              <span className="mx-2">•</span>
              <span>{fileSize}</span>
              {status !== "success" && (
                <>
                  <span className="mx-2">•</span>
                  <span className={status === "error" ? "text-red-500" : "text-yellow-500"}>
                    {status === "error" ? "Failed" : "Processing"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {matchScore !== undefined && status === "success" && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <span className="ml-2 font-semibold">{matchScore}%</span>
          </div>
        )}
      </div>

      {status === "error" && errorMessage && (
        <div className="mb-3 text-sm text-red-500 bg-red-500/10 p-2 rounded">{errorMessage}</div>
      )}

      {status === "success" ? (
        <Link href={`/profiles/${id}`}>
          <motion.div
            className="flex items-center justify-center w-full py-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Analysis
            <ExternalLink className="w-3 h-3 ml-2" />
          </motion.div>
        </Link>
      ) : status === "processing" ? (
        <motion.div className="flex items-center justify-center w-full py-2 rounded-lg bg-yellow-500/10 text-yellow-500 text-sm font-medium">
          Processing...
        </motion.div>
      ) : (
        <motion.div className="flex items-center justify-center w-full py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium">
          Upload Failed
        </motion.div>
      )}
    </motion.div>
  )
}

