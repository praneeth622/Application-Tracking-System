import apiClient from "@/lib/api-client";

export async function initializeNewUser(userId: string, email: string) {
  try {
    const userData = {
      uid: userId,
      email: email,
      name: email.split("@")[0], // Default name from email
      role: "user" // Default role
    };
    
    // Create the user via API
    await apiClient.auth.updateUser(userData);
    
    return true;
  } catch (error) {
    console.error("Error initializing user:", error);
    throw error;
  }
}
