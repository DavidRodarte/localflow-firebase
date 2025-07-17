
'use server';

import { db, auth } from '@/lib/firebase/server';
import type { UserProfile } from '@/types';
import { revalidatePath } from 'next/cache';

async function getUserIdFromToken(idToken: string): Promise<string> {
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

export async function getUserProfile(
  idToken: string
): Promise<UserProfile | null> {
  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  const userId = await getUserIdFromToken(idToken);
  const userRef = db.collection('users').doc(userId);
  const docSnap = await userRef.get();
  
  const userRecord = await auth.getUser(userId);

  if (docSnap.exists) {
    return { id: docSnap.id, email: userRecord.email || '', ...docSnap.data() } as UserProfile;
  } else {
    // If no profile exists, create a default one from auth data
    return {
      id: userId,
      email: userRecord.email || '',
      name: userRecord.displayName,
    };
  }
}

export async function updateUserProfile(
  input: Omit<UserProfile, 'id' | 'email'>,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: 'Firestore is not initialized.' };
  }

  try {
    const userId = await getUserIdFromToken(idToken);
    const userRef = db.collection('users').doc(userId);
    
    // Get user's email from Firebase Auth to ensure it's correct
    const userRecord = await auth.getUser(userId);
    const email = userRecord.email;

    const profileData = {
        ...input,
        email: email,
    };

    // Using set with merge:true will create the document if it doesn't exist,
    // and update it if it does, without overwriting unspecified fields.
    await userRef.set(profileData, { merge: true });

    revalidatePath('/profile');
    revalidatePath(`/listings`); // Revalidate listings to show updated author info
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating your profile.',
    };
  }
}
