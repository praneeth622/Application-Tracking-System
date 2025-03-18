"use client"

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface Profile {
  companyFeedback?: string[]
}

export function CompanyFeedback({ profile }: { profile: Profile }) {
  const [newFeedback, setNewFeedback] = useState("")

const addFeedback = async () => {
    if (!profile || !newFeedback.trim()) return;

    try {
        // Update the local profile object
        const updatedProfile = {
            ...profile,
            companyFeedback: [
                ...(profile.companyFeedback || []),
                newFeedback.trim()
            ]
        };

        // Get user doc reference
        const userDocRef = doc(db, "users", user.uid);

        // Update profiles array in Firestore
        await updateDoc(userDocRef, { 
            resumes: arrayUnion(updatedProfile)
        });

        // Clear the feedback input
        setNewFeedback("");

        toast({
            title: "Success",
            description: "Feedback added successfully",
        });
    } catch (error) {
        console.error("Error adding feedback:", error);
        toast({
            title: "Error",
            description: "Failed to add feedback",
            variant: "destructive",
        });
    }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Feedback</h2>
        <div className="text-xs text-muted-foreground">
          {profile.companyFeedback?.length || 0} comments
        </div>
      </div>

      <div className="space-y-4">
        {profile.companyFeedback?.map((feedback, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg bg-muted/50 relative group"
          >
            <p className="text-sm">{feedback}</p>
            <div className="absolute top-2 right-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <Textarea
            placeholder="Add your feedback..."
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            className="mb-2 resize-none"
            rows={3}
          />
          <Button 
            onClick={addFeedback}
            className="w-full"
            disabled={!newFeedback.trim()}
          >
            Add Feedback
          </Button>
        </div>
      </div>
    </div>
  )
}

function doc(db: any, arg1: string, uid: any) {
    throw new Error('Function not implemented.')
}
function updateDoc(userDocRef: void, arg1: { resumes: any }) {
    throw new Error('Function not implemented.')
}

