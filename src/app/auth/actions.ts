"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "@firebase/util";
import {
  AuthForm,
  AuthFormSchema,
  AuthFormState,
} from '@/components/auth/auth-form.types';
import { auth } from "@/lib/firebase/server";

export async function onSignIn(
  previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const form = Object.fromEntries(formData.entries()) as AuthForm;
  const result = AuthFormSchema.safeParse(form);

  if (!result.success) {
    console.log(result)
    return {
      message: "Invalid credentials.",
    };
  }

  try {
    const { email, password } = result.data;
    await signInWithEmailAndPassword(auth, email, password);
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
  const form = Object.fromEntries(formData.entries()) as AuthForm;
  const result = AuthFormSchema.safeParse(form);

  /*if (!result.success) {
    console.log(result)
    return {
      message: "Invalid credentials.",
    };
  }*/
  try {
    const { email, password } = result.data;
    await createUserWithEmailAndPassword(auth, email, password);
    redirect("/");
  } catch (e) {
    if (e instanceof FirebaseError) {
      switch (e.code) {
        case "auth/email-already-in-use":
          return {
            message: "The email address is already in use.",
          };
        case "auth/weak-password":
          return {
            message: "The password is too weak.",
          };
        default:
          return {
            message: "An unexpected error occurred.",
          };
      }
    }
 return {
      message: "Invalid credentials.",
    };
  }
}
