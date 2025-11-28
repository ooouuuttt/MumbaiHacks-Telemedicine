
'use server';

import { generatePrescription, type GeneratePrescriptionOutput } from '@/ai/flows/ai-generate-prescription';
import { summarizePatientSymptoms } from '@/ai/flows/ai-summarize-patient-symptoms';
import { savePrescription as savePrescriptionToDb } from '@/services/prescriptionService';
import { createPrescriptionNotification } from '@/ai/flows/ai-create-prescription-notification';
import { z } from 'zod';

const generateSchema = z.object({
  healthRecords: z.string().min(10, { message: 'Health records must be at least 10 characters long to generate a prescription.' }),
});

export type PrescriptionGenerationState = {
  message: string;
  prescription?: GeneratePrescriptionOutput;
}

export async function createPrescription(prevState: PrescriptionGenerationState, formData: FormData): Promise<PrescriptionGenerationState> {
  const validatedFields = generateSchema.safeParse({
    healthRecords: formData.get('healthRecords'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.healthRecords?.[0] || 'Invalid input.',
    };
  }

  try {
    // Artificial delay to show pending state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 1. First, summarize the symptoms
    const summaryResult = await summarizePatientSymptoms({ healthRecords: validatedFields.data.healthRecords });
    
    if (!summaryResult.summary) {
        return { message: 'Could not generate a symptom summary.' };
    }

    // 2. Then, generate the prescription using the summary
    const prescriptionResult = await generatePrescription({ symptomsSummary: summaryResult.summary });
    
    return {
      message: 'success',
      prescription: prescriptionResult,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An unexpected error occurred while generating the prescription. Please try again.',
    };
  }
}


// --- Save Prescription Action ---

const PrescriptionDataSchema = z.object({
    medications: z.array(z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        days: z.string().optional(),
    })),
    instructions: z.string(),
    followUp: z.string(),
});

const saveSchema = z.object({
  patientId: z.string().min(1, { message: 'Patient ID is required.' }),
  patientName: z.string().min(1, { message: 'Patient Name is required.' }),
  doctorId: z.string().min(1, { message: 'Doctor ID is required.' }),
  doctorName: z.string().min(1, { message: 'Doctor Name is required.' }),
  prescriptionData: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      const validation = PrescriptionDataSchema.safeParse(parsed);
      if (!validation.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid prescription data structure.' });
        return z.NEVER;
      }
      return validation.data;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid JSON for prescription data.' });
      return z.NEVER;
    }
  }),
});

export type PrescriptionSaveState = {
  message: string;
  success: boolean;
  prescriptionId?: string;
}

export async function savePrescription(prevState: PrescriptionSaveState, formData: FormData): Promise<PrescriptionSaveState> {
  const validatedFields = saveSchema.safeParse({
    patientId: formData.get('patientId'),
    patientName: formData.get('patientName'),
    doctorId: formData.get('doctorId'),
    doctorName: formData.get('doctorName'),
    prescriptionData: formData.get('prescriptionData'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const errorMessage = Object.values(fieldErrors).flat()[0] || 'Invalid input.';
    return {
      message: errorMessage,
      success: false,
    };
  }

  try {
    const { patientId, patientName, doctorId, doctorName, prescriptionData } = validatedFields.data;
    
    const result = await savePrescriptionToDb({
        patientId,
        patientName,
        doctorId,
        doctorName,
        ...prescriptionData
    });
    
    if (result.success && result.prescriptionId) {
        // Send notification after successful save
        await createPrescriptionNotification({
            doctorId: doctorId,
            patientName: patientName,
        });

        return {
          message: 'Prescription saved successfully.',
          success: true,
          prescriptionId: result.prescriptionId,
        };
    } else {
        return {
          message: result.error || 'An unknown error occurred while saving.',
          success: false,
        };
    }
  } catch (error) {
    console.error('Error saving prescription: ', error);
    return {
      message: 'A server error occurred. Please try again.',
      success: false,
    };
  }
}
