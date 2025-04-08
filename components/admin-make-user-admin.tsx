"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import { ReloadIcon } from "@radix-ui/react-icons"

export function MakeUserAdmin() {
  const [email, setEmail] = useState("")
  const [uid, setUid] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !uid) {
      toast({
        title: "Missing information",
        description: "Both email and user ID are required.",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await apiClient.auth.makeAdmin({ 
        email, 
        uid 
      })
      
      toast({
        title: "Success!",
        description: `${email} has been granted admin privileges.`
      })
      
      // Clear the form
      setEmail("")
      setUid("")
    } catch (error: any) {
      console.error("Error making user admin:", error)
      toast({
        title: "Failed to grant admin privileges",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 shadow-sm bg-card">
      <h3 className="text-lg font-medium mb-4">Grant Admin Privileges</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">User Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="uid">User ID</Label>
          <Input
            id="uid"
            placeholder="Firebase UID"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            required
          />
          <p className="text-sm text-muted-foreground">
            The Firebase user ID is required to properly link the user account
          </p>
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Make Admin"
          )}
        </Button>
      </form>
    </div>
  )
}