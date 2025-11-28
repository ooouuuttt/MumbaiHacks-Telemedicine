
'use server';

import { db } from '@/lib/firebase';
import type { Patient, Appointment } from '@/lib/types';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { getAppointmentsForDoctor } from './appointmentService';

/**
 * Fetches all patients who have an appointment with a specific doctor.
 * @param doctorId The UID of the doctor.
 * @returns A promise that resolves to an array of unique patients.
 */
export async function getPatientsForDoctor(doctorId: string): Promise<Patient[]> {
  if (!doctorId) {
    console.error('Doctor ID is required to fetch patients.');
    return [];
  }

  try {
    // 1. Get all appointments for the doctor
    const appointments = await getAppointmentsForDoctor(doctorId);
    if (appointments.length === 0) {
      return [];
    }

    // 2. Get unique patient IDs from appointments
    const patientIds = [...new Set(appointments.map(app => app.patientId))];

    // 3. Fetch details for each unique patient
    const patientPromises = patientIds.map(patientId => getPatientById(patientId));
    const patients = (await Promise.all(patientPromises)).filter((p): p is Patient => p !== null);
    
    return patients;
  } catch (error) {
    console.error('Error fetching patients for doctor:', error);
    return [];
  }
}

/**
 * Fetches a single patient's profile from the 'users' collection in Firestore.
 * @param patientId The UID of the patient.
 * @returns A promise that resolves to the patient's profile or null if not found.
 */
export async function getPatientById(patientId: string): Promise<Patient | null> {
    if (!patientId) {
        console.error('Patient ID is required.');
        return null;
    }

    try {
        const patientDocRef = doc(db, 'users', patientId);
        const docSnap = await getDoc(patientDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const lastVisitTimestamp = data.lastVisit as Timestamp;

            return {
                id: docSnap.id,
                name: data.name,
                age: data.age,
                gender: data.gender,
                lastVisit: lastVisitTimestamp ? lastVisitTimestamp.toDate().toLocaleDateString() : 'N/A',
                avatar: data.avatar || `https://picsum.photos/seed/${docSnap.id}/100/100`,
                healthRecords: data.healthRecords || '',
                messages: data.messages || [],
                vitals: data.vitals,
                labReports: data.labReports,
                pastPrescriptions: data.pastPrescriptions,
            } as Patient;
        } else {
            console.log(`No patient found with ID: ${patientId}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching patient by ID:', error);
        return null;
    }
}
