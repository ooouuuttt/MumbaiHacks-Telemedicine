'use server';

/**
 * @fileOverview An AI-powered voice command interpreter.
 *
 * - interpretCommand - A function that takes transcribed voice input and determines the user's intent.
 * - InterpretCommandInput - The input type for the interpretCommand function.
 * - InterpretCommandOutput - The return type for the interpretCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretCommandInputSchema = z.object({
  command: z
    .string()
    .describe('The transcribed voice command from the user.'),
});
export type InterpretCommandInput = z.infer<typeof InterpretCommandInputSchema>;

const InterpretCommandOutputSchema = z.object({
  intent: z
    .enum(['home', 'symptoms', 'consult', 'records', 'medical', 'scan-prescription', 'appointments', 'prescriptions', 'chats', 'order-history', 'unknown'])
    .describe('The recognized intent of the command.'),
});
export type InterpretCommandOutput = z.infer<typeof InterpretCommandOutputSchema>;

export async function interpretCommand(input: InterpretCommandInput): Promise<InterpretCommandOutput> {
  return interpretCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretCommandPrompt',
  input: {schema: InterpretCommandInputSchema},
  output: {schema: InterpretCommandOutputSchema},
  prompt: `You are a voice command interpreter for a health application called Medico. Your task is to analyze the user's transcribed voice command and determine their intent.

The available intents are:
- 'home': Navigate to the main dashboard.
- 'symptoms': Open the AI Symptom Checker.
- 'consult': Book a consultation with a doctor.
- 'records': View health records.
- 'medical': Order medicines or find pharmacies.
- 'scan-prescription': Scan a physical prescription.
- 'appointments': View upcoming or past appointments.
- 'prescriptions': View electronic prescriptions.
- 'chats': View chats with doctors.
- 'order-history': View medicine order history.
- 'unknown': If the command is unclear or doesn't match any intent.

Analyze the following command and respond with the corresponding intent in JSON format. The command could be in English, Hindi, or Punjabi.

Command: "{{{command}}}"

Examples:
- "Doctor se baat karni hai" -> "consult"
- "I want to talk to a doctor" -> "consult"
- "Show my records" -> "records"
- "Mera record dikhao" -> "records"
- "Dawai order karni hai" -> "medical"
- "Check my symptoms" -> "symptoms"
- "Apni appointments dikhao" -> "appointments"
- "Prescription scan karna hai" -> "scan-prescription"
- "Go to home" -> "home"

`,
});

const interpretCommandFlow = ai.defineFlow(
  {
    name: 'interpretCommandFlow',
    inputSchema: InterpretCommandInputSchema,
    outputSchema: InterpretCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
