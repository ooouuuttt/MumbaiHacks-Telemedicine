
'use client';

import { doc, getDoc, setDoc, Timestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

const USERS_COLLECTION = 'users';

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  respiratoryRate?: string;
}

export interface LabReport {
  id: string;
  title: string;
  date: string;
  url: string;
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    days?: string;
    notes?: string;
}

export interface PastPrescription {
  id: string;
  date: string;
  doctorName: string;
  medications: Medication[];
}


export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  avatar: string;
  village: string;
  contact: string;
  healthRecords?: string; // Medical History
  lastVisit?: Timestamp;
  vitals?: VitalSigns;
  labReports?: LabReport[];
  pastPrescriptions?: PastPrescription[];
};

// Function to get user profile from Firestore
export const getUserProfile = async (user: User): Promise<UserProfile | null> => {
  if (!user) return null;

  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserProfile;
    } else {
      console.log('No such document! Creating a default profile.');
      // If no profile exists, create one with default values
      const defaultProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'New User',
        email: user.email || '',
        age: 30,
        gender: 'other',
        avatar: user.photoURL || '',
        contact: '0000000000',
        village: 'My Village',
        healthRecords: '',
        lastVisit: Timestamp.now(),
        vitals: {
            bloodPressure: '120/80 mmHg',
            heartRate: '72 bpm',
            temperature: '98.6°F',
            respiratoryRate: '16 breaths/min'
        },
        labReports: [],
        pastPrescriptions: []
      };
      await setDoc(userDocRef, defaultProfile);
      return defaultProfile;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Function to get just the patient's name
export const getPatientName = async (uid: string): Promise<string | null> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as UserProfile;
      return userData.name;
    }
    return null;
  } catch (error) {
    console.error('Error fetching patient name:', error);
    return null;
  }
};


// Function to update user profile in Firestore
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(userDocRef, data, { merge: true });
};

// Function to add a new prescription to the user's profile
export const addPrescriptionToProfile = async (uid: string, prescription: PastPrescription): Promise<void> => {
    if (!uid || !prescription) {
        throw new Error('User ID and prescription data are required.');
    }
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userDocRef, {
        pastPrescriptions: arrayUnion(prescription)
    });
};
