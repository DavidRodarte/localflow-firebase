
'use server';

import { db, auth } from '@/lib/firebase/server';
import { getAuth as getClientAuth } from "firebase/auth";
import { auth as clientAuth } from "@/lib/firebase/client";
import type { Listing } from '@/types';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getAuthenticatedUser() {
  // This is a workaround to get the current user on the server.
  // In a real app, you'd use a more robust session management solution.
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  
  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken;
  } catch (error) {
    // Session cookie is invalid or expired.
    return null;
  }
}

async function getUserId() {
    const user = getClientAuth(clientAuth.app).currentUser;
    if(!user) {
        throw new Error("User is not authenticated.");
    }
    const token = await user.getIdToken();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
}

export async function getUserListings(): Promise<Listing[]> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }
  
  const userId = await getUserId();

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

export async function deleteListing(listingId: string): Promise<{ success: boolean; error?: string }> {
  if (!db) {
     return { success: false, error: 'Firestore is not initialized.' };
  }
  
  const userId = await getUserId();
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
