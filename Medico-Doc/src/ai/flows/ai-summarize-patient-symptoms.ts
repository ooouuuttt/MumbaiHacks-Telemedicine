'use server';
/**
 * @fileOverview An AI agent that summarizes patient symptoms from their health records.
 *
 * - summarizePatientSymptoms - A function that handles the summarization process.
 * - SummarizePatientSymptomsInput - The input type for the summarizePatientSymptoms function.
 * - SummarizePatientSymptomsOutput - The return type for the summarizePatientSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePatientSymptomsInputSchema = z.object({
  healthRecords: z
    .string()
    .describe('The patient health records, including symptoms and history.'),
});
export type SummarizePatientSymptomsInput = z.infer<
  typeof SummarizePatientSymptomsInputSchema
>;

const SummarizePatientSymptomsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the patient symptoms and health history.'),
});
export type SummarizePatientSymptomsOutput = z.infer<
  typeof SummarizePatientSymptomsOutputSchema
>;

export async function summarizePatientSymptoms(
  input: SummarizePatientSymptomsInput
): Promise<SummarizePatientSymptomsOutput> {
  return summarizePatientSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePatientSymptomsPrompt',
  input: {schema: SummarizePatientSymptomsInputSchema},
  output: {schema: SummarizePatientSymptomsOutputSchema},
  prompt: `You are an AI assistant helping doctors quickly understand patient conditions.

  Summarize the following patient health records, focusing on symptoms and relevant medical history:
  \n
  {{{healthRecords}}}
  \n
  Provide a concise and informative summary that will help the doctor prepare for the consultation.`,
});

const summarizePatientSymptomsFlow = ai.defineFlow(
  {
    name: 'summarizePatientSymptomsFlow',
    inputSchema: SummarizePatientSymptomsInputSchema,
    outputSchema: SummarizePatientSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
