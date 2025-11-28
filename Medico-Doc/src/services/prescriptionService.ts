
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { GeneratePrescriptionOutput } from '@/ai/flows/ai-generate-prescription';

type PrescriptionInput = GeneratePrescriptionOutput & {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
};

/**
 * Saves a new prescription document to the 'prescriptions' collection in Firestore.
 * @param prescription The prescription data to save.
 * @returns An object indicating success status, and either the new document ID or an error message.
 */
export async function savePrescription(
  prescription: PrescriptionInput
): Promise<{ success: boolean; prescriptionId?: string; error?: string }> {
  if (!prescription.patientId || !prescription.doctorId) {
    return { success: false, error: 'Patient ID and Doctor ID are required.' };
  }

  try {
    const prescriptionData = {
      ...prescription,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionData);
    console.log('Prescription created with ID: ', docRef.id);
    return { success: true, prescriptionId: docRef.id };
  } catch (error) {
    console.error('Error creating prescription: ', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
