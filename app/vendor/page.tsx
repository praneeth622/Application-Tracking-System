"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Building, MapPin, Phone, Mail, Search } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/FirebaseConfig'
import { toast } from '@/components/ui/use-toast'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface Vendor {
  vendor_id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  state: string
  country: string
  created_at: Date
  status: 'active' | 'inactive'
  metadata: {
    created_by: string
    last_modified_by: string
  }
}

export default function VendorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { user } = useAuth()
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchVendors = async () => {
      if (!user) return

      try {
        const vendorsCollection = collection(db, "vendors")
        const vendorsSnapshot = await getDocs(vendorsCollection)
        const fetchedVendors: Vendor[] = []

        for (const vendorDoc of vendorsSnapshot.docs) {
          const vendorDataRef = doc(db, "vendors", vendorDoc.id, "details", "info")
          const vendorDataSnap = await getDoc(vendorDataRef)
          
          if (vendorDataSnap.exists()) {
            const data = vendorDataSnap.data()
            fetchedVendors.push({
              vendor_id: vendorDoc.id,
              name: data.name,
              contact_person: data.contact_person,
              email: data.email,
              phone: data.phone,
              address: data.address,
              state: data.state,
              country: data.country,
              created_at: data.created_at.toDate(),
              status: data.status,
              metadata: data.metadata || {
                created_by: '',
                last_modified_by: ''
              }
            })
          }
        }

        setVendors(fetchedVendors)
      } catch (error) {
        console.error("Error fetching vendors:", error)
        toast({
          title: "Error",
          description: "Failed to load vendors",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVendors()
  }, [user])

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [isMobile])

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsSheetOpen(true)
  }

  const VendorDetailsSheet = () => {
    if (!selectedVendor) return null

    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">{selectedVendor.name}</SheetTitle>
            <SheetDescription className="flex items-center text-base">
              <Building className="w-4 h-4 mr-2" />
              {selectedVendor.contact_person}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium mb-1">Email</p>
                <p className="text-muted-foreground">{selectedVendor.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Phone</p>
                <p className="text-muted-foreground">{selectedVendor.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">State</p>
                <p className="text-muted-foreground">{selectedVendor.state}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Country</p>
                <p className="text-muted-foreground">{selectedVendor.country}</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground border-t pt-4">
              <p>Created by: {selectedVendor.metadata.created_by}</p>
              <p>Created: {selectedVendor.created_at.toLocaleString()}</p>
              <p>Status: <span className={`px-2 py-1 rounded-full text-xs ${
                selectedVendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>{selectedVendor.status}</span></p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
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
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Vendor Management</h1>
                <p className="text-muted-foreground">Manage your vendor relationships</p>
              </div>
              <Button
                onClick={() => router.push('/create-vendor')}
                className="flex items-center w-full md:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Vendor
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search vendors by name, contact person, email, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No matching vendors found" : "No Vendors Found"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Start by adding your first vendor"}
                </p>
              </div>
            ) : (
              filteredVendors.map((vendor) => (
                <div
                  key={vendor.vendor_id}
                  className="p-6 rounded-lg border hover:border-primary cursor-pointer transition-all"
                  onClick={() => handleVendorClick(vendor)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{vendor.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="w-4 h-4 mr-2" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2" />
                          {vendor.phone}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {vendor.state}, {vendor.country}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm text-muted-foreground">
                        Added {vendor.created_at.toLocaleDateString()}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {selectedVendor && <VendorDetailsSheet />}
      </motion.div>
    </div>
  )
}
