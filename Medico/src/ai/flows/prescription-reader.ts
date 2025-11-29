'use server';

/**
 * @fileOverview An AI-powered prescription reader.
 * 
 * - readPrescription - A function that analyzes a prescription image and returns the details.
 * - PrescriptionReaderInput - The input type for the readPrescription function.
 * - PrescriptionReaderOutput - The return type for the readPrescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PrescriptionReaderInputSchema = z.object({
    imageDataUri: z.string().describe("A photo of a prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type PrescriptionReaderInput = z.infer<typeof PrescriptionReaderInputSchema>;

const MedicineSchema = z.object({
    name: z.string().describe('The name of the medicine.'),
    dosage: z.string().describe('The dosage of the medicine (e.g., 500mg).'),
    frequency: z.string().describe('How often to take the medicine (e.g., Twice a day).'),
    duration: z.string().describe('How long to take the medicine for (e.g., 7 days).'),
});

const PrescriptionReaderOutputSchema = z.object({
    medicines: z.array(MedicineSchema).describe('A list of medicines found in the prescription.'),
    doctorName: z.string().describe('The name of the doctor who wrote the prescription.'),
    date: z.string().describe('The date the prescription was written.'),
});
export type PrescriptionReaderOutput = z.infer<typeof PrescriptionReaderOutputSchema>;

export async function readPrescription(input: PrescriptionReaderInput): Promise<PrescriptionReaderOutput> {
  return prescriptionReaderFlow(input);
}

const prompt = ai.definePrompt({
    name: 'prescriptionReaderPrompt',
    input: { schema: PrescriptionReaderInputSchema },
    output: { schema: PrescriptionReaderOutputSchema },
    prompt: `You are an AI assistant that reads and digitizes medical prescriptions from an image. Analyze the provided image and extract the following information: doctor's name, date of prescription, and a list of all medicines with their name, dosage, frequency, and duration.

Respond in a structured JSON format.

Image: {{media url=imageDataUri}}`
});

const prescriptionReaderFlow = ai.defineFlow(
    {
        name: 'prescriptionReaderFlow',
        inputSchema: PrescriptionReaderInputSchema,
        outputSchema: PrescriptionReaderOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
