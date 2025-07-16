"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  AuthForm,
  AuthFormSchema,
  AuthFormState,
} from "@/components/auth/auth-form.types";
import { auth } from "@/lib/firebase/server";

export async function onSignIn(
  previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const form = Object.fromEntries(formData.entries()) as AuthForm;
  const result = AuthFormSchema.safeParse(form);

  if (!result.success) {
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

  if (!result.success) {
    return {
      message: "Invalid credentials.",
    };
  }
  try {
    const { email, password } = result.data;
    await createUserWithEmailAndPassword(auth, email, password);
    redirect("/");
  } catch (e) {
    return {
      message: "Invalid credentials.",
    };
  }
}
