
'use server';

import { db, auth } from '@/lib/firebase/server';
import type { Listing } from '@/types';
import { revalidatePath } from 'next/cache';

async function getUserIdFromToken(idToken: string) {
  if (!auth) {
    throw new Error("Authentication service is not initialized.");
  }
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid authentication token.");
  }
}

export async function getUserListings(idToken: string): Promise<Listing[]> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }
  
  const userId = await getUserIdFromToken(idToken);

  try {
    const snapshot = await db.collection('listings').where('authorId', '==', userId).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    const listings: Listing[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Listing));
    
    return listings;
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw new Error('Could not fetch your listings.');
  }
}

export async function deleteListing(listingId: string, idToken: string): Promise<{ success: boolean; error?: string }> {
  if (!db) {
     return { success: false, error: 'Firestore is not initialized.' };
  }
  
  const userId = await getUserIdFromToken(idToken);
  const listingRef = db.collection('listings').doc(listingId);

  try {
    const doc = await listingRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Listing not found.' };
    }

    const listing = doc.data() as Listing;
    if (listing.authorId !== userId) {
      return { success: false, error: 'You are not authorized to delete this listing.' };
    }

    await listingRef.delete();
    revalidatePath('/dashboard');
    return { success: true };

  } catch (error) {
    console.error('Error deleting listing:', error);
    return { success: false, error: 'An unexpected error occurred while deleting the listing.' };
  }
}
