import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Analyzes how well a resume matches a job description
 * @param jobData The job details
 * @param resumeData The resume details
 * @returns Match analysis results
 */
export const analyzeMatch = async (jobData: any, resumeData: any) => {
  try {
    // Format job data for prompt
    const jobPrompt = `
      Job Title: ${jobData.title || "Not specified"}
      Company: ${jobData.company || "Not specified"}
      Location: ${jobData.location || "Not specified"}
      Job Description: ${jobData.description || "Not specified"}
      Skills Required: ${jobData.skills?.join(", ") || "Not specified"}
      Experience Required: ${jobData.experience || "Not specified"}
      Education Required: ${jobData.education || "Not specified"}
      Job Type: ${jobData.jobType || "Not specified"}
    `;

    // Format resume data for prompt
    const resumePrompt = `
      Candidate Name: ${resumeData.name || "Not specified"}
      Skills: ${resumeData.analysis?.skills?.join(", ") || "Not specified"}
      Years of Experience: ${resumeData.analysis?.years_of_experience || "Not specified"}
      
      Work Experience:
      ${resumeData.analysis?.work_experience_details
        ?.map((exp: any) => 
          `- ${exp.position} at ${exp.company}, ${exp.duration?.start || ""} to ${exp.duration?.end || "present"}
           ${exp.responsibilities ? exp.responsibilities.join("; ") : ""}`
        )
        .join("\n") || "Not specified"}
      
      Education:
      ${resumeData.analysis?.education_details
        ?.map((edu: any) => 
          `- ${edu.degree} in ${edu.major} from ${edu.institute}, ${edu.year || ""}`
        )
        .join("\n") || "Not specified"}
      
      Certifications:
      ${resumeData.analysis?.certifications?.join(", ") || "None"}
      
      Summary: ${resumeData.analysis?.summary || "Not provided"}
    `;

    // Create a structured prompt for the AI
    const prompt = `
      As an AI recruitment assistant, analyze how well this candidate's profile matches the job requirements.
      
      JOB DETAILS:
      ${jobPrompt}
      
      CANDIDATE PROFILE:
      ${resumePrompt}
      
      Please provide a structured JSON response with the following fields:
      - matchPercentage: A number between 0-100 representing overall match
      - matchingSkills: Array of skills that match the job requirements
      - missingRequirements: Array of requirements the candidate doesn't meet
      - experienceMatch: Boolean indicating if candidate meets experience requirements
      - educationMatch: Boolean indicating if candidate meets education requirements
      - overallAssessment: Brief text explaining the match quality
      
      FORMAT YOUR RESPONSE AS VALID JSON ONLY.
    `;

    // Send prompt to Gemini API
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the response as JSON
    try {
      // Find JSON in the response (handle case where AI adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      const jsonResponse = JSON.parse(jsonStr);
      
      return {
        ...resumeData,
        matchAnalysis: {
          matchPercentage: Number(jsonResponse.matchPercentage) || 0,
          matchingSkills: jsonResponse.matchingSkills || [],
          missingRequirements: jsonResponse.missingRequirements || [],
          experienceMatch: Boolean(jsonResponse.experienceMatch),
          educationMatch: Boolean(jsonResponse.educationMatch),
          overallAssessment: jsonResponse.overallAssessment || "No assessment provided"
        }
      };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      // Return a default match analysis if parsing fails
      return {
        ...resumeData,
        matchAnalysis: {
          matchPercentage: 0,
          matchingSkills: [],
          missingRequirements: ["Failed to analyze requirements"],
          experienceMatch: false,
          educationMatch: false,
          overallAssessment: "Failed to analyze match due to an error."
        }
      };
    }
  } catch (error) {
    console.error("Error in match analysis:", error);
    // Return a default match analysis if API call fails
    return {
      ...resumeData,
      matchAnalysis: {
        matchPercentage: 0,
        matchingSkills: [],
        missingRequirements: ["Failed to analyze requirements"],
        experienceMatch: false,
        educationMatch: false,
        overallAssessment: "Failed to analyze match due to an error."
      }
    };
  }
};

/**
 * Process a batch of resumes against a job description
 * @param jobData Job details
 * @param resumes Array of resume data
 * @returns Array of resumes with match analysis
 */
export const analyzeBatchMatches = async (jobData: any, resumes: any[]) => {
  try {
    // Process resumes in batches to avoid rate limiting
    const batchSize = 5; // Adjust based on your API limits
    const results = [];
    
    for (let i = 0; i < resumes.length; i += batchSize) {
      const batch = resumes.slice(i, i + batchSize);
      const batchPromises = batch.map(resume => analyzeMatch(jobData, resume));
      
      // Wait for all resumes in this batch to be processed
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  } catch (error) {
    console.error("Error in batch match analysis:", error);
    // Return resumes with empty match analysis if batch processing fails
    return resumes.map(resume => ({
      ...resume,
      matchAnalysis: {
        matchPercentage: 0,
        matchingSkills: [],
        missingRequirements: ["Failed to analyze requirements"],
        experienceMatch: false,
        educationMatch: false,
        overallAssessment: "Failed to analyze match due to an error."
      }
    }));
  }
};