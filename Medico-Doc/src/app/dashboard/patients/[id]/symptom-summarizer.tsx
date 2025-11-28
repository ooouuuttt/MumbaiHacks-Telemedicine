
'use client';

import { useFormStatus } from 'react-dom';
import { getSummary, type FormState } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" /> Generate Summary
        </>
      )}
    </Button>
  );
}

export default function SymptomSummarizer({ 
  healthRecords,
  onHealthRecordsChange
}: { 
  healthRecords: string;
  onHealthRecordsChange: (value: string) => void;
}) {
  const [state, formAction] = useActionState(getSummary, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/> AI-Assisted Summary</CardTitle>
        <CardDescription>
          Use AI to generate a concise summary of the patient's symptoms and
          history from their health records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="grid gap-4">
          <Textarea
            name="healthRecords"
            value={healthRecords}
            onChange={(e) => onHealthRecordsChange(e.target.value)}
            rows={8}
            className="text-sm"
            placeholder="Enter patient health records here..."
          />
          <SubmitButton />
        </form>

        {state.summary && (
           <Alert className="mt-4 border-primary/50 text-primary">
             <Sparkles className="h-4 w-4 !text-primary" />
             <AlertTitle>AI Generated Summary</AlertTitle>
             <AlertDescription className="text-foreground">
               {state.summary}
             </AlertDescription>
           </Alert>
        )}
      </CardContent>
    </Card>
  );
}
