'use server';

/**
 * @fileOverview An AI-powered symptom checker.
 *
 * - aiSymptomChecker - A function that takes symptoms as input and returns possible conditions with an urgency level.
 * - AiSymptomCheckerInput - The input type for the aiSymptomChecker function.
 * - AiSymptomCheckerOutput - The return type for the aiSymptomChecker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSymptomCheckerInputSchema = z.object({
  symptoms: z
    .string()
    .describe('The symptoms entered by the patient, can be text or voice input.'),
});
export type AiSymptomCheckerInput = z.infer<typeof AiSymptomCheckerInputSchema>;

const AiSymptomCheckerOutputSchema = z.object({
  possibleConditions: z
    .array(z.string())
    .describe('Possible medical conditions based on the symptoms.'),
  urgencyLevel: z
    .enum(['mild', 'moderate', 'critical'])
    .describe('The urgency level of the condition.'),
  recommendation: z
    .string()
    .describe(
      'Recommendation on whether to self-care, visit a pharmacy, or consult a doctor immediately.'
    ),
});
export type AiSymptomCheckerOutput = z.infer<typeof AiSymptomCheckerOutputSchema>;

export async function aiSymptomChecker(input: AiSymptomCheckerInput): Promise<AiSymptomCheckerOutput> {
  return aiSymptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomCheckerPrompt',
  input: {schema: AiSymptomCheckerInputSchema},
  output: {schema: AiSymptomCheckerOutputSchema},
  prompt: `You are an AI-powered symptom checker that analyzes symptoms and suggests possible conditions with an urgency level and a recommendation.

Symptoms: {{{symptoms}}}

Respond in JSON format with the following keys:
- possibleConditions: An array of possible medical conditions based on the symptoms. If no specific conditions can be determined, return an empty array.
- urgencyLevel: The urgency level of the condition (mild, moderate, or critical).
- recommendation: Recommendation on whether to self-care, visit a pharmacy, or consult a doctor immediately.

Ensure the possibleConditions field is always an array of strings.`,
});

const aiSymptomCheckerFlow = ai.defineFlow(
  {
    name: 'aiSymptomCheckerFlow',
    inputSchema: AiSymptomCheckerInputSchema,
    outputSchema: AiSymptomCheckerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
