import { db, storage } from "@/FirebaseConfig";
import { doc, updateDoc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
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

    // Get reference to user's resumes document
    const userResumesRef = doc(db, "users", userId, "resumes", "data");

    try {
      // Check if document exists
      const docSnap = await getDoc(userResumesRef);

      if (!docSnap.exists()) {
        // Create new document if it doesn't exist
        await setDoc(userResumesRef, {
          user_id: userId,
          user_emailid: userEmail,
          resumes: [resumeData]
        });
      } else {
        // Update existing document by adding new resume to array
        await updateDoc(userResumesRef, {
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
