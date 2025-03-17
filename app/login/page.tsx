"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Mail, Shield, AlertCircle, CheckCircle, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/FirebaseConfig"
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/upload-resume')
    }
  }, [user, router])

  // Check if the user is coming back from email link
  useEffect(() => {
    // Get the email from localStorage
    const savedEmail = window.localStorage.getItem('emailForSignIn')
    
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Additional state check
      if (!savedEmail) {
        toast({
          title: "Error",
          description: "Could not find your email. Please try signing in again.",
          variant: "destructive",
          icon: <AlertCircle className="w-4 h-4" />
        })
        return
      }

      setIsLoading(true)
      // Sign in with email link
      signInWithEmailLink(auth, savedEmail, window.location.href)
        .then((result) => {
          // Clear email from storage
          window.localStorage.removeItem('emailForSignIn')
          // Redirect to dashboard
          router.push('/upload-resume')
          toast({
            title: "Success",
            description: "You have been successfully signed in!",
            icon: <CheckCircle className="w-4 h-4 text-green-500" />
          })
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to sign in. Please try again.",
            variant: "destructive",
            icon: <AlertCircle className="w-4 h-4" />
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [router, toast])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login`, // Redirect back to login page to handle the sign-in
        handleCodeInApp: true
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      
      // Save the email for later use
      window.localStorage.setItem('emailForSignIn', email)
      
      setSubmitted(true)
      toast({
        title: "Check your email",
        description: "We've sent you a magic link to sign in.",
        icon: <CheckCircle className="w-4 h-4 text-green-500" />
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
        icon: <AlertCircle className="w-4 h-4" />
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If loading, show loading state
  if (isLoading && isSignInWithEmailLink(auth, window.location.href)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Signing you in...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed inset-0 -z-10 dot-pattern opacity-50"></div>
      <div className="fixed top-0 right-0 w-[800px] h-[800px] -z-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] -z-10 rounded-full bg-gradient-to-tr from-accent/10 to-primary/5 blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">ResumeAI</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
          >
            {!submitted ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                  <p className="text-muted-foreground">
                    Sign in with magic link - no password required
                  </p>
                </div>

                <form onSubmit={handleSignIn}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors pl-10"
                          placeholder="john@example.com"
                          required
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full btn-primary relative"
                    >
                      {isLoading ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center"
                        >
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        </motion.div>
                      ) : (
                        <span className="flex items-center justify-center">
                          Sign In with Email
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a magic link to:<br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary hover:underline"
                >
                  Use a different email
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Shield className="w-4 h-4 mr-2" />
                Secure, passwordless sign in
              </div>
            </div>
          </motion.div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
