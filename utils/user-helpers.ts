import { doc, setDoc } from "firebase/firestore";
import { db } from "@/FirebaseConfig";

export async function initializeNewUser(userId: string, email: string) {
  const userProfileRef = doc(db, "users", userId, "userProfile", "data");
  
  await setDoc(userProfileRef, {
    email: email,
    role: "user", // Default role
    createdAt: new Date(),
    updatedAt: new Date(),
    name: email.split("@")[0], // Default name from email
    status: "active"
  });

  // Also set the main user document
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    email: email,
    role: "user", // Default role
    createdAt: new Date(),
    status: "active"
  });
}
