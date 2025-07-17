
"use server";

import { suggestTags, type SuggestTagsInput } from "@/ai/flows/suggest-tags";
import { db, auth } from "@/lib/firebase/server";
import { type Listing } from "@/types";
import { redirect } from "next/navigation";

// The input now includes the imageUrl as a Base64 string
type CreatePostInput = Omit<Listing, "id" | "authorId" | "imageHint">;

export async function createPost(input: CreatePostInput, idToken: string) {
  if (!db || !auth) {
    console.error("Firestore or Auth is not initialized. Check your server environment variables.");
    throw new Error("Server is not configured correctly.");
  }

  let user;
  try {
    user = await auth.verifyIdToken(idToken);
  } catch (error) {
     console.error("Error verifying ID token:", error);
     throw new Error("Authentication failed. Please sign in again.");
  }
  
  if (!user) {
    throw new Error("Authentication failed. Please sign in again.");
  }

  const authorId = user.uid;

  const newPost: Omit<Listing, "id"> = {
    ...input,
    authorId: authorId,
    imageHint: input.title // Use title as the hint for accessibility and potential future AI
  };

  try {
    await db.collection("listings").add(newPost);
  } catch (error: any) {
    console.error("Error creating post in database:", error);
    if (error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    throw new Error("Failed to create post in the database. Please try again.");
  }
  
  redirect("/");
}


export async function getTagSuggestions(input: SuggestTagsInput) {
  try {
    const result = await suggestTags(input);
    return result;
  } catch (error) {
    console.error("Error getting tag suggestions:", error);
    throw new Error("Failed to get suggestions from AI.");
  }
}
