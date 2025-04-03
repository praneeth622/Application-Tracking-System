import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveResumeToFirebase } from "./firebase-helpers";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function analyzeResume(file: File, userId: string, userEmail: string, vendorId: string | null = null, vendorName: string | null = null) {
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

    const fileBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString("base64");

    const prompt = `You are an experienced IT recruitment specialist. Carefully analyze the attached resume and extract the following candidate's details:
    - Name
    - Phone number
    - Email
    - Social profile links
    - Education details
    - Work experience details
    - Key skills (Return as a single flat array without subcategories)
    - Project experience
    - Profile summary (Give a brief analysis of the candidate's profile)

    Ensure the output is in valid JSON format with no additional formatting, markdown, or code block syntax.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { 
              mimeType: "application/pdf", 
              data: base64File 
            }},
          ],
        },
      ],
    }).catch(error => {
      console.error("Gemini API error:", error);
      throw new Error("Failed to analyze resume with AI model");
    });

    const response = await result.response;
    const responseText = await response.text();
    
    // Clean the response text by removing markdown code block syntax
    const cleanResponse = responseText
      .replace(/```json\n?/, '')
      .replace(/```\n?$/, '')
      .trim();

    let analysisJson;
    try {
      analysisJson = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid JSON response from AI model");
    }

    // Save to Firebase with just vendor ID and name
    const savedData = await saveResumeToFirebase(
      file, 
      analysisJson, 
      userId, 
      userEmail, 
      vendorId, 
      vendorName
    );
    
    return {
      analysis: analysisJson,
      savedData
    };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
}
