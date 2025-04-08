"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Search, Shield, User, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserData {
  uid: string
  email: string
  name?: string
  role: string
  created_at?: string
}

interface UserManagementProps {
  users: UserData[]
  isLoading: boolean
  onUserUpdated: () => void
}

export default function UserManagement({ users, isLoading, onUserUpdated }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [updatingRole, setUpdatingRole] = useState(false)

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.email?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    )
  })

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setEditingUserId(userId)
      setUpdatingRole(true)
      
      // Use API client to update the user role
      await apiClient.auth.updateUserRole({ uid: userId, role: newRole })
      
      toast.success("User role updated successfully")
      onUserUpdated()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    } finally {
      setEditingUserId(null)
      setUpdatingRole(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name / Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Date Added</TableHead>
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
                  <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">No users found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="font-medium">{user.name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    {editingUserId === user.uid && updatingRole ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) => handleRoleChange(user.uid, value)}
                        disabled={updatingRole}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge
                              variant={user.role === "admin" ? "default" : "secondary"}
                              className={user.role === "admin" ? "bg-primary" : ""}
                            >
                              {user.role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                              {user.role || "User"}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="recruiter">Recruiter</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
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