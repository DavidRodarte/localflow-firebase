
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import {
  AuthForm,
  AuthFormSchema,
  AuthFormState,
} from '@/components/auth/auth-form.types';
import { auth as clientAuth } from "@/lib/firebase/client";
import { auth as adminAuth } from "@/lib/firebase/server";


const FIREBASE_SERVER_CONFIG_ERROR = "Firebase server authentication is not configured. Please check your environment variables.";

export async function onSignIn(
  previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!clientAuth) {
    return { message: "Firebase client authentication is not configured." };
  }
  
  const form = Object.fromEntries(formData.entries()) as AuthForm;
  const result = AuthFormSchema.safeParse(form);

  if (!result.success) {
    return {
      message: "Invalid credentials.",
    };
  }

  try {
    const { email, password } = result.data;
    await signInWithEmailAndPassword(clientAuth, email, password);
    revalidatePath("/");
    redirect("/");
  } catch (e) {
    return {
      message: "Invalid credentials.",
    };
  }
}

export async function onSignUp(
  previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!adminAuth) {
    return { message: FIREBASE_SERVER_CONFIG_ERROR };
  }

  const form = Object.fromEntries(formData.entries()) as AuthForm;
  const result = AuthFormSchema.safeParse(form);

  if (!result.success) {
    return {
      message: "Invalid credentials.",
    };
  }
  try {
    const { email, password } = result.data;
    await adminAuth.createUser({ email, password });
    
    return onSignIn(previousState, formData);

  } catch (e) {
    if (e instanceof FirebaseError) {
      switch (e.code) {
        case "auth/email-already-exists":
          return {
            message: "The email address is already in use.",
          };
        case "auth/weak-password":
          return {
            message: "The password is too weak.",
          };
        default:
          return {
            message: "An unexpected error occurred during sign up.",
          };
      }
    }
    return {
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
