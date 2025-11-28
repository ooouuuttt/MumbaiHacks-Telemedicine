'use server';
/**
 * @fileOverview A flow to create a notification when an appointment is cancelled.
 *
 * - createCancellationNotification - Creates a notification document in Firestore for a cancelled appointment.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {db} from '@/lib/firebase';
import {collection, addDoc, serverTimestamp} from 'firebase/firestore';
import type { CreateCancellationNotificationInput } from '@/ai/schemas';
import { CreateCancellationNotificationInputSchema } from '@/ai/schemas';

export async function createCancellationNotification(
  input: CreateCancellationNotificationInput
): Promise<{success: boolean; notificationId?: string}> {
  return createCancellationNotificationFlow(input);
}

const createCancellationNotificationFlow = ai.defineFlow(
  {
    name: 'createCancellationNotificationFlow',
    inputSchema: CreateCancellationNotificationInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      notificationId: z.string().optional(),
    }),
  },
  async input => {
    try {
      const notificationData = {
        doctorId: input.doctorId,
        title: 'Appointment Cancelled',
        message: `Your appointment with ${input.patientName} on ${new Date(
          input.appointmentDate
        ).toLocaleString()} was cancelled. Reason: ${input.cancellationReason}`,
        createdAt: serverTimestamp(),
        read: false,
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Cancellation notification created with ID: ', docRef.id);
      return {success: true, notificationId: docRef.id};
    } catch (error) {
      console.error('Error creating cancellation notification: ', error);
      return {success: false};
    }
  }
);
