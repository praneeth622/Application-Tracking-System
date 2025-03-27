import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function analyzeMatch(jobData: any, resumeData: any) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `As an IT recruitment specialist, analyze the match between this job and candidate. Provide a JSON response (without any markdown formatting or code blocks) containing:
    {
      "matchPercentage": number between 0-100,
      "matchingSkills": array of matching skills,
      "missingRequirements": array of missing requirements,
      "experienceMatch": boolean,
      "educationMatch": boolean,
      "overallAssessment": string
    }

    Job Details:
    Title: ${jobData.title}
    Description: ${jobData.description}
    Required Skills: ${jobData.skills_required.join(', ')}
    Experience Required: ${jobData.experience_required}
    Requirements: ${jobData.requirements.join(', ')}
    
    Candidate Resume:
    Skills: ${resumeData.analysis.key_skills.join(', ')}
    Experience: ${resumeData.analysis.work_experience_details?.map((exp: any) => exp.title).join(', ')}
    Education: ${resumeData.analysis.education_details?.map((edu: { degree: string; major: string; }) => 
      `${edu.degree} in ${edu.major}`).join(', ')}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanResponse = response.text()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error("Error in match analysis:", error);
    return null;
  }
}

interface ResumeAnalysis {
  filename: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingRequirements: string[];
  experienceMatch: boolean;
  educationMatch: boolean;
  overallAssessment: string;
  ranking: number;
}

export async function analyzeBatchMatches(jobData: any, resumesData: any[]): Promise<ResumeAnalysis[]> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `As an IT recruitment specialist, analyze and rank these candidates for the job position. Provide a JSON array response (without any markdown formatting or code blocks) where each object contains:
    {
      "filename": "candidate's filename",
      "matchPercentage": number between 0-100,
      "matchingSkills": array of matching skills,
      "missingRequirements": array of missing requirements,
      "experienceMatch": boolean,
      "educationMatch": boolean,
      "overallAssessment": brief assessment string,
      "ranking": number (1 being best match)
    }

    Sort the array by matchPercentage in descending order and only include candidates with a match percentage above 50%.
    
    Job Details:
    Title: ${jobData.title}
    Description: ${jobData.description}
    Required Skills: ${jobData.skills_required.join(', ')}
    Experience Required: ${jobData.experience_required}
    Requirements: ${jobData.requirements.join(', ')}
    
    Candidates:
    ${resumesData.map((resume, index) => `
    Candidate ${index + 1}:
    ID: ${resume.filename}
    Skills: ${resume.analysis.key_skills.join(', ')}
    Experience: ${resume.analysis.work_experience_details?.map((exp: { title: string; }) => exp.title).join(', ')}
    Education: ${resume.analysis.education_details?.map((edu: { degree: string; major: string; }) => 
      `${edu.degree} in ${edu.major}`).join(', ')}
    `).join('\n')}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanResponse = response.text()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error("Error in batch analysis:", error);
    return [];
  }
}
