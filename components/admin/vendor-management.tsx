"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Search, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"

interface VendorData {
  _id?: string
  name: string
  email?: string
  phone?: string
  contact_person?: string
  address?: string
  state?: string
  country?: string
  status?: string
}

export default function VendorManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [vendors, setVendors] = useState<VendorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<VendorData>({
    name: "",
    email: "",
    phone: "",
    contact_person: "",
    address: "",
    state: "",
    country: "",
    status: "active"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingVendor, setEditingVendor] = useState<VendorData | null>(null)

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.vendors.getAll()
      setVendors(data)
    } catch (error) {
      console.error("Error fetching vendors:", error)
      toast.error("Failed to load vendors")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  // Filter vendors based on search query
  const filteredVendors = vendors.filter((vendor) => {
    const query = searchQuery.toLowerCase()
    return (
      vendor.name?.toLowerCase().includes(query) ||
      vendor.email?.toLowerCase().includes(query) ||
      vendor.contact_person?.toLowerCase().includes(query)
    )
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error("Vendor name is required")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      if (editingVendor && editingVendor._id) {
        // Update existing vendor
        await apiClient.vendors.update(editingVendor._id, formData)
        toast.success("Vendor updated successfully")
      } else {
        // Create new vendor
        await apiClient.vendors.create(formData)
        toast.success("Vendor added successfully")
      }
      
      // Reset form and refetch vendors
      setFormData({
        name: "",
        email: "",
        phone: "",
        contact_person: "",
        address: "",
        state: "",
        country: "",
        status: "active"
      })
      setIsDialogOpen(false)
      setEditingVendor(null)
      fetchVendors()
    } catch (error) {
      console.error("Error saving vendor:", error)
      toast.error("Failed to save vendor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (vendor: VendorData) => {
    setEditingVendor(vendor)
    setFormData({ ...vendor })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await apiClient.vendors.delete(id)
        toast.success("Vendor deleted successfully")
        fetchVendors()
      } catch (error) {
        console.error("Error deleting vendor:", error)
        toast.error("Failed to delete vendor")
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingVendor(null)
              setFormData({
                name: "",
                email: "",
                phone: "",
                contact_person: "",
                address: "",
                state: "",
                country: "",
                status: "active"
              })
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingVendor ? "Edit" : "Add"} Vendor</DialogTitle>
              <DialogDescription>
                {editingVendor ? "Update vendor details" : "Enter vendor details to add to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact_person" className="text-right">
                    Contact Person
                  </Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    value={formData.contact_person || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingVendor ? "Update" : "Add"} Vendor
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Loading vendors...</p>
                </TableCell>
              </TableRow>
            ) : filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No vendors found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => (
                <TableRow key={vendor._id}>
                  <TableCell>
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-xs text-muted-foreground">{vendor.address}</div>
                  </TableCell>
                  <TableCell>
                    <div>{vendor.contact_person}</div>
                    <div className="text-xs text-muted-foreground">{vendor.email}</div>
                    <div className="text-xs text-muted-foreground">{vendor.phone}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={vendor.status === "active" ? "default" : "secondary"}>
                      {vendor.status || "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(vendor)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => vendor._id && handleDelete(vendor._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}