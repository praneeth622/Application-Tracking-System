"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/FirebaseConfig"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface User {
  uid: string
  email: string
  role: 'admin' | 'user'
  name: string
  createdAt: Date
  updatedAt: Date
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const users: User[] = []
      const querySnapshot = await getDocs(collection(db, "users"))
      
      for (const docSnapshot of querySnapshot.docs) {
        const userProfileRef = doc(db, "users", docSnapshot.id, "userProfile", "data")
        const userProfileDoc = await getDoc(userProfileRef)
        
        if (userProfileDoc.exists()) {
          const userData = userProfileDoc.data()
          users.push({
            ...userData,
            uid: docSnapshot.id, // Override the uid after spreading userData
          } as User)
        }
      }
      
      setUsers(users)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const userRef = doc(db, "users", userId, "userProfile", "data")
      await updateDoc(userRef, {
        role: newRole
      })
      
      setUsers(users.map(user => 
        user.uid === userId ? { ...user, role: newRole } : user
      ))
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading users...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value: 'admin' | 'user') => 
                    updateUserRole(user.uid, value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}