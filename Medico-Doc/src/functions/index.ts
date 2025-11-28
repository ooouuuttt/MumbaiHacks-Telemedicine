
'use server';

import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { createNotification } from '@/ai/flows/ai-create-notification';
import { createMessageNotification } from '@/ai/flows/ai-create-message-notification';

/**
 * A Firebase Function that triggers when an appointment document is written.
 * If a new appointment is created (status becomes 'upcoming'), it creates a notification for the doctor.
 */
export const onappointmentwritten = onDocumentWritten(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    // Check if it's a new appointment being booked
    // This is true if the document is newly created with status 'upcoming'
    // or if the status changes to 'upcoming'.
    if (afterData && afterData.status === 'upcoming' && beforeData?.status !== 'upcoming') {
      console.log(`New appointment detected: ${event.params.appointmentId}`);

      try {
        const result = await createNotification({
          doctorId: afterData.doctorId,
          patientName: afterData.patientName,
          appointmentDate: afterData.date.toDate().toISOString(),
        });

        if (result.success) {
          console.log(
            `Successfully created notification for appointment ${event.params.appointmentId}`
          );
        } else {
          console.error(
            `Failed to create notification for appointment ${event.params.appointmentId}`
          );
        }
      } catch (error) {
        console.error(
          `Error calling createNotification flow for appointment ${event.params.appointmentId}:`,
          error
        );
      }
    }
  }
);

/**
 * A Firebase Function that triggers when a new message is written in any chat.
 * If the message is from a patient, it creates a notification for the doctor.
 */
export const onmessagewritten = onDocumentWritten(
  'chats/{chatId}/messages/{messageId}',
  async (event) => {
    // Only trigger on create events (no before data)
    if (!event.data?.after.exists() || event.data.before.exists()) {
      return;
    }

    const messageData = event.data.after.data();
    const chatDocRef = event.data.after.ref.parent.parent;
    
    if (!chatDocRef) {
        console.error('Could not get parent chat document reference.');
        return;
    }

    const chatDoc = await chatDocRef.get();
    if (!chatDoc.exists) {
        console.error(`Chat document ${chatDocRef.id} not found.`);
        return;
    }
    const chatData = chatDoc.data();

    // Check if the message sender is NOT the doctor (i.e., it's the patient)
    if (messageData.senderId !== chatData.doctorId) {
      console.log(`New message from patient detected in chat: ${chatDocRef.id}`);

      try {
        const result = await createMessageNotification({
          doctorId: chatData.doctorId,
          patientName: chatData.patientName,
          messageText: messageData.text,
        });

        if (result.success) {
          console.log(
            `Successfully created notification for new message in chat ${chatDocRef.id}`
          );
        } else {
          console.error(
            `Failed to create notification for new message in chat ${chatDocRef.id}`
          );
        }
      } catch (error) {
        console.error(
          `Error calling createMessageNotification flow for chat ${chatDocRef.id}:`,
          error
        );
      }
    }
  }
);
