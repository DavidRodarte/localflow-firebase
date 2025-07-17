
'use server';

import { db, auth } from '@/lib/firebase/server';
import type { Listing, UserProfile } from '@/types';

export async function getListingDetails(
  listingId: string
): Promise<(Listing & { author: UserProfile | null }) | null> {
  if (!db || !auth) {
    console.error('Firestore or Auth is not initialized.');
    throw new Error('Server is not configured correctly.');
  }

  try {
    const listingRef = db.collection('listings').doc(listingId);
    const listingSnap = await listingRef.get();

    if (!listingSnap.exists) {
      return null;
    }

    const listingData = { id: listingSnap.id, ...listingSnap.data() } as Listing;

    let author: UserProfile | null = null;
    if (listingData.authorId) {
      const userRef = db.collection('users').doc(listingData.authorId);
      const userSnap = await userRef.get();

      if (userSnap.exists) {
        author = { id: userSnap.id, ...userSnap.data() } as UserProfile;
        // Fallback for older profiles that might not have email stored
        if (!author.email) {
            const userRecord = await auth.getUser(listingData.authorId);
            author.email = userRecord.email || '';
        }
      } else {
        // If no profile doc, create one from auth data
        const userRecord = await auth.getUser(listingData.authorId);
         author = {
            id: userRecord.uid,
            email: userRecord.email || '',
            name: userRecord.displayName,
         }
      }
    }

    return {
      ...listingData,
      author,
    };
  } catch (error) {
    console.error('Error fetching listing details:', error);
    throw new Error('Failed to fetch listing details.');
  }
}
