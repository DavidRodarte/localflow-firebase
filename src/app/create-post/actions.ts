
"use server";

import { suggestTags, type SuggestTagsInput } from "@/ai/flows/suggest-tags";
import { db, auth, storage } from "@/lib/firebase/server";
import { type Listing } from "@/types";
import { redirect } from "next/navigation";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath } from "next/cache";

// The input now includes the imageUrl as a Base64 string
type CreatePostInput = Omit<Listing, "id" | "authorId" | "imageHint" | "createdAt" | "updatedAt">;

async function uploadImage(dataUri: string, authorId: string): Promise<string> {
    if (!storage) {
        throw new Error("Storage is not initialized.");
    }

    const bucket = storage.bucket();
    const mimeType = dataUri.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
    const extension = mimeType.split('/')[1] || 'jpg';
    const base64Data = dataUri.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `listings/${authorId}/${Date.now()}.${extension}`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
        metadata: {
            contentType: mimeType,
        },
    });

    const publicUrl = await getDownloadURL(file);
    return publicUrl;
}

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

  const imageUrls = await Promise.all(
    input.imageUrls.map(dataUri => uploadImage(dataUri, authorId))
  );

  const newPost: Omit<Listing, "id"> = {
    ...input,
    imageUrls: imageUrls,
    authorId: authorId,
    createdAt: new Date().toISOString(),
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
  
  revalidatePath('/');
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

