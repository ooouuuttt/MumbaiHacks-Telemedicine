'use server';
/**
 * @fileOverview A flow to create a notification when a new prescription is sent.
 *
 * - createPrescriptionNotification - Creates a notification document in Firestore for a new prescription.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {db} from '@/lib/firebase';
import {collection, addDoc, serverTimestamp} from 'firebase/firestore';
import type { CreatePrescriptionNotificationInput } from '@/ai/schemas';
import { CreatePrescriptionNotificationInputSchema } from '@/ai/schemas';


export async function createPrescriptionNotification(
  input: CreatePrescriptionNotificationInput
): Promise<{success: boolean; notificationId?: string}> {
  return createPrescriptionNotificationFlow(input);
}

const createPrescriptionNotificationFlow = ai.defineFlow(
  {
    name: 'createPrescriptionNotificationFlow',
    inputSchema: CreatePrescriptionNotificationInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      notificationId: z.string().optional(),
    }),
  },
  async input => {
    try {
      const notificationData = {
        doctorId: input.doctorId,
        title: 'Prescription Sent',
        message: `You have successfully sent a new prescription to ${input.patientName}.`,
        createdAt: serverTimestamp(),
        read: false,
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Prescription notification created with ID: ', docRef.id);
      return {success: true, notificationId: docRef.id};
    } catch (error) {
      console.error('Error creating prescription notification: ', error);
      return {success: false};
    }
  }
);
