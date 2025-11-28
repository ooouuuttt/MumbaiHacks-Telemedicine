/**
 * @fileOverview Centralized Zod schemas and TypeScript types for Genkit flows.
 */

import {z} from 'genkit';

// Schema for creating a new appointment notification
export const CreateNotificationInputSchema = z.object({
  doctorId: z.string().describe('The UID of the doctor to be notified.'),
  patientName: z.string().describe('The name of the patient who booked the appointment.'),
  appointmentDate: z.string().describe('The date and time of the appointment.'),
});
export type CreateNotificationInput = z.infer<
  typeof CreateNotificationInputSchema
>;

// Schema for creating a cancellation notification
export const CreateCancellationNotificationInputSchema = z.object({
  doctorId: z.string().describe('The UID of the doctor to be notified.'),
  patientName: z.string().describe('The name of the patient whose appointment was cancelled.'),
  appointmentDate: z.string().describe('The original date and time of the appointment.'),
  cancellationReason: z.string().describe('The reason for the cancellation.'),
});
export type CreateCancellationNotificationInput = z.infer<
  typeof CreateCancellationNotificationInputSchema
>;

// Schema for creating a new message notification
export const CreateMessageNotificationInputSchema = z.object({
  doctorId: z.string().describe('The UID of the doctor to be notified.'),
  patientName: z.string().describe('The name of the patient who sent the message.'),
  messageText: z.string().describe('A short snippet of the message text.'),
});
export type CreateMessageNotificationInput = z.infer<
  typeof CreateMessageNotificationInputSchema
>;

// Schema for creating a new prescription notification
export const CreatePrescriptionNotificationInputSchema = z.object({
  doctorId: z.string().describe('The UID of the doctor to be notified.'),
  patientName: z.string().describe('The name of the patient for whom the prescription was created.'),
});
export type CreatePrescriptionNotificationInput = z.infer<
  typeof CreatePrescriptionNotificationInputSchema
>;
