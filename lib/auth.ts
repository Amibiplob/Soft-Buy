import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

export const signUp = async (name: string, email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: name,
    });

    // optional but recommended
    await auth.currentUser.reload();
  }

  return userCredential;
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};
