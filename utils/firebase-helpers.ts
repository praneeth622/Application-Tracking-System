import { db, storage } from "@/FirebaseConfig";
import { doc, updateDoc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export interface ResumeData {
  filename: string;
  filelink: string;
  fileHash: string;
  analysis: any;
  vendor_id: string | null;
  vendor_name: string | null;
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
  userEmail: string,
  vendor_id: string | null = null,
  vendor_name: string | null = null
): Promise<ResumeData> {
  try {
    // Generate file hash
    const fileBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check for duplicates
    const isDuplicate = await checkDuplicateResume(userId, fileHash);
    if (isDuplicate) {
      throw new Error('This resume has already been uploaded');
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}_${file.name}`;
    
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `resumes/${userId}/${uniqueFilename}`);
    await uploadBytes(storageRef, file);
    const filelink = await getDownloadURL(storageRef);

    // Prepare resume data with simple vendor reference
    const resumeData: ResumeData = {
      filename: uniqueFilename,
      filelink,
      fileHash,
      analysis,
      vendor_id,
      vendor_name,
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

export async function checkDuplicateResume(
  userId: string,
  fileHash: string
): Promise<boolean> {
  const userResumesRef = doc(db, "users", userId, "resumes", "data");
  const docSnap = await getDoc(userResumesRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.resumes?.some((resume: ResumeData) => 
      resume.fileHash === fileHash
    ) || false;
  }
  
  return false;
}

async function generateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      resolve(hashHex);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
