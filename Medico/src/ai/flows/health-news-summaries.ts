'use server';

/**
 * @fileOverview A health news summarization AI agent.
 *
 * - getHealthNewsSummary - A function that generates a summary of the latest health news.
 * - HealthNewsSummaryInput - The input type for the getHealthNewsSummary function.
 * - HealthNewsSummaryOutput - The return type for the getHealthNewsSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HealthNewsSummaryInputSchema = z.object({
  query: z
    .string()
    .default('latest health news')
    .describe('The query to use to search for health news.'),
});
export type HealthNewsSummaryInput = z.infer<typeof HealthNewsSummaryInputSchema>;

const HealthNewsSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the latest health news.'),
});
export type HealthNewsSummaryOutput = z.infer<typeof HealthNewsSummaryOutputSchema>;

export async function getHealthNewsSummary(input: HealthNewsSummaryInput): Promise<HealthNewsSummaryOutput> {
  return healthNewsSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'healthNewsSummaryPrompt',
  input: {schema: HealthNewsSummaryInputSchema},
  output: {schema: HealthNewsSummaryOutputSchema},
  prompt: `You are an AI assistant that summarizes health news.

  Summarize the latest health news based on the following query: {{{query}}}`,
});

const healthNewsSummaryFlow = ai.defineFlow(
  {
    name: 'healthNewsSummaryFlow',
    inputSchema: HealthNewsSummaryInputSchema,
    outputSchema: HealthNewsSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
