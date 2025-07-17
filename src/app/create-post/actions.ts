
"use server";

import { suggestTags, type SuggestTagsInput } from "@/ai/flows/suggest-tags";
import { db, auth } from "@/lib/firebase/server";
import { type Listing } from "@/types";
import { redirect } from "next/navigation";

type CreatePostInput = Omit<Listing, "id" | "authorId" | "imageUrl" | "imageHint">;

export async function createPost(input: CreatePostInput, idToken: string) {
  if (!db || !auth) {
    throw new Error("Firestore or Auth is not initialized. Check your server environment variables.");
  }

  try {
    const user = await auth.verifyIdToken(idToken);
    if (!user) {
      throw new Error("Authentication failed.");
    }

    const authorId = user.uid;
    const newPost: Omit<Listing, "id"> = {
      ...input,
      authorId: authorId,
      // Hardcoding placeholder image for now
      imageUrl: "https://placehold.co/600x400.png",
      imageHint: "new listing"
    };

    await db.collection("listings").add(newPost);
    
  } catch (error: any) {
    // This is the crucial part: If the error is a redirect, we must re-throw it.
    if (error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error creating post:", error);
    // Re-throw other errors to be caught by the client
    throw new Error("Failed to create post in database.");
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
