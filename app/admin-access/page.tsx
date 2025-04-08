"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminAccessPage() {
  const { user, userProfile, isAdmin, refreshUserProfile } = useAuth()
  const [isPromoting, setIsPromoting] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  const makeAdmin = async () => {
    if (!user) {
      toast.error("No user logged in")
      return
    }

    setIsPromoting(true)

    try {
      // Create direct user object
      const userData = {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'User',
      };
      
      // First try to create/update the user through the create-from-auth endpoint
      try {
        const createResult = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/create-from-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        if (!createResult.ok) {
          console.warn("User creation may have failed, continuing anyway");
        }
      } catch (createError) {
        console.warn("Error during user creation, but continuing:", createError);
      }

      // Then try to make the user admin
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/make-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          uid: user.uid,
          email: user.email
        })
      })

      let responseData;
      try {
        responseData = await result.json();
      } catch (e) {
        responseData = { error: 'Failed to parse response' };
      }

      if (result.ok) {
        toast.success("Admin role granted!")
        
        // Wait a moment before refreshing the page
        setTimeout(() => {
          toast.success("Reloading page to apply changes...");
          window.location.reload();
        }, 1500);
      } else {
        console.error("Failed to grant admin role:", responseData);
        toast.error(`Failed to grant admin role: ${responseData.error || result.statusText}`)
      }
    } catch (error) {
      console.error("Error making user admin:", error)
      toast.error("Error promoting user to admin role")
    } finally {
      setIsPromoting(false)
    }
  }

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