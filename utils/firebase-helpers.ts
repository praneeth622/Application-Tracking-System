import { db, storage } from "@/FirebaseConfig";
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export interface ResumeData {
  filename: string;
  filelink: string;
  analysis: any;
  uploadedAt: Date;
}

export interface UserResumes {
  user_id: string;
  user_emailid: string;
  resumes: ResumeData[];
}

export async function saveResumeToFirebase(
  file: File, 
  analysis: any, 
  userId: string, 
  userEmail: string
): Promise<ResumeData> {
  try {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}_${file.name}`;
    
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `resumes/${userId}/${uniqueFilename}`);
    await uploadBytes(storageRef, file);
    const filelink = await getDownloadURL(storageRef);

    // Prepare resume data
    const resumeData: ResumeData = {
      filename: uniqueFilename,
      filelink,
      analysis,
      uploadedAt: new Date(),
    };

    // Get reference to user document
    const userDocRef = doc(db, "users", userId);

    try {
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userDocRef, {
          user_id: userId,
          user_emailid: userEmail,
          resumes: [resumeData]
        });
      } else {
        // Update existing user document
        await updateDoc(userDocRef, {
          resumes: arrayUnion(resumeData)
        });
      }

      return resumeData;
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in saveResumeToFirebase:", error);
    throw error;
  }
}