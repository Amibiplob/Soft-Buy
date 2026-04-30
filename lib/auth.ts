import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firebase";

// Sign-up function (email and password)
export const signUp = async (name: string, email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  if (auth.currentUser) {
    // Update the display name for the user
    await updateProfile(auth.currentUser, {
      displayName: name,
    });

    // Reload the user to ensure displayName is updated
    await auth.currentUser.reload();
  }

  return userCredential;
};

// Sign-in function (email and password)
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google Sign-In
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider(); // Firebase's Google Auth provider
  try {
    const result = await signInWithPopup(auth, provider); // Sign-in with Google using a popup
    const user = result.user; // Get the signed-in user's info

    console.log("Google User Info:", user);
    return user; // Return the user info
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error; // Throw the error to be handled by the calling component
  }
};

// Password Reset Function
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email); // Send the password reset email
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Password Reset Error:", error);
    throw error; // Throw the error to be handled by the calling component
  }
};

// Logout function
export const logout = () => {
  return signOut(auth); // Signs the user out of the Firebase authentication session
};
