
'use server';

import { db } from '@/lib/firebase/server';
import type { Listing } from '@/types';

export async function getListings(): Promise<Listing[]> {
  if (!db) {
    console.error('Firestore is not initialized. Check your server environment variables.');
    return [];
  }

  try {
    const snapshot = await db.collection('listings').orderBy('createdAt', 'desc').get();
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
        imageUrls: data.imageUrls,
        imageHint: data.imageHint,
        authorId: data.authorId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
    
    return listings;

  } catch (error) {
    console.error('Error fetching listings:', error);
    // If ordering fails (e.g., because some documents don't have the field), fallback to unsorted.
    if (error instanceof Error && error.message.includes('requires an index')) {
        console.warn('Firestore index for sorting not found. Falling back to unsorted listings. Please create the required index in Firebase.');
        const snapshot = await db.collection('listings').get();
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
            imageUrls: data.imageUrls,
            imageHint: data.imageHint,
            authorId: data.authorId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        return listings;
    }
    return [];
  }
}
