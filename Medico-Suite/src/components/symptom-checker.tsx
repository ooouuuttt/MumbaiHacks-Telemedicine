
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Bot,
  AlertTriangle,
  ListChecks,
  Activity,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  aiSymptomChecker,
  type AiSymptomCheckerOutput,
} from '@/ai/flows/ai-symptom-checker';

const formSchema = z.object({
  symptoms: z
    .string()
    .min(
      10,
      'Please describe your symptoms in more detail for a better analysis.'
    )
    .max(500, 'Please limit your description to 500 characters.'),
});

const SymptomChecker = () => {
  const [result, setResult] = useState<AiSymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await aiSymptomChecker(values);
      setResult(res);
    } catch (e) {
      setError('The AI service is currently busy. Please try again in a few moments.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'destructive';
      case 'moderate':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <Bot className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-2xl font-bold font-headline">AI Symptom Checker</h2>
        <p className="text-muted-foreground">
          Describe your symptoms to get an AI-powered analysis.
        </p>
      </div>

      <Card className="shadow-sm rounded-xl">
        <CardContent className="p-4 md:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I have a fever, headache, and a sore throat for the last 2 days."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Check Symptoms
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-destructive/10 border-destructive rounded-xl">
          <CardContent className="p-4 text-center text-destructive font-medium flex items-center justify-center gap-2">
            <AlertTriangle className='h-5 w-5' /> {error}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="rounded-xl animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Urgency Level
              </h4>
              <Badge
                variant={getUrgencyBadge(result.urgencyLevel)}
                className="capitalize text-base px-3 py-1"
              >
                {result.urgencyLevel}
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Possible Conditions
              </h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {result.possibleConditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Recommendation
              </h4>
              <p className="text-muted-foreground">{result.recommendation}</p>
            </div>
            <p className="text-xs text-muted-foreground/80 pt-4 border-t">
              Disclaimer: This is an AI-generated analysis and not a substitute
              for professional medical advice.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SymptomChecker;
