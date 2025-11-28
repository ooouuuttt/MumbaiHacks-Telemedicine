'use server';
/**
 * @fileOverview A flow to create a notification when a new message is received.
 *
 * - createMessageNotification - Creates a notification document in Firestore for a new message.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {db} from '@/lib/firebase';
import {collection, addDoc, serverTimestamp} from 'firebase/firestore';
import type { CreateMessageNotificationInput } from '@/ai/schemas';
import { CreateMessageNotificationInputSchema } from '@/ai/schemas';


export async function createMessageNotification(
  input: CreateMessageNotificationInput
): Promise<{success: boolean; notificationId?: string}> {
  return createMessageNotificationFlow(input);
}

const createMessageNotificationFlow = ai.defineFlow(
  {
    name: 'createMessageNotificationFlow',
    inputSchema: CreateMessageNotificationInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      notificationId: z.string().optional(),
    }),
  },
  async input => {
    try {
      const notificationData = {
        doctorId: input.doctorId,
        title: 'New Message Received',
        message: `You have a new message from ${input.patientName}: "${input.messageText.substring(0, 50)}..."`,
        createdAt: serverTimestamp(),
        read: false,
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Message notification created with ID: ', docRef.id);
      return {success: true, notificationId: docRef.id};
    } catch (error) {
      console.error('Error creating message notification: ', error);
      return {success: false};
    }
  }
);
