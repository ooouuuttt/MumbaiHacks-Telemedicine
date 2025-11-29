
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getPrescriptions, Prescription } from '@/lib/prescription-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { FileText, Clock, Download, ShoppingCart, Send, Search } from 'lucide-react';
import { Button } from './ui/button';
import jsPDF from 'jspdf';
import type { Tab } from './app-shell';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { Separator } from './ui/separator';
import { Medication } from '@/lib/user-service';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { formatDoctorName } from '@/lib/utils';

interface PrescriptionsProps {
  user: User;
  setActiveTab: (tab: Tab, state?: any) => void;
}

const Prescriptions = ({ user, setActiveTab }: PrescriptionsProps) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedMedicines, setSelectedMedicines] = useState<Medication[]>([]);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = getPrescriptions(user.uid, (data) => {
      setPrescriptions(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (selectedPrescription) {
      setSelectedMedicines(selectedPrescription.medications);
    } else {
      setSelectedMedicines([]);
    }
  }, [selectedPrescription]);
  
  const handleDownload = (prescription: Prescription) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Medico Prescription', 10, 20);

    doc.setFontSize(14);
    doc.text(`Doctor: ${formatDoctorName(prescription.doctorName)}`, 10, 40);
    doc.text(`Patient: ${prescription.patientName}`, 10, 50);
    const formattedDate = new Date(prescription.createdAt.toDate()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Date: ${formattedDate}`, 10, 60);
    
    doc.setFontSize(16);
    doc.text('Medications', 10, 80);
    
    let yPos = 90;
    prescription.medications.forEach((med, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${med.name} (${med.dosage})`, 15, yPos);
      doc.setFontSize(10);
      doc.text(`  - Frequency: ${med.frequency}`, 15, yPos + 7);
      if(med.days) {
          doc.text(`  - Duration: ${med.days} days`, 15, yPos + 14);
          yPos += 21;
      } else {
          yPos += 14;
      }
      if(yPos > 280) { // New page if content overflows
          doc.addPage();
          yPos = 20;
      }
    });

    if(prescription.instructions) {
        doc.setFontSize(12);
        doc.text('Instructions:', 10, yPos + 10);
        doc.setFontSize(10);
        doc.text(prescription.instructions, 15, yPos + 17);
        yPos += 24;
    }

    if(prescription.followUp) {
        doc.setFontSize(12);
        doc.text(`Follow-up: ${prescription.followUp}`, 10, yPos + 10);
    }

    doc.save(`prescription-${prescription.id}.pdf`);
  }

  const handleOrder = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsOrderDialogOpen(true);
  };
  
  const handleFindPharmacies = () => {
    if (!selectedPrescription || selectedMedicines.length === 0) return;
    
    const medicineNames = selectedMedicines.map(med => med.name);
    
    // Create a new prescription object containing only the selected medicines
    const prescriptionForBill: Prescription = {
        ...selectedPrescription,
        medications: selectedMedicines,
    };

    setActiveTab('medical', { 
        medicinesToFind: medicineNames,
        prescriptionToBill: prescriptionForBill,
    });
    setIsOrderDialogOpen(false);
  }

  const handleSendToPharmacy = () => {
    if (!selectedPrescription || selectedMedicines.length === 0) return;
    setActiveTab('medical', { 
        prescriptionToSend: {
            doctorName: selectedPrescription.doctorName,
            date: new Date(selectedPrescription.createdAt.toDate()).toLocaleDateString(),
            medications: selectedMedicines,
        }
    });
    setIsOrderDialogOpen(false);
  }

  const handleMedicineSelection = (medicine: Medication, isChecked: boolean) => {
    if (isChecked) {
      setSelectedMedicines(prev => [...prev, medicine]);
    } else {
      setSelectedMedicines(prev => prev.filter(m => m.name !== medicine.name));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
        setSelectedMedicines(selectedPrescription?.medications || []);
    } else {
        setSelectedMedicines([]);
    }
  }

  const calculateQuantity = (med: Medication): number | null => {
    if (!med.frequency || !med.days) return null;

    let freqMultiplier = 0;
    const freqLower = med.frequency.toLowerCase();
    if (freqLower.includes('once')) {
        freqMultiplier = 1;
    } else if (freqLower.includes('twice')) {
        freqMultiplier = 2;
    } else if (freqLower.includes('thrice')) {
        freqMultiplier = 3;
    } else {
        const match = freqLower.match(/(\d+)\s+time/);
        if (match) {
            freqMultiplier = parseInt(match[1], 10);
        }
    }

    const numDays = parseInt(med.days, 10);

    if (freqMultiplier > 0 && !isNaN(numDays)) {
        return freqMultiplier * numDays;
    }

    return null;
  };


  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }
  
  if (prescriptions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold font-headline">No Prescriptions Found</h2>
            <p className="text-muted-foreground">
                Your e-prescriptions from doctors will appear here.
            </p>
        </div>
      )
  }

  const allSelected = selectedPrescription ? selectedMedicines.length === selectedPrescription.medications.length : false;


  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold font-headline">Your Prescriptions</h2>
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} className="shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{formatDoctorName(prescription.doctorName)}</CardTitle>
                  <CardDescription className="pt-1">
                    {new Date(prescription.createdAt.toDate()).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardDescription>
                </div>
                 <Badge variant='default' className="capitalize">
                  E-Prescription
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {prescription.medications.map((med, index) => (
                <div key={index} className="border p-3 rounded-lg text-sm bg-background">
                  <p className="font-bold text-base capitalize">{med.name}</p>
                  <div className="flex flex-wrap gap-2 text-muted-foreground mt-2">
                      {med.dosage && <div><Badge variant="outline">{med.dosage}</Badge></div>}
                      {med.frequency && <div><Badge variant="outline">{med.frequency}</Badge></div>}
                      {med.days && <div><Badge variant="outline">{med.days} days</Badge></div>}
                  </div>
                   {med.notes && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">Notes: {med.notes}</p>}
                </div>
              ))}
            </CardContent>
            {(prescription.followUp || prescription.instructions) && (
               <CardFooter className='flex-col items-start gap-2 pt-4 border-t'>
                  {prescription.instructions && <p className='text-sm text-muted-foreground'>**Instructions:** {prescription.instructions}</p>}
                  {prescription.followUp && <p className='text-sm font-semibold flex items-center gap-2'><Clock className='w-4 h-4 text-primary' /> {prescription.followUp}</p>}
              </CardFooter>
            )}
            <CardFooter className='gap-2 pt-4 border-t'>
                <Button variant='outline' className='w-full' onClick={() => handleDownload(prescription)}>
                    <Download className='mr-2 h-4 w-4'/>
                    Download
                </Button>
                <Button className='w-full' onClick={() => handleOrder(prescription)}>
                    <ShoppingCart className='mr-2 h-4 w-4'/>
                    Order Medicines
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

       <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Order Prescription</DialogTitle>
                    <DialogDescription>
                        Select medicines to order from {selectedPrescription ? formatDoctorName(selectedPrescription.doctorName) : ''}'s prescription.
                    </DialogDescription>
                </DialogHeader>
                <div className='py-4 space-y-3'>
                    <div className="flex items-center space-x-2 pb-2 border-b">
                        <Checkbox id="select-all" checked={allSelected} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} />
                        <Label htmlFor="select-all" className='font-semibold'>Select All</Label>
                    </div>
                    {selectedPrescription?.medications.map(m => {
                        const quantity = calculateQuantity(m);
                        return (
                          <div key={m.name} className="flex items-center space-x-3">
                              <Checkbox 
                                  id={m.name} 
                                  checked={selectedMedicines.some(sm => sm.name === m.name)}
                                  onCheckedChange={(checked) => handleMedicineSelection(m, Boolean(checked))}
                              />
                              <Label htmlFor={m.name} className='capitalize text-sm font-normal flex-grow'>
                                  {m.name}
                              </Label>
                              {quantity !== null && (
                                <Badge variant="secondary" className="font-mono">Qty: {quantity}</Badge>
                              )}
                          </div>
                        )
                    })}
                </div>
                <Separator />
                <div className='py-4 space-y-4'>
                    <Button variant="outline" className='w-full justify-start h-auto py-3' onClick={handleFindPharmacies} disabled={selectedMedicines.length === 0}>
                         <Search className="mr-4 h-5 w-5 text-primary" />
                         <div>
                            <p className='font-semibold'>Find Pharmacies for Selected</p>
                            <p className='text-xs text-muted-foreground text-left'>Search for pharmacies that stock all selected items.</p>
                         </div>
                    </Button>
                     <Button variant="outline" className='w-full justify-start h-auto py-3' onClick={handleSendToPharmacy} disabled={selectedMedicines.length === 0}>
                         <Send className="mr-4 h-5 w-5 text-primary" />
                         <div>
                            <p className='font-semibold'>Send Selected to Pharmacy</p>
                            <p className='text-xs text-muted-foreground text-left'>Let a pharmacy prepare your order for you.</p>
                         </div>
                    </Button>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </>
  );
};

export default Prescriptions;


    
