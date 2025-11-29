import { config } from 'dotenv';
config();

import '@/ai/flows/ai-summarize-patient-symptoms.ts';
import '@/ai/flows/ai-generate-prescription.ts';
import '@/ai/flows/ai-create-notification.ts';
import '@/ai/flows/ai-create-cancellation-notification.ts';
import '@/ai/flows/ai-create-message-notification.ts';
import '@/ai/flows/ai-create-prescription-notification.ts';