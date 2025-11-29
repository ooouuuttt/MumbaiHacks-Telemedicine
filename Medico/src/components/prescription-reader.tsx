

'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ScanText, Upload, Activity, AlertTriangle, CheckCircle, MapPin, ShoppingCart, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { readPrescription, PrescriptionReaderOutput } from '@/ai/flows/prescription-reader';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tab, MedicalTabState } from './app-shell';
import { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { saveScannedPrescription } from '@/lib/prescription-service';
import { createNotification } from '@/lib/notification-service';
import { Pharmacy, getPharmaciesWithStock } from '@/lib/pharmacy-service';
import { formatDoctorName } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import ConfirmAddCalendarModal from './ConfirmAddCalendarModal';
import { buildEventsFromPrescription, getBrowserTimezone, ParsedPrescription } from '@/lib/calendarUtils';

interface PrescriptionReaderProps {
  user: User;
  setActiveTab: (tab: Tab, state?: MedicalTabState) => void;
}


const PrescriptionReader = ({ user, setActiveTab }: PrescriptionReaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<PrescriptionReaderOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingReminders, setIsCreatingReminders] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const { toast } = useToast();

     useEffect(() => {
        const fetchPharmacies = async () => {
            const data = await getPharmaciesWithStock();
            setPharmacies(data);
        };
        fetchPharmacies();
    }, []);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            setResult(null);
            setError(null);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
    });
    
    const handleAnalyze = async () => {
        if (!file || !preview) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const imageDataUri = preview;
            const res = await readPrescription({ imageDataUri });
            setResult(res);
        } catch (e) {
            console.error(e);
            setError('The AI service is currently busy. Please try again in a few moments.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCalendarReminders = async (medicines: any[]) => {
      if (!result || !user) return;
      
      setIsCreatingReminders(true);

      try {
                // Ensure we have a firebase user instance (use prop or fallback to auth.currentUser)
                const clientUser = user || auth.currentUser;
                if (!clientUser) {
                    toast({
                        variant: 'destructive',
                        title: 'Not Signed In',
                        description: 'Please sign in to use calendar reminders.',
                    });
                    setIsCreatingReminders(false);
                    return;
                }

                // Get a fresh Firebase ID token (force refresh to avoid expired tokens)
                let idToken: string;
                try {
                    idToken = await clientUser.getIdToken(true);
                } catch (tokenErr: any) {
                    console.error('Failed to get ID token (prescription-reader):', tokenErr);
                    // If token refresh fails, suggest re-authentication
                    toast({
                        variant: 'destructive',
                        title: 'Authentication Required',
                        description: 'Session expired — please sign out and sign in again.',
                    });
                    setIsCreatingReminders(false);
                    return;
                }

        // Build calendar events
        const prescription: ParsedPrescription = {
          ...result,
          medicines,
        };

        const timezone = getBrowserTimezone();
        const events = buildEventsFromPrescription(prescription, timezone);

        // Call backend to create events
        const response = await fetch('/api/calendar/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            events,
            prescriptionId: result.date, // Use date as simple ID or generate a proper one
          }),
        });

                // Parse JSON only when server returned JSON; otherwise capture text for debugging
                const contentType = response.headers.get('content-type') || '';
                let data: any = null;
                if (contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const txt = await response.text();
                    console.error('Non-JSON response from /api/calendar/create:', txt);
                    // Surface a friendly error to the user
                    toast({
                        variant: 'destructive',
                        title: 'Server Error',
                        description: 'Received unexpected response from server. Check console/network for details.',
                    });
                    setIsCreatingReminders(false);
                    return;
                }

                                if (response.status === 403 && data.needsReauth) {
          // User hasn't granted calendar access, redirect to consent
          toast({
            title: 'Calendar Access Required',
            description: 'Opening Google Calendar authorization...',
          });

          // Open OAuth in new window
          const oauthWindow = window.open(
            `/api/oauth/google?uid=${user.uid}`,
            'calendar-consent',
            'width=500,height=600'
          );

          // Show retry button
          toast({
            title: 'Grant Calendar Access',
            description: 'Please authorize calendar access in the new window, then click Retry.',
          });

          return;
        }

                // Handle unauthorized / expired ID token
                if (response.status === 401) {
                    // If backend signals the oauth refresh needs reauth (e.g. invalid_grant)
                    if (data?.needsReauth || data?.error === 'invalid_grant') {
                        toast({
                            title: 'Calendar Access Expired',
                            description: 'Opening Google Calendar authorization to re-consent...',
                        });
                        window.open(`/api/oauth/google?uid=${clientUser.uid}`, 'calendar-consent', 'width=500,height=600');
                        return;
                    }

                    // Otherwise it's an authentication error with the ID token
                    console.error('Server rejected ID token:', data);
                    toast({
                        variant: 'destructive',
                        title: 'Authentication Failed',
                        description: 'Your session may have expired. Please sign out and sign in again.',
                    });
                    return;
                }

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to create calendar events');
                }

        // Success!
        toast({
          title: 'Reminders Added',
          description: `${data.created.length} medicine reminders added to Google Calendar`,
        });

        setShowCalendarModal(false);
      } catch (error) {
        console.error('Calendar reminder error:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to Add Reminders',
          description: (error as Error)?.message || 'Could not create calendar events. Please try again.',
        });
      } finally {
        setIsCreatingReminders(false);
      }
    };

    const handleSavePrescription = async () => {
      if (!result) return;
      setIsSaving(true);
      try {
        await saveScannedPrescription(user.uid, result);
        
        await createNotification(user.uid, {
            title: 'Prescription Saved',
            description: `Scanned prescription from ${formatDoctorName(result.doctorName)} has been saved.`,
            type: 'medicine'
        });

        toast({
          title: "Prescription Saved",
          description: "The prescription has been added to your health records.",
        });
        setActiveTab('records');
      } catch (error) {
        console.error("Failed to save prescription:", error);
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: 'Could not save the prescription. Please try again.',
        });
      } finally {
        setIsSaving(false);
      }
    };


    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
        setIsLoading(false);
        setIsSaving(false);
    };

    const findPharmaciesForMedicine = (medicineName: string): Pharmacy[] => {
        if (!medicineName) return [];
        const medicineNameLower = medicineName.toLowerCase().trim();
        return pharmacies.filter(pharmacy => 
            pharmacy.stock?.some(med => 
                med.name.toLowerCase().trim().includes(medicineNameLower) && med.quantity > 0
            )
        );
    };
    
    const handleOrderClick = (pharmacy: Pharmacy, medicineName: string) => {
        setActiveTab('medical', { pharmacy, medicineName });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <ScanText className="mx-auto h-12 w-12 text-primary" />
                <h2 className="text-2xl font-bold font-headline">AI Prescription Reader</h2>
                <p className="text-muted-foreground">
                    Upload a photo of your prescription to digitize it.
                </p>
            </div>

            {!preview && (
                <Card {...getRootProps()} className="border-2 border-dashed rounded-xl text-center flex flex-col justify-center items-center h-48 cursor-pointer hover:border-primary/80 hover:bg-primary/5 transition-colors">
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 text-muted-foreground"/>
                    <p className="text-muted-foreground text-sm mt-2">{isDragActive ? 'Drop the image here...' : 'Drag & drop an image, or click to select'}</p>
                </Card>
            )}

            {preview && (
                 <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-4">
                        <img src={preview} alt="Prescription preview" className="rounded-lg max-h-64 w-full object-contain" />
                        <div className="flex gap-2 mt-4">
                             <Button onClick={handleAnalyze} disabled={isLoading || !!result} className="w-full">
                                {isLoading ? <><Activity className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : 'Analyze Prescription'}
                            </Button>
                            <Button onClick={handleReset} variant="outline" className="w-full">
                                Upload New
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="bg-destructive/10 border-destructive rounded-xl">
                    <CardContent className="p-4 text-center text-destructive font-medium flex items-center justify-center gap-2">
                       <AlertTriangle className='h-5 w-5' /> {error}
                    </CardContent>
                </Card>
            )}

            {result && (
                <Card className="rounded-xl animate-in fade-in duration-500">
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle className='flex items-center gap-2'><CheckCircle className='text-green-500' /> Analysis Complete</CardTitle>
                        <div className='flex gap-2'>
                             <Button onClick={() => setShowCalendarModal(true)} disabled={isCreatingReminders} variant="outline" size="sm">
                                Calendar
                            </Button>
                            <Button onClick={handleSavePrescription} disabled={isSaving} size="sm">
                                {isSaving ? <><Activity className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save</>}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <div><span className="font-semibold">Doctor:</span> {formatDoctorName(result.doctorName)}</div>
                            <div><span className="font-semibold">Date:</span> {result.date}</div>
                        </div>
                        <Separator />
                        <h4 className="font-semibold">Medicines</h4>
                        <div className='space-y-4'>
                        {result.medicines.map((med, index) => {
                            const availablePharmacies = findPharmaciesForMedicine(med.name);
                            return (
                                <div key={index} className="border p-3 rounded-lg text-sm">
                                    <div className='font-bold text-base capitalize mb-2'>{med.name}</div>
                                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                                        <div><Badge variant="secondary" className='w-full justify-center text-center'>{med.dosage}</Badge></div>
                                        <div><Badge variant="secondary" className='w-full justify-center text-center'>{med.frequency}</Badge></div>
                                        <div><Badge variant="secondary" className='w-full justify-center text-center'>{med.duration}</Badge></div>
                                    </div>
                                    {availablePharmacies.length > 0 && (
                                        <div className='mt-3 pt-3 border-t'>
                                             <h5 className='text-xs font-bold mb-2 text-primary'>Available at:</h5>
                                             <div className='space-y-2'>
                                                {availablePharmacies.map(p => (
                                                    <div key={p.id} className='flex items-center justify-between text-xs'>
                                                        <div className='flex items-center gap-2'>
                                                            <MapPin className='w-3 h-3' />
                                                            <div>
                                                                <span>{p.pharmacyName}</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOrderClick(p, med.name)}>
                                                            <ShoppingCart className="h-4 w-4 text-primary" />
                                                        </Button>
                                                    </div>
                                                ))}
                                             </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        </div>
                        <p className="text-xs text-muted-foreground/80 pt-4 border-t">
                            Disclaimer: This is an AI-generated analysis. Always verify with your doctor or pharmacist.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Calendar reminder modal */}
            <ConfirmAddCalendarModal
              isOpen={showCalendarModal}
              prescription={result}
              isLoading={isCreatingReminders}
              onConfirm={handleAddCalendarReminders}
              onCancel={() => setShowCalendarModal(false)}
            />
        </div>
    );
};

export default PrescriptionReader;




