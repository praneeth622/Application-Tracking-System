"use client"

import { useAuth } from "@/context/auth-context"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminAccessPage() {
  const { isAdmin } = useAuth()

  

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-6 rounded-lg border shadow-sm">
        <Link href="/" className="inline-flex items-center text-sm mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col items-center text-center">
          <div className="bg-amber-100 p-3 rounded-full mb-4">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Admin Access</h2>
          {isAdmin ? (
            <p className="text-green-600 font-medium mb-6">
              Your account already has admin privileges.
            </p>
          ) : (
            <p className="text-muted-foreground mb-6">
              You need admin privileges to access the admin dashboard. Please contact your system administrator to request admin access.
            </p>
          )}

          {isAdmin && (
            <Link 
              href="/admin" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm mb-4"
            >
              Go to Admin Dashboard
            </Link>
          )}

          <div className="w-full border-t my-6"></div>

          <p className="text-sm text-muted-foreground">
            Admin access is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  )
} 