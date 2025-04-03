"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ProtectedAdminRoute } from "@/components/protected-admin-route"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { Card } from "@/components/ui/card"
import { Users, FileText, Building, Briefcase } from "lucide-react"
import { UserList } from "@/components/user-list"
import { toast } from '@/components/ui/use-toast'

interface StatsCard {
  title: string
  value: number
  icon: React.ReactNode
  description: string
}

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResumes: 0,
    totalVendors: 0,
    totalJobs: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, "users"))
        const totalUsers = usersSnapshot.size

        // Fetch total resumes count - updated logic
        let totalResumes = 0
        for (const userDoc of usersSnapshot.docs) {
          const userResumesRef = doc(db, "users", userDoc.id, "resumes", "data")
          const resumesDoc = await getDoc(userResumesRef)
          
          if (resumesDoc.exists()) {
            const userData = resumesDoc.data()
            // Add the length of the resumes array if it exists
            totalResumes += userData.resumes?.length || 0
          }
        }

        // Fetch vendors count
        const vendorsSnapshot = await getDocs(collection(db, "vendors"))
        const totalVendors = vendorsSnapshot.size

        // Update stats state
        setStats({
          totalUsers,
          totalResumes,
          totalVendors,
          totalJobs: 0 // Update this if you need jobs count
        })

      } catch (error) {
        console.error("Error fetching stats:", error)
        toast({
          title: "Error",
          description: "Failed to fetch dashboard statistics",
          variant: "destructive"
        })
      }
    }

    fetchStats()
  }, [])

  const statsCards: StatsCard[] = [
    {
      title: "Total Users",
      value: stats.totalUsers,  
      icon: <Users className="w-6 h-6" />,
      description: "Active users in the system",
    },
    {
      title: "Total Resumes",
      value: stats.totalResumes,
      icon: <FileText className="w-6 h-6" />,
      description: "Resumes analyzed",
    },
    {
      title: "Total Vendors",
      value: stats.totalVendors,
      icon: <Building className="w-6 h-6" />,
      description: "Registered vendors",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: <Briefcase className="w-6 h-6" />,
      description: "Active job postings",
    },
  ]

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-background flex overflow-hidden">
        <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <motion.div
          className="flex-1 min-h-screen relative"
          initial={false}
          animate={{
            marginLeft: isMobile ? 0 : isSidebarOpen ? "16rem" : "4.5rem",
            width: isMobile ? "100%" : isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 4.5rem)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="container mx-auto py-8 px-4 md:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Overview of your system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </div>
                  <h3 className="font-medium mb-1">{stat.title}</h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">User Management</h2>
              <UserList />
            </div>
          </div>
        </motion.div>
      </div>
    </ProtectedAdminRoute>
  )
}