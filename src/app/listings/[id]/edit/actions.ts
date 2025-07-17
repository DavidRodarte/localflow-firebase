
'use server';

import { db, auth } from '@/lib/firebase/server';
import type { Listing } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
    // Or throw an error, depending on how you want to handle unauthorized access
    return null;
  }

  return listing;
}

type UpdatePostInput = Omit<Listing, 'id' | 'authorId' | 'imageUrls' | 'imageHint'>;

export async function updateListing(
  listingId: string,
  input: UpdatePostInput,
  idToken: string
) {
  if (!db || !auth) {
    console.error(
      'Firestore or Auth is not initialized. Check your server environment variables.'
    );
    throw new Error('Server is not configured correctly.');
  }

  const userId = await getUserIdFromToken(idToken);
  const docRef = db.collection('listings').doc(listingId);

  try {
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error('Listing not found.');
    }
    const listingData = doc.data() as Listing;
    if (listingData.authorId !== userId) {
      throw new Error('You are not authorized to update this listing.');
    }

    await docRef.update(input);
  } catch (error: any) {
    console.error('Error updating post in database:', error);
    if (error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    throw new Error('Failed to update post in the database. Please try again.');
  }

  revalidatePath('/dashboard');
  revalidatePath(`/listings/${listingId}/edit`);
  redirect('/dashboard');
}
