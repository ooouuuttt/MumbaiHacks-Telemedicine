
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export type UserProfile = {
  uid: string;
  name: string;
  specialization: string;
  email: string;
  bio: string;
  consultationTypes: ('video' | 'audio' | 'chat')[];
  experience: number;
  consultationFee: {
    video: number;
    audio: number;
    chat: number;
  };
  availability: {
    [key: string]: string[];
  };
  license: string;
  avatar: string;
};

/**
 * Creates a new doctor profile in Firestore.
 * @param user The Firebase user object.
 * @param additionalData Additional data to include in the profile.
 */
export async function createDoctorProfile(user: User, additionalData: { name: string }) {
  const userDocRef = doc(db, 'doctors', user.uid);
  const defaultProfile: UserProfile = {
    uid: user.uid,
    name: additionalData.name,
    email: user.email || '',
    specialization: 'General Physician',
    bio: 'Dedicated to providing the best patient care.',
    consultationTypes: ['video', 'chat'],
    experience: 5, // Default experience in years
    consultationFee: {
      video: 500,
      audio: 400,
      chat: 250,
    },
    availability: {
      monday: ['09:00-12:00', '14:00-17:00'],
      tuesday: ['09:00-12:00', '14:00-17:00'],
      wednesday: ['09:00-12:00'],
      thursday: ['09:00-12:00', '14:00-17:00'],
      friday: ['09:00-12:00', '14:00-17:00'],
    },
    license: 'Not Verified',
    avatar: user.photoURL || "https://images.unsplash.com/photo-1582750433449-648ed127bb54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxkb2N0b3J8ZW58MHx8fHwxNzU4NTQ5NjU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  };
  await setDoc(userDocRef, defaultProfile);
  return defaultProfile;
}

/**
 * Retrieves a doctor's profile from Firestore.
 * @param uid The user's unique ID.
 * @returns The user profile object or null if not found.
 */
export async function getDoctorProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, 'doctors', uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
}

/**
 * Updates a doctor's profile in Firestore.
 * @param uid The user's unique ID.
 * @param data The partial profile data to update.
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userDocRef = doc(db, 'doctors', uid);
  await setDoc(userDocRef, data, { merge: true });
}
