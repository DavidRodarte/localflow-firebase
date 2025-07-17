
'use server';

import { db } from '@/lib/firebase/server';
import type { Listing, UserProfile } from '@/types';

export async function getListingDetails(
  listingId: string
): Promise<(Listing & { author: UserProfile | null }) | null> {
  if (!db) {
    console.error('Firestore is not initialized.');
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
