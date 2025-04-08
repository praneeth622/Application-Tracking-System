"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20">
            <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this area. 
          This section is restricted to administrators only.
        </p>

        <div className="flex flex-col gap-4">
          <Button
            onClick={() => router.push("/")}
            variant="default"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  )
}