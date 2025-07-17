
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FirebaseError } from "firebase-admin/app";
import {
  AuthForm,
  AuthFormSchema,
  AuthFormState,
} from '@/components/auth/auth-form.types';
import { auth as adminAuth } from "@/lib/firebase/server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth as clientAuth } from "@/lib/firebase/client";


const FIREBASE_SERVER_CONFIG_ERROR = "Firebase server authentication is not configured. Please check your environment variables.";

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
      message: "Invalid email or password format.",
    };
  }
  try {
    const { email, password } = result.data;
    await adminAuth.createUser({ email, password });
    
    // After creating the user, we can't sign them in from the server directly.
    // The client will handle the sign-in after a successful sign-up.
    // We will redirect to the auth page with a success message.
    redirect("/auth?message=signup-success");

  } catch (e: any) {
    if (e.code === "auth/email-already-exists") {
      return {
        message: "The email address is already in use by another account.",
      };
    }
     if (e.code === "auth/weak-password") {
       return {
            message: "The password is too weak. It must be at least 6 characters.",
       };
    }
    return {
      message: `An unexpected error occurred during sign up: ${e.message}`,
    };
  }
}
