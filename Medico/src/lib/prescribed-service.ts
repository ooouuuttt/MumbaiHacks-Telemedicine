'use client';

import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Medication } from './user-service';

export interface PrescriptionDetails {
    patientName: string;
    doctorName: string;
    medicines: Medication[];
}

/**
 * Creates a new prescription document in the MediPrescription sub-collection for a specific pharmacy.
 * @param pharmacyId The unique ID of the pharmacy.
 * @param prescriptionDetails An object containing the patient's name, doctor's name, and a list of medicines.
 */
export const sendPrescription = async (
  pharmacyId: string,
  prescriptionDetails: PrescriptionDetails
): Promise<void> => {
  if (!pharmacyId) {
    throw new Error('Pharmacy ID is required.');
  }

  const mediPrescriptionCollectionRef = collection(db, 'pharmacies', pharmacyId, 'MediPrescription');

  await addDoc(mediPrescriptionCollectionRef, {
    ...prescriptionDetails,
    status: 'Pending',
    date: serverTimestamp(),
  });
};
