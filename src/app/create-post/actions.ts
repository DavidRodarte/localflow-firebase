
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

  let user;
  try {
    user = await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("User is not authenticated or session is invalid.");
  }

  if (!user) {
    throw new Error("Authentication failed.");
  }

  const authorId = user.uid;

  try {
    const newPost: Omit<Listing, "id"> = {
      ...input,
      authorId: authorId,
      // Hardcoding placeholder image for now
      imageUrl: "https://placehold.co/600x400.png",
      imageHint: "new listing"
    };

    await db.collection("listings").add(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post.");
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
