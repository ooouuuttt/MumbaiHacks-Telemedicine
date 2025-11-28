
'use server';
/**
 * @fileOverview An AI agent that generates a medical prescription based on patient symptoms.
 *
 * - generatePrescription - A function that handles the prescription generation process.
 * - GeneratePrescriptionInput - The input type for the generatePrescription function.
 * - GeneratePrescriptionOutput - The return type for the generatePrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicationSchema = z.object({
  name: z.string().describe('The name of the medication.'),
  dosage: z.string().describe('The prescribed dosage (e.g., "500mg").'),
  frequency: z.string().describe('How often to take the medication (e.g., "Twice a day").'),
  days: z.string().optional().describe('The number of days the medication should be taken.'),
});

const GeneratePrescriptionInputSchema = z.object({
  symptomsSummary: z
    .string()
    .describe('A summary of the patient\'s symptoms and health history.'),
});
export type GeneratePrescriptionInput = z.infer<
  typeof GeneratePrescriptionInputSchema
>;

const GeneratePrescriptionOutputSchema = z.object({
  medications: z.array(MedicationSchema).describe('A list of prescribed medications.'),
  instructions: z.string().describe('General instructions for the patient regarding the prescription.'),
  followUp: z.string().describe('Recommendations for a follow-up consultation.'),
});
export type GeneratePrescriptionOutput = z.infer<
  typeof GeneratePrescriptionOutputSchema
>;

export async function generatePrescription(
  input: GeneratePrescriptionInput
): Promise<GeneratePrescriptionOutput> {
  return generatePrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePrescriptionPrompt',
  input: {schema: GeneratePrescriptionInputSchema},
  output: {schema: GeneratePrescriptionOutputSchema},
  prompt: `You are a medical professional assisting a doctor. Based on the following summary of a patient's symptoms and health records, generate a standard medical prescription.

  Patient Summary:
  {{{symptomsSummary}}}

  Please provide a list of medications with their dosage, frequency, and duration in days. Also include general instructions for the patient, and a recommendation for a follow-up. Ensure the prescription is clear, concise, and follows standard medical practices. Do not add any disclaimers.`,
});

const generatePrescriptionFlow = ai.defineFlow(
  {
    name: 'generatePrescriptionFlow',
    inputSchema: GeneratePrescriptionInputSchema,
    outputSchema: GeneratePrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
