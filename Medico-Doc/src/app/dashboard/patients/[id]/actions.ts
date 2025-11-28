'use server';

import { summarizePatientSymptoms } from '@/ai/flows/ai-summarize-patient-symptoms';
import { z } from 'zod';

const schema = z.object({
  healthRecords: z.string().min(10, { message: 'Health records must be at least 10 characters long.' }),
});

export type FormState = {
  message: string;
  summary?: string;
}

export async function getSummary(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = schema.safeParse({
    healthRecords: formData.get('healthRecords'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid health records.',
    };
  }

  try {
    // Artificial delay to show pending state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await summarizePatientSymptoms({ healthRecords: validatedFields.data.healthRecords });
    return {
      message: 'success',
      summary: result.summary,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate summary. Please try again.',
    };
  }
}
