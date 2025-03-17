import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveResumeToFirebase } from "./firebase-helpers";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function analyzeResume(file: File, userId: string, userEmail: string) {
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
    - Key skills
    - Project experience
    - Profile summary

    Please provide the analysis in JSON format.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "application/pdf", data: base64File } },
          ],
        },
      ],
    });

    const response = await result.response;
    console.log(response.text());
    const analysisJson = JSON.parse(response.text());

    // Save to Firebase
    const savedData = await saveResumeToFirebase(file, analysisJson, userId, userEmail);
    
    return {
      analysis: analysisJson,
      savedData
    };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
}
