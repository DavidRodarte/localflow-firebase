
'use server';

import { db, auth, storage } from '@/lib/firebase/server';
import type { Listing } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDownloadURL } from 'firebase-admin/storage';

async function getUserIdFromToken(idToken: string) {
  if (!auth) {
    throw new Error('Authentication service is not initialized.');
  }
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid authentication token.');
  }
}

export async function getListing(
  listingId: string,
  idToken: string
): Promise<Listing | null> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  const userId = await getUserIdFromToken(idToken);
  const docRef = db.collection('listings').doc(listingId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return null;
  }

  const listing = { id: docSnap.id, ...docSnap.data() } as Listing;

  if (listing.authorId !== userId) {
    return null;
  }

  return listing;
}

// Helper to upload a single image
async function uploadImage(dataUri: string, authorId: string): Promise<string> {
  if (!storage) {
    throw new Error('Storage is not initialized.');
  }
  const bucket = storage.bucket();
  const mimeType = dataUri.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
  const extension = mimeType.split('/')[1] || 'jpg';
  const base64Data = dataUri.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const fileName = `listings/${authorId}/${Date.now()}.${extension}`;
  const file = bucket.file(fileName);
  await file.save(buffer, { metadata: { contentType: mimeType } });
  return getDownloadURL(file);
}

// Helper to delete a single image
async function deleteImage(fileUrl: string) {
  if (!storage) {
    console.warn('Storage is not initialized, skipping file deletion.');
    return;
  }
  try {
    const bucket = storage.bucket();
    const decodedUrl = decodeURIComponent(fileUrl);
    const path = decodedUrl.split('/o/')[1].split('?')[0];
    await bucket.file(path).delete();
  } catch (error: any) {
    if (error.code !== 404) {
      console.error(`Error deleting file from storage: ${fileUrl}`, error);
    }
  }
}

type UpdatePostInput = Omit<Listing, 'id' | 'authorId' | 'imageHint' | 'createdAt' | 'updatedAt'>;

export async function updateListing(
  listingId: string,
  input: UpdatePostInput,
  newImages: string[], // Array of new image data URIs
  idToken: string
) {
  if (!db || !auth) {
    throw new Error('Server is not configured correctly.');
  }

  const userId = await getUserIdFromToken(idToken);
  const docRef = db.collection('listings').doc(listingId);

  try {
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error('Listing not found.');
    }
    const currentListing = doc.data() as Listing;
    if (currentListing.authorId !== userId) {
      throw new Error('You are not authorized to update this listing.');
    }

    // Identify and delete removed images from storage
    const imagesToDelete = currentListing.imageUrls.filter(
      (url) => !input.imageUrls.includes(url)
    );
    await Promise.all(imagesToDelete.map((url) => deleteImage(url)));
    
    // Upload new images to storage
    const newImageUrls = await Promise.all(
      newImages.map((dataUri) => uploadImage(dataUri, userId))
    );
    
    // Combine kept old URLs with new URLs
    const finalImageUrls = [...input.imageUrls, ...newImageUrls];

    const updateData = {
      ...input,
      imageUrls: finalImageUrls,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updateData);
  } catch (error: any) {
    console.error('Error updating post in database:', error);
    if (error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    throw new Error('Failed to update post in the database. Please try again.');
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath(`/listings/${listingId}`);
  revalidatePath(`/listings/${listingId}/edit`);
  redirect('/dashboard');
}
