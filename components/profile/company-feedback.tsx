"use client"

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { db } from '@/FirebaseConfig'
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { useAuth } from '@/context/auth-context'

interface FeedbackItem {
  company_name: string;
  feedback: string;
  timestamp: Timestamp;
}

interface ResumeWithFeedback {
  filename: string;
  filelink: string;
  feedback: FeedbackItem[];
}

interface CompanyFeedbackProps {
  filename: string;
  filelink: string;
}

export function CompanyFeedback({ filename, filelink }: CompanyFeedbackProps) {
  const [companyName, setCompanyName] = useState("")
  const [newFeedback, setNewFeedback] = useState("")
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user) return;

      try {
        const feedbackDocRef = doc(db, "users", user.uid, "resumes", "feedback");
        const docSnap = await getDoc(feedbackDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const resumeFeedback = data.resumes?.find((r: ResumeWithFeedback) => r.filename === filename);
          if (resumeFeedback) {
            setFeedbacks(resumeFeedback.feedback || []);
          }
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchFeedbacks();
  }, [user, filename]);

  const addFeedback = async () => {
    if (!user || !companyName.trim() || !newFeedback.trim()) return;

    try {
      const feedbackDocRef = doc(db, "users", user.uid, "resumes", "feedback");
      const docSnap = await getDoc(feedbackDocRef);

      const newFeedbackItem: FeedbackItem = {
        company_name: companyName.trim(),
        feedback: newFeedback.trim(),
        timestamp: Timestamp.now()
      };

      if (docSnap.exists()) {
        const data = docSnap.data();
        const existingResumeIndex = data.resumes?.findIndex(
          (r: ResumeWithFeedback) => r.filename === filename
        );

        let updatedResumes = [...(data.resumes || [])];

        if (existingResumeIndex !== -1) {
          // Update existing resume feedback
          updatedResumes[existingResumeIndex].feedback.push(newFeedbackItem);
        } else {
          // Add new resume with feedback
          updatedResumes.push({
            filename,
            filelink,
            feedback: [newFeedbackItem]
          });
        }

        await updateDoc(feedbackDocRef, { resumes: updatedResumes });
      } else {
        // Create new document
        await setDoc(feedbackDocRef, {
          resumes: [{
            filename,
            filelink,
            feedback: [newFeedbackItem]
          }]
        });
      }

      // Update local state
      setFeedbacks([...feedbacks, newFeedbackItem]);
      
      // Clear inputs
      setCompanyName("");
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

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) {
      return '';
    }
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Company Feedback</h2>
        <div className="text-xs text-muted-foreground">
          {feedbacks.length} feedbacks
        </div>
      </div>

      {/* Feedback List */}
      <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
        {feedbacks.map((feedback, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg bg-muted/50 relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{feedback.company_name}</h3>
              <span className="text-xs text-muted-foreground">
                {formatDate(feedback.timestamp)}
              </span>
            </div>
            <p className="text-sm">{feedback.feedback}</p>
          </div>
        ))}
      </div>

      {/* Add Feedback Form */}
      <div className="pt-4 border-t space-y-4">
        <Input
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="mb-2"
        />
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
          disabled={!companyName.trim() || !newFeedback.trim()}
        >
          Add Feedback
        </Button>
      </div>
    </div>
  );
}


