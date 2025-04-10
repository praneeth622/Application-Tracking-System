import { GoogleGenerativeAI } from "@google/generative-ai";

// Update the initialization with the correct API version
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// Update the model name to use the current version
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Replace any usage of "gemini-pro" with "gemini-1.5-pro" elsewhere in the file
export async function analyzeMatch(job: any, resume: any) {
  try {
    const prompt = `
      # Job Description and Resume Matching Analysis
      
      ## Job Details:
      ${JSON.stringify(job, null, 2)}
      
      ## Resume:
      ${JSON.stringify(resume, null, 2)}
      
      ## Task:
      Analyze how well this resume matches the job description. Provide:
      1. Match percentage (number between 0-100)
      2. List of matching skills found in both job and resume
      3. List of required skills/qualifications missing in the resume
      4. Whether the candidate's experience level matches requirements (true/false)
      5. Whether the candidate's education matches requirements (true/false)
      6. A brief overall assessment of the candidate's fit
      
      ## Output Format (JSON):
      {
        "matchPercentage": 85,
        "matchingSkills": ["skill1", "skill2"],
        "missingRequirements": ["req1", "req2"],
        "experienceMatch": true,
        "educationMatch": true,
        "overallAssessment": "This candidate is a strong match because..."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/\{[\s\S]*\}/);
                      
    if (jsonMatch) {
      const jsonStr = jsonMatch[0].replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } else {
      // Fallback for when JSON isn't properly formatted
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON response:", text);
        return null;
      }
    }
  } catch (error) {
    console.error("Error in match analysis:", error);
    return null;
  }
}

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
    const results: any[] = [];
    
    for (let i = 0; i < resumes.length; i += batchSize) {
      const batch = resumes.slice(i, i + batchSize);
      const batchPromises = batch.map(resume => analyzeMatch(jobData, resume));
      
      try {
        // Wait for all resumes in this batch to be processed
        const batchResults = await Promise.all(batchPromises);
        
        // Filter out null results and add filename from the original resume
        const validResults = batchResults.map((result, index) => {
          if (!result) return null;
          return {
            ...result,
            filename: batch[index].filename
          };
        }).filter(result => result !== null);
        
        results.push(...validResults);
      } catch (batchError) {
        console.error("Error processing batch:", batchError);
        // Continue with next batch instead of failing the entire process
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error in batch match analysis:", error);
    return [];
  }
};