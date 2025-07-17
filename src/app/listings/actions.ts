'use server';

import { db } from '@/lib/firebase/server';
import type { Listing } from '@/types';

export async function getListings(): Promise<Listing[]> {
  if (!db) {
    console.error('Firestore is not initialized. Check your server environment variables.');
    return [];
  }

  try {
    const snapshot = await db.collection('listings').get();
    if (snapshot.empty) {
      return [];
    }
    
    const listings: Listing[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        location: data.location,
        tags: data.tags,
        imageUrl: data.imageUrl,
        imageHint: data.imageHint,
        authorId: data.authorId,
      };
    });
    
    return listings;

  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}
