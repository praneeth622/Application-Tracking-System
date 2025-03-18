"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Star, Target, Trophy, TrendingUp, AlertCircle } from 'lucide-react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/FirebaseConfig'
import { useAuth } from '@/context/auth-context'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

interface Profile {
  aiAnalysis?: string;
  analysis?: any;
  filename?: string;
}

interface AnalysisSection {
  title: string;
  icon: React.ReactNode;
  content: string[];
}



export function ProfileAnalysis({ profile }: { profile: Profile }) {
  const { user } = useAuth()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

const generateAnalysis = async () => {
    try {
        setIsAnalyzing(true)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro", // Using the correct model name
            generationConfig: {
                temperature: 0.7,
                topP: 1,
                topK: 1,
                maxOutputTokens: 2048,
            },
        });

        const prompt = `As an IT recruitment specialist, analyze this candidate's profile and provide a detailed assessment in the following format:

        1. Key Strengths
        • List key professional strengths
        • Focus on standout qualities

        2. Experience & Suitability
        • Evaluate years of experience
        • Assess industry relevance
        • Comment on career progression

        3. Technical Skills
        • Evaluate technical expertise
        • Highlight specialized skills
        • Note technology proficiency levels

        4. Potential Roles
        • Suggest suitable positions
        • List ideal work environments

        5. Areas for Improvement
        • Identify skill gaps
        • Suggest development areas

        6. Achievements
        • List notable accomplishments
        • Highlight impactful projects

        Analyze the following profile data and provide insights in clear bullet points:
        ${JSON.stringify(profile.analysis)}`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        
        const response = await result.response;
        const text = response.text();

        // Update the profile with analysis
        if (!user) {
            throw new Error("User not authenticated");
        }
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const updatedResumes = userData.resumes.map((resume: any) => 
                resume.filename === profile.filename 
                    ? { ...resume, aiAnalysis: text }
                    : resume
            );
            
            await updateDoc(userDocRef, { resumes: updatedResumes });
        }

        toast({
            title: "Analysis Complete",
            description: "Profile analysis has been generated and saved.",
        });

        return { ...profile, aiAnalysis: text };
    } catch (error) {
        console.error('Error generating analysis:', error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to generate analysis. Please try again.",
        });
        return profile;
    } finally {
        setIsAnalyzing(false);
    }
}

  const parseAnalysis = (analysis: string): AnalysisSection[] => {
    try {
      // Split the analysis into sections based on numbered points
      const sections = analysis.split(/\d+\.\s+/).filter(Boolean);
      
      return [
        { 
          title: "Key Strengths", 
          icon: <Star className="w-5 h-5 text-yellow-500" />,
          content: extractPoints(sections[0])
        },
        { 
          title: "Experience & Suitability", 
          icon: <Trophy className="w-5 h-5 text-blue-500" />,
          content: extractPoints(sections[1])
        },
        { 
          title: "Technical Skills", 
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          content: extractPoints(sections[2])
        },
        { 
          title: "Potential Roles", 
          icon: <Target className="w-5 h-5 text-purple-500" />,
          content: extractPoints(sections[3])
        },
        { 
          title: "Areas for Improvement", 
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
          content: extractPoints(sections[4])
        },
        { 
          title: "Achievements", 
          icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
          content: extractPoints(sections[5])
        }
      ];
    } catch (error) {
      console.error('Error parsing analysis:', error);
      return [];
    }
  };

  const extractPoints = (text: string): string[] => {
    return text
      .split(/[•\-\n]/)
      .map(point => point.trim())
      .filter(point => point.length > 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Analysis</h2>
        {!profile.aiAnalysis && (
          <Button 
            onClick={generateAnalysis}
            disabled={isAnalyzing}
            className="relative"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Analyzing...
              </>
            ) : (
              <>Generate Analysis</>
            )}
          </Button>
        )}
      </div>
      
      {profile.aiAnalysis ? (
        <div className="grid gap-6">
          {parseAnalysis(profile.aiAnalysis).map((section, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                {section.icon}
                <h3 className="text-lg font-medium">{section.title}</h3>
              </div>
              <Separator className="mb-3" />
              <div className="space-y-2">
                {section.content.map((point, pointIndex) => (
                  <div key={pointIndex} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <p className="text-sm text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed">
          <div className="text-center px-4">
            <p className="text-muted-foreground mb-2">No analysis generated yet</p>
            <p className="text-xs text-muted-foreground">Click the button above to analyze this profile</p>
          </div>
        </div>
      )}
    </div>
  )
}