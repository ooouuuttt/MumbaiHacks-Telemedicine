
'use server';

/**
 * @fileOverview An AI-powered consultation summarizer.
 *
 * - summarizeConsultation - A function that takes consultation details and returns a summary.
 * - SummarizeConsultationInput - The input type for the summarizeConsultation function.
 * - SummarizeConsultationOutput - The return type for the summarizeConsultation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeConsultationInputSchema = z.object({
  doctorName: z.string().describe('The name of the doctor.'),
  patientSymptoms: z.string().describe('The symptoms described by the patient.'),
  doctorNotes: z.string().describe('The notes taken by the doctor during the consultation.'),
});
export type SummarizeConsultationInput = z.infer<typeof SummarizeConsultationInputSchema>;

const SummarizeConsultationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the consultation for the patient.'),
});
export type SummarizeConsultationOutput = z.infer<typeof SummarizeConsultationOutputSchema>;

export async function summarizeConsultation(input: SummarizeConsultationInput): Promise<SummarizeConsultationOutput> {
  return summarizeConsultationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeConsultationPrompt',
  input: {schema: SummarizeConsultationInputSchema},
  output: {schema: SummarizeConsultationOutputSchema},
  prompt: `You are an AI assistant that creates patient-friendly summaries of medical consultations.
Based on the doctor's name, patient symptoms, and doctor's notes, generate a clear, concise summary.
Avoid overly technical jargon.

Doctor: {{{doctorName}}}
Patient Symptoms: {{{patientSymptoms}}}
Doctor's Notes: {{{doctorNotes}}}

Generate the summary.`,
});

const summarizeConsultationFlow = ai.defineFlow(
  {
    name: 'summarizeConsultationFlow',
    inputSchema: SummarizeConsultationInputSchema,
    outputSchema: SummarizeConsultationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
