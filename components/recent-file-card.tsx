"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, MoreHorizontal, Download, Eye, Trash2, Clock } from "lucide-react"

interface RecentFileCardProps {
  fileName: string
  fileSize: string
  uploadDate: string
  score: number
}

export function RecentFileCard({ fileName, fileSize, uploadDate, score }: RecentFileCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      className="glass-card p-4"
      whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <motion.div
            className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <FileText className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h4 className="font-medium text-sm">{fileName}</h4>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{fileSize}</span>
              <span className="mx-2">•</span>
              <Clock className="w-3 h-3 mr-1" />
              <span>{uploadDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <span className="text-xs font-semibold">{score}</span>
              </div>
              <div className="text-xs">
                <div className="font-medium">ATS Score</div>
                <div className={`${score >= 80 ? "text-green-500" : score >= 60 ? "text-amber-500" : "text-red-500"}`}>
                  {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <motion.button
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              onClick={() => setShowActions(!showActions)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </motion.button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg py-1 z-10 w-36"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    className="w-full text-left px-3 py-1.5 hover:bg-muted transition-colors flex items-center text-sm"
                    whileHover={{ x: 2 }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Analysis
                  </motion.button>
                  <motion.button
                    className="w-full text-left px-3 py-1.5 hover:bg-muted transition-colors flex items-center text-sm"
                    whileHover={{ x: 2 }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </motion.button>
                  <motion.button
                    className="w-full text-left px-3 py-1.5 hover:bg-muted transition-colors flex items-center text-sm text-red-500"
                    whileHover={{ x: 2 }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

