
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SymptomSummarizer from './symptom-summarizer';
import { Button } from '@/components/ui/button';
import { FileText, HeartPulse, ClipboardList, MessageSquare, Video, Stethoscope, FlaskConical, Loader2 } from 'lucide-react';
import PrescriptionGenerator from './prescription-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import type { Patient } from '@/lib/types';
import { getPatientById } from '@/services/patientService';

function VitalsCard({ patient }: { patient: Patient }) {
    if (!patient.vitals) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><HeartPulse/> Vitals</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span>Blood Pressure</span> <span className="font-medium">{patient.vitals.bloodPressure}</span></div>
                <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span>Heart Rate</span> <span className="font-medium">{patient.vitals.heartRate}</span></div>
                <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span>Temperature</span> <span className="font-medium">{patient.vitals.temperature}</span></div>
                <div className="flex justify-between p-2 rounded-lg bg-muted/50"><span>Respiratory Rate</span> <span className="font-medium">{patient.vitals.respiratoryRate}</span></div>
            </CardContent>
        </Card>
    );
}

function LabReportsCard({ patient }: { patient: Patient }) {
    if (!patient.labReports || patient.labReports.length === 0) return (
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FlaskConical/> Lab Reports</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">No lab reports available.</p></CardContent>
        </Card>
    );
    return (
        <Card>
             <CardHeader><CardTitle className="flex items-center gap-2"><FlaskConical/> Lab Reports</CardTitle></CardHeader>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Report</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patient.labReports.map(report => (
                            <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.title}</TableCell>
                                <TableCell>{report.date}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm"><Link href={report.url} target="_blank">View</Link></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </CardContent>
        </Card>
    )
}

function PastPrescriptionsCard({ patient }: { patient: Patient }) {
     if (!patient.pastPrescriptions || patient.pastPrescriptions.length === 0) return (
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList/> Past Prescriptions</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">No past prescriptions found.</p></CardContent>
        </Card>
    );
    return (
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList/> Past Prescriptions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               {patient.pastPrescriptions.map(presc => (
                   <div key={presc.id} className="p-3 border rounded-lg">
                       <p className="font-semibold text-sm">Date: {presc.date}</p>
                       <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                           {presc.medications.map(med => <li key={med.name}>{med.name} ({med.dosage}) - {med.frequency}</li>)}
                       </ul>
                       <p className="text-xs text-muted-foreground mt-2">Notes: {presc.notes}</p>
                   </div>
               ))}
            </CardContent>
        </Card>
    )
}


export default function PatientDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [healthRecords, setHealthRecords] = useState('');

  useEffect(() => {
    async function fetchPatient() {
      if (id) {
        setIsLoading(true);
        const fetchedPatient = await getPatientById(id);
        if (fetchedPatient) {
          setPatient(fetchedPatient);
          setHealthRecords(fetchedPatient.healthRecords || '');
        }
        setIsLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    );
  }

  if (!patient) {
    notFound();
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={patient.avatar} alt={patient.name} data-ai-hint="person portrait" />
              <AvatarFallback className="text-3xl">{patient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-2xl">{patient.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="grid gap-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Age</span>
                    <span>{patient.age}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender</span>
                    <span>{patient.gender}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Visit</span>
                    <span>{patient.lastVisit}</span>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <Button className="w-full sm:flex-1" variant="outline"><MessageSquare className="mr-2 h-4 w-4"/> Chat</Button>
                <Button className="w-full sm:flex-1"><Video className="mr-2 h-4 w-4"/> Video Call</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Tabs defaultValue="consultation">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="consultation"><Stethoscope className="mr-2 h-4 w-4"/> Consultation</TabsTrigger>
                <TabsTrigger value="records"><FileText className="mr-2 h-4 w-4"/> Full Records</TabsTrigger>
            </TabsList>
            <TabsContent value="consultation" className="mt-4">
                <SymptomSummarizer 
                    healthRecords={healthRecords} 
                    onHealthRecordsChange={setHealthRecords}
                />
                <div className="mt-6">
                    <PrescriptionGenerator healthRecords={healthRecords} patientName={patient.name} />
                </div>
            </TabsContent>
            <TabsContent value="records" className="mt-4 space-y-6">
                <VitalsCard patient={patient}/>
                <LabReportsCard patient={patient}/>
                <PastPrescriptionsCard patient={patient}/>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
