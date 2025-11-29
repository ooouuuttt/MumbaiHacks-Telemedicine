
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  FileText,
  Stethoscope,
  Calendar,
  Pill,
  Upload,
  HeartPulse,
  Droplets,
  Thermometer,
  Bot,
  Link as LinkIcon
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { consultations, documents } from '@/lib/dummy-data';
import { Button } from './ui/button';
import { useDropzone } from 'react-dropzone';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from './ui/chart';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { getUserProfile, UserProfile } from '@/lib/user-service';
import { Skeleton } from './ui/skeleton';
import { formatDoctorName } from '@/lib/utils';

interface HealthRecordsProps {
    user: User;
}

const HealthRecords = ({ user }: HealthRecordsProps) => {
  const [myFiles, setMyFiles] = useState<File[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setIsLoading(true);
      const profileData = await getUserProfile(user);
      setProfile(profileData);
      setIsLoading(false);
    };
    fetchProfile();
  }, [user]);

  const onDrop = (acceptedFiles: File[]) => {
    setMyFiles([...myFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
    },
  });

  const vitalsData = {
      heartRate: profile?.vitals?.heartRate ? [{ date: 'Now', value: parseInt(profile.vitals.heartRate) }] : [],
      bloodPressure: profile?.vitals?.bloodPressure ? [{ date: 'Now', systolic: parseInt(profile.vitals.bloodPressure.split('/')[0]), diastolic: parseInt(profile.vitals.bloodPressure.split('/')[1]) }] : [],
      temperature: profile?.vitals?.temperature ? [{ date: 'Now', value: parseFloat(profile.vitals.temperature) }] : [],
  };


  if (isLoading) {
      return <HealthRecordsSkeleton />;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline mb-4">Health Records</h2>
      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="consultations">Consults</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4 mt-4">
            <div className='grid grid-cols-2 gap-4'>
                <Card className="shadow-sm rounded-xl text-center">
                    <CardHeader className='pb-2'>
                        <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-2xl font-bold'>{profile?.vitals?.heartRate || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm rounded-xl text-center">
                    <CardHeader className='pb-2'>
                        <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-2xl font-bold'>{profile?.vitals?.bloodPressure || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm rounded-xl text-center">
                    <CardHeader className='pb-2'>
                        <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-2xl font-bold'>{profile?.vitals?.temperature || 'N/A'}</p>
                    </CardContent>
                </Card>
                 <Card className="shadow-sm rounded-xl text-center">
                    <CardHeader className='pb-2'>
                        <CardTitle className="text-sm font-medium">Respiratory Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-2xl font-bold'>{profile?.vitals?.respiratoryRate || 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4 mt-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
                {consultations.map((consultation) => (
                    <AccordionItem key={consultation.id} value={consultation.id} className="border-none">
                        <Card className="shadow-sm rounded-xl overflow-hidden">
                            <AccordionTrigger className="p-4 hover:no-underline">
                                <CardHeader className="p-0 text-left w-full">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Stethoscope className="text-primary" />
                                        <span>{consultation.specialty}</span>
                                    </CardTitle>
                                     <CardDescription className="flex items-center gap-2 pt-2 text-xs">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(consultation.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </CardDescription>
                                </CardHeader>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                <div className="text-sm space-y-4 pt-4 border-t">
                                     <p>
                                        <strong>Doctor:</strong> {formatDoctorName(consultation.doctor)}
                                    </p>
                                    {consultation.summary && (
                                        <div className="bg-primary/5 p-3 rounded-lg space-y-2 border border-primary/20">
                                            <h4 className="font-semibold flex items-center gap-2 text-primary"><Bot className="w-5 h-5"/> AI Summary</h4>
                                            <p className="text-muted-foreground text-xs leading-relaxed">{consultation.summary}</p>
                                        </div>
                                    )}
                                     <Button size="sm" variant="outline" className='w-full'>View Full Report</Button>
                                </div>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                ))}
            </Accordion>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4 mt-4">
          {(profile?.pastPrescriptions || []).map((prescription) => (
            <Card key={prescription.id} className="shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="text-primary" />
                  <span>Prescription from {formatDoctorName(prescription.doctorName)}</span>
                </CardTitle>
                <CardDescription className="pt-1">{new Date(prescription.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                 {prescription.medications.map((med, index) => (
                    <div key={index} className="border p-3 rounded-lg text-sm bg-background">
                        <p className="font-bold text-base capitalize">{med.name}</p>
                        <div className="grid grid-cols-3 gap-2 text-muted-foreground mt-2">
                            <div><Badge variant="outline" className='w-full justify-center text-center'>{med.dosage}</Badge></div>
                            <div><Badge variant="outline" className='w-full justify-center text-center'>{med.frequency}</Badge></div>
                             {med.days && <div><Badge variant="outline" className='w-full justify-center text-center'>{med.days} days</Badge></div>}
                        </div>
                        {med.notes && <p className="text-xs text-muted-foreground mt-2">Notes: {med.notes}</p>}
                    </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-4">
            <Card {...getRootProps()} className="border-2 border-dashed rounded-xl text-center flex flex-col justify-center items-center h-32 cursor-pointer hover:border-primary/80 hover:bg-primary/5 transition-colors">
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 text-muted-foreground"/>
                <p className="text-muted-foreground text-sm mt-2">{isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to upload'}</p>
            </Card>
            <div className="space-y-2">
                {[...(profile?.labReports || []), ...myFiles.map(f => ({id: f.name, title: f.name, url: '', date: new Date(f.lastModified).toLocaleDateString()}))].map((doc) => (
                    <Card key={doc.id} className="shadow-sm rounded-xl">
                        <CardContent className="p-3 flex items-center gap-3">
                            <div className="bg-secondary p-2 rounded-md">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{doc.title}</p>
                                <p className="text-xs text-muted-foreground">{doc.date}</p>
                            </div>
                            {doc.url ? (
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon"><LinkIcon className="h-4 w-4" /></Button>
                                </a>
                            ) : (
                                <Badge variant="outline">PDF</Badge>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const HealthRecordsSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-8 w-1/2" />
        <Card className="shadow-sm rounded-xl">
            <CardContent className="p-4 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    </div>
);


export default HealthRecords;
