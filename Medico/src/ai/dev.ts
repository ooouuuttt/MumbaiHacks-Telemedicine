
import { config } from 'dotenv';
config();

import '@/ai/flows/health-news-summaries.ts';
import '@/ai/flows/ai-symptom-checker.ts';
import '@/ai/flows/prescription-reader.ts';
import '@/ai/flows/summarize-consultation.ts';
import '@/ai/flows/voice-command-interpreter.ts';

