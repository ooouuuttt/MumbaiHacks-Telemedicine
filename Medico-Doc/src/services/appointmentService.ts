
'use server';

import { db } from '@/lib/firebase';
import type { Appointment } from '@/lib/types';
import { collection, query, where, getDocs, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { createCancellationNotification } from '@/ai/flows/ai-create-cancellation-notification';


/**
 * Fetches appointments for a specific doctor from Firestore.
 * @param doctorId The UID of the doctor.
 * @returns A promise that resolves to an array of appointments.
 */
export async function getAppointmentsForDoctor(doctorId: string): Promise<Appointment[]> {
  if (!doctorId) {
    console.error('Doctor ID is required to fetch appointments.');
    return [];
  }

  try {
    const appointmentsCol = collection(db, 'appointments');
    const q = query(appointmentsCol, where('doctorId', '==', doctorId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No appointments found for doctor:', doctorId);
      return [];
    }

    const appointments = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // Convert the Firestore Timestamp to a JavaScript Date object.
      const utcDate = (data.date as Timestamp).toDate();
      
      // Manually add 5 hours and 30 minutes for IST conversion
      utcDate.setHours(utcDate.getHours() + 5);
      utcDate.setMinutes(utcDate.getMinutes() + 30);

      const correctedDate = utcDate;

      return {
        id: doc.id,
        patientId: data.patientId,
        patientName: data.patientName,
        // TODO: Fetch patient avatar from the 'users' collection based on patientId
        patientAvatar: `https://picsum.photos/seed/${data.patientId}/100/100`, 
        time: correctedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        date: correctedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        type: data.type as 'video' | 'chat',
        status: data.status as 'upcoming' | 'completed' | 'cancelled',
        cancellationReason: data.cancellationReason || null,
        zoomStartUrl: data.start_url || null,
        zoomJoinUrl: data.join_url || null,
      } as Appointment;
    });

    return appointments;
  } catch (error) {
    console.error('Error fetching appointments: ', error);
    // In a real app, you might want to throw the error or handle it differently
    return [];
  }
}


/**
 * Updates an appointment's status to 'cancelled' in Firestore.
 * @param appointmentId The ID of the appointment to cancel.
 * @param reason The reason for the cancellation.
 * @returns An object indicating success or failure.
 */
export async function cancelAppointment(
  appointmentId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!appointmentId) {
    return { success: false, error: 'Appointment ID is required.' };
  }
  if (!reason || reason.trim() === '') {
    return { success: false, error: 'A reason for cancellation is required.' };
  }

  try {
    const appointmentDocRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentDocRef);
    if (!appointmentSnap.exists()) {
        return { success: false, error: 'Appointment not found.' };
    }
    const appointmentData = appointmentSnap.data();

    await updateDoc(appointmentDocRef, {
      status: 'cancelled',
      cancellationReason: reason,
    });
    console.log('Appointment cancelled successfully:', appointmentId);
    
    // Send notification
    await createCancellationNotification({
        doctorId: appointmentData.doctorId,
        patientName: appointmentData.patientName,
        appointmentDate: (appointmentData.date as Timestamp).toDate().toISOString(),
        cancellationReason: reason
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates an appointment's status to 'completed' in Firestore.
 * @param appointmentId The ID of the appointment to complete.
 * @returns An object indicating success or failure.
 */
export async function completeAppointment(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  if (!appointmentId) {
    return { success: false, error: 'Appointment ID is required.' };
  }

  try {
    const appointmentDocRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentDocRef, {
      status: 'completed',
    });
    console.log('Appointment marked as completed:', appointmentId);
    return { success: true };
  } catch (error) {
    console.error('Error completing appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
