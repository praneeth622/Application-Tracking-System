"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Globe, CheckCircle } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { doc, writeBatch, Timestamp } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    country: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a vendor",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const vendorId = uuidv4()
      const vendorData = {
        ...formData,
        created_at: Timestamp.now(),
        status: "active",
        metadata: {
          created_by: user.email || "",
          last_modified_by: user.email || "",
        },
      }

      const vendorRef = doc(db, "vendors", vendorId)
      const vendorDetailsRef = doc(db, "vendors", vendorId, "details", "info")

      const batch = writeBatch(db)

      batch.set(vendorRef, {
        created_at: Timestamp.now(),
        created_by: user.uid,
      })

      batch.set(vendorDetailsRef, vendorData)

      await batch.commit()

      toast({
        title: "Success",
        description: "Vendor added successfully",
      })

      router.push("/vendor")
    } catch (error) {
      console.error("Error creating vendor:", error)
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive",
      })
      setIsSubmitting(false)
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
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
          <Button variant="ghost" className="mb-6 group" onClick={() => router.push("/vendor")}>
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Vendors
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Add New Vendor</h1>
            <p className="text-muted-foreground">Create a new vendor profile in your system</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
              <CardDescription>Enter the details of the vendor you want to add to your system.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="contact">Contact Details</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                  <TabsContent value="basic" className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                          Vendor Name
                        </Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter vendor company name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_person" className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-muted-foreground" />
                          Contact Person
                        </Label>
                        <Input
                          id="contact_person"
                          required
                          value={formData.contact_person}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                          placeholder="Enter primary contact person name"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="state" className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                            State/Province
                          </Label>
                          <Input
                            id="state"
                            required
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="Enter state or province"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country" className="flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                            Country
                          </Label>
                          <Input
                            id="country"
                            required
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            placeholder="Enter country"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" onClick={() => document.querySelector('[data-value="contact"]')?.click()}>
                        Next: Contact Details
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter business email address"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter business phone number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          Complete Address
                        </Label>
                        <Textarea
                          id="address"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Enter complete business address"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.querySelector('[data-value="basic"]')?.click()}
                      >
                        Back to Basic Info
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Add Vendor
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </form>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6 text-sm text-muted-foreground">
              <p>All fields are required</p>
              <p>Vendor will be set to "Active" by default</p>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

