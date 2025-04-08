"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Loader2, Users, Server, FileText, Building, Briefcase, Shield, RefreshCw } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import UserManagement from "@/components/admin/user-management"
import VendorManagement from "@/components/admin/vendor-management"
import apiClient from "@/lib/api-client"
import { MakeUserAdmin } from "@/components/admin-make-user-admin"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"

interface StatsCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

export default function AdminPage() {
  const { userProfile, isAdmin, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<StatsCard[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const initialCheckRef = useRef(false);

  // Check admin status once on load - with useRef to prevent multiple calls
  useEffect(() => {
    if (!initialCheckRef.current && userProfile === null) {
      initialCheckRef.current = true;
      const checkAdminStatus = async () => {
        try {
          await refreshUserProfile();
        } catch (error) {
          console.error("Error refreshing profile:", error);
        }
      };
      
      checkAdminStatus();
    }
  }, [refreshUserProfile, userProfile]);

  // Display a non-admin page when the user isn't an admin
  if (userProfile && userProfile.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="inline-block p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <Shield className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-8">
            You need administrator privileges to access this page.
          </p>
          
          <div className="max-w-sm mx-auto mb-8">
            <MakeUserAdmin />
          </div>
          
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Fetch stats for dashboard - useCallback to prevent unnecessary recreations
  const fetchStats = useCallback(async () => {
    if (!userProfile || userProfile.role !== 'admin' || isLoadingStats) return;
    
    // Set loading state
    setIsLoadingStats(true);
    setApiStatus('loading');
    
    try {
      // Use separate variables for data to avoid state issues
      let usersData = [];
      let resumeCount = 0;
      let vendorCount = 0;
      let jobCount = 0;
      
      // Fetch users
      try {
        usersData = await apiClient.auth.getAllUsers() || [];
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      
      // Fetch resumes - handle gracefully if not admin
      try {
        const resumesData = await apiClient.resumes.getAllResumes();
        resumeCount = Array.isArray(resumesData) ? resumesData.length : 0;
      } catch (error) {
        console.error("Error fetching resumes:", error);
        // If access denied, show 0 but don't break the dashboard
      }
      
      // Fetch vendors
      try {
        const vendorsData = await apiClient.vendors.getAll();
        vendorCount = Array.isArray(vendorsData) ? vendorsData.length : 0;
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
      
      // Fetch jobs
      try {
        const jobsData = await apiClient.jobs.getAll();
        jobCount = Array.isArray(jobsData) ? jobsData.length : 0;
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
      
      // Update API status and stats
      setApiStatus('online');
      
      const newStats = [
        {
          title: "Total Users",
          value: usersData.length,
          description: "Active user accounts",
          icon: <Users className="h-5 w-5 text-blue-500" />,
        },
        {
          title: "API Status",
          value: "Online",
          description: "System operational",
          icon: <Server className="h-5 w-5 text-green-500" />,
        },
        {
          title: "Total Resumes",
          value: resumeCount,
          description: "Resumes analyzed",
          icon: <FileText className="h-5 w-5 text-purple-500" />,
        },
        {
          title: "Total Vendors",
          value: vendorCount,
          description: "Registered vendors",
          icon: <Building className="h-5 w-5 text-orange-500" />,
        },
        {
          title: "Total Jobs",
          value: jobCount,
          description: "Active job postings",
          icon: <Briefcase className="h-5 w-5 text-indigo-500" />,
        },
      ];
      
      setStats(newStats);
      setDataLoaded(true);
      
    } catch (error) {
      console.error("Error fetching stats:", error);
      setApiStatus('offline');
      
      setStats([
        {
          title: "API Status",
          value: "Offline",
          description: "Connection error",
          icon: <Server className="h-5 w-5 text-red-500" />,
        },
      ]);
      
      toast({
        title: "Failed to load dashboard data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [userProfile, toast, isLoadingStats]);

  // Fetch users when on the users tab
  const fetchUsers = useCallback(async () => {
    if (!userProfile || userProfile.role !== 'admin' || isLoadingUsers) return;
    
    setIsLoadingUsers(true);
    try {
      const response = await apiClient.auth.getAllUsers();
      setUsers(response || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Failed to load users",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [userProfile, toast, isLoadingUsers]);

  // Load initial data when the component mounts or tab changes
  useEffect(() => {
    if (userProfile?.role === 'admin') {
      if (activeTab === 'dashboard' && !dataLoaded && !isLoadingStats) {
        fetchStats();
      } else if (activeTab === 'users' && users.length === 0 && !isLoadingUsers) {
        fetchUsers();
      }
    }
  }, [activeTab, userProfile, dataLoaded, users.length, fetchStats, fetchUsers, isLoadingUsers, isLoadingStats]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text={`Logged in as: ${userProfile?.email || 'Admin'}`}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={async () => {
            try {
              await refreshUserProfile();
              toast({
                title: "Profile refreshed",
                description: "User profile has been updated",
              });
            } catch (error) {
              toast({
                title: "Refresh failed",
                description: "Could not refresh profile",
                variant: "destructive",
              });
            }
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> 
          Refresh
        </Button>
      </DashboardHeader>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="tools">Admin Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">System Overview</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchStats()} 
              disabled={isLoadingStats}
            >
              {isLoadingStats ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {isLoadingStats ? ' Loading...' : ' Refresh'}
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingStats ? (
              // Display skeletons while loading
              Array(5).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-4 w-28" />
                  </CardContent>
                </Card>
              ))
            ) : (
              stats.map((stat, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>System events from the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="space-y-4">
                  {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">System Status</p>
                      <p className="text-sm text-muted-foreground">
                        API {apiStatus === 'online' ? 'online' : 'connection issue'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{new Date().toLocaleTimeString()}</p>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Dashboard Accessed</p>
                      <p className="text-sm text-muted-foreground">Admin user logged in</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{new Date().toLocaleTimeString()}</p>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users and roles</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchUsers()} 
                disabled={isLoadingUsers}
              >
                {isLoadingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {isLoadingUsers ? ' Loading...' : ' Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              <UserManagement 
                users={users}
                isLoading={isLoadingUsers}
                onUserUpdated={fetchUsers}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
              <CardDescription>Manage vendor information</CardDescription>
            </CardHeader>
            <CardContent>
              <VendorManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <MakeUserAdmin />
            
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Environment details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Environment:</span>
                    <span className="font-medium">{process.env.NODE_ENV}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API URL:</span>
                    <span className="font-medium">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Status:</span>
                    <span className={`font-medium ${apiStatus === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                      {apiStatus === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}