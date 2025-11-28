'use server';
/**
 * @fileOverview A flow to create a notification when an appointment is booked.
 *
 * - createNotification - Creates a notification document in Firestore.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {db} from '@/lib/firebase';
import {collection, addDoc, serverTimestamp} from 'firebase/firestore';
import type { CreateNotificationInput } from '@/ai/schemas';
import { CreateNotificationInputSchema } from '@/ai/schemas';


export async function createNotification(
  input: CreateNotificationInput
): Promise<{success: boolean; notificationId?: string}> {
  return createNotificationFlow(input);
}

const createNotificationFlow = ai.defineFlow(
  {
    name: 'createNotificationFlow',
    inputSchema: CreateNotificationInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      notificationId: z.string().optional(),
    }),
  },
  async input => {
    try {
      const notificationData = {
        doctorId: input.doctorId,
        title: 'New Appointment Booked',
        message: `${input.patientName} has booked a new appointment for ${new Date(
          input.appointmentDate
        ).toLocaleString()}.`,
        createdAt: serverTimestamp(),
        read: false,
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Notification created with ID: ', docRef.id);
      return {success: true, notificationId: docRef.id};
    } catch (error) {
      console.error('Error creating notification: ', error);
      return {success: false};
    }
  }
);
