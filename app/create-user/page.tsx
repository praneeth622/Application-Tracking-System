"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { motion } from "framer-motion"

interface UserProfile {
  name: string
  email: string
  role: string
}

export default function UserManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: user?.email || "",
    role: ""
  })

  const roles = [
    { id: "recruiter", label: "Recruiter" },
    { id: "hiring_manager", label: "Hiring Manager" },
    { id: "hr", label: "HR" },
    { id: "admin", label: "Admin" }
  ]

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        router.push("/auth")
        return
      }

      try {
        // const userDoc = await getDoc(doc(db, "users", user.uid))
        // if (userDoc.exists() && userDoc.data().profileComplete) {
        //   router.push("/dashboard")
        // }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!user) throw new Error("No authenticated user")

      await setDoc(doc(db, "users", user.uid), {
        ...profile,
        profileComplete: true,
        updatedAt: new Date().toISOString()
      })

      toast.success("Profile updated successfully")
      router.push("/upload-resume")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <DashboardSidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

      <motion.div
        className="flex-1 min-h-screen"
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : isSidebarOpen ? "16rem" : "4.5rem",
          width: isMobile ? "100%" : isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 4.5rem)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto py-8 px-4 flex items-center justify-center">
          <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Complete Your Profile</h1>
              <p className="text-muted-foreground">
                Please provide additional information to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Select
                  value={profile.role}
                  onValueChange={(value) => setProfile({ ...profile, role: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}