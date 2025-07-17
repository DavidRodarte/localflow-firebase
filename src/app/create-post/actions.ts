
"use server";

import { suggestTags, type SuggestTagsInput } from "@/ai/flows/suggest-tags";
import { generateImage } from "@/ai/flows/generate-image-flow";
import { db, auth } from "@/lib/firebase/server";
import { type Listing } from "@/types";
import { redirect } from "next/navigation";

type CreatePostInput = Omit<Listing, "id" | "authorId" | "imageUrl" | "imageHint">;

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
  
  // Generate image from title
  const { imageUrl } = await generateImage({ title: input.title });

  const newPost: Omit<Listing, "id"> = {
    ...input,
    authorId: authorId,
    imageUrl: imageUrl,
    imageHint: input.title // Use title as the hint for future AI operations
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
  
  // Redirect only after all database operations are successful
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
