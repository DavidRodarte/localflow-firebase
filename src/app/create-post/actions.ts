
"use server";

import { suggestTags, type SuggestTagsInput } from "@/ai/flows/suggest-tags";
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
  const newPost: Omit<Listing, "id"> = {
    ...input,
    authorId: authorId,
    // Hardcoding placeholder image for now
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "new listing"
  };

  try {
    await db.collection("listings").add(newPost);
  } catch (error) {
    console.error("Error creating post in database:", error);
    // Throw a real error that the client can catch
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
