"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { doc, writeBatch, Timestamp } from 'firebase/firestore'
import { db } from '@/FirebaseConfig'
import { v4 as uuidv4 } from 'uuid'

interface VendorFormData {
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  state: string
  country: string
}

export default function CreateVendorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    country: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a vendor",
        variant: "destructive",
      })
      return
    }

    try {
      const vendorId = uuidv4()
      const vendorData = {
        ...formData,
        created_at: Timestamp.now(),
        status: 'active',
        metadata: {
          created_by: user.email || '',
          last_modified_by: user.email || ''
        }
      }

      const vendorRef = doc(db, "vendors", vendorId)
      const vendorDetailsRef = doc(db, "vendors", vendorId, "details", "info")

      const batch = writeBatch(db)

      batch.set(vendorRef, {
        created_at: Timestamp.now(),
        created_by: user.uid
      })

      batch.set(vendorDetailsRef, vendorData)

      await batch.commit()

      toast({
        title: "Success",
        description: "Vendor added successfully",
      })

      router.push('/vendor')
    } catch (error) {
      console.error('Error creating vendor:', error)
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive",
      })
    }
  }

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
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-3xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push('/vendor')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Add New Vendor</h1>
            <p className="text-muted-foreground">Enter vendor details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person</label>
                <Input
                  required
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter complete address"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Enter state"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Enter country"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Add Vendor
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}