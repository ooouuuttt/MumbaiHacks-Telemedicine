

'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, ShoppingCart, ArrowLeft, CheckCircle2, Minus, Plus, Building, ChevronDown, CheckCircle, XCircle, Send, FileText, Clock, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getPharmaciesWithStock, Pharmacy, Medicine } from '@/lib/pharmacy-service';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from './ui/card';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MedicalTabState, Tab } from './app-shell';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Prescription } from '@/lib/prescription-service';
import { Medication, getPatientName } from '@/lib/user-service';
import { Skeleton } from './ui/skeleton';
import { User } from 'firebase/auth';
import { createOrder, OrderItem } from '@/lib/order-service';
import { sendPrescription } from '@/lib/prescribed-service';

type View = 'list' | 'pharmacy' | 'payment' | 'confirmation' | 'send-prescription' | 'send-confirmation';
export type CartItem = { medicine: Medicine; pharmacy: Pharmacy; quantity: number };

interface MedicineAvailabilityProps {
  initialState?: MedicalTabState;
  setActiveTab: (tab: Tab, state?: MedicalTabState) => void;
  user: User;
}

const MedicineAvailability = ({ initialState, setActiveTab, user }: MedicineAvailabilityProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<View>('list');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [billQuantities, setBillQuantities] = useState<{[key: string]: number}>({});
  const [maxBillQuantities, setMaxBillQuantities] = useState<{[key: string]: number}>({});

  const medicinesToFind = initialState?.medicinesToFind;
  const prescriptionToBill = initialState?.prescriptionToBill;
  const prescriptionToSend = initialState?.prescriptionToSend;

  useEffect(() => {
    const fetchPharmacies = async () => {
        setIsLoading(true);
        const data = await getPharmaciesWithStock();
        setAllPharmacies(data);
        setFilteredPharmacies(data);
        setIsLoading(false);
    };
    fetchPharmacies();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (medicinesToFind && medicinesToFind.length > 0) {
      setSearchTerm(medicinesToFind.join(', '));
      
      const sortedPharmacies = [...allPharmacies]
        .map(pharmacy => {
          const matchCount = medicinesToFind.reduce((count, medName) => {
            const hasMed = (pharmacy.stock || []).some(
              (m) => m.name.toLowerCase().includes(medName.toLowerCase()) && m.quantity > 0
            );
            return count + (hasMed ? 1 : 0);
          }, 0);
          return { ...pharmacy, matchCount };
        })
        .filter(p => p.matchCount > 0) // Only show pharmacies that have at least one medicine
        .sort((a, b) => b.matchCount - a.matchCount);

      setFilteredPharmacies(sortedPharmacies);
    } else if (prescriptionToSend) {
        setView('send-prescription');
    } else if (initialState?.pharmacy && initialState?.medicineName) {
      const pharmacy = allPharmacies.find(p => p.id === initialState.pharmacy?.id);
      if (pharmacy) {
        const medicineInfo = (pharmacy.stock || []).find(m => m.name.toLowerCase().includes(initialState.medicineName!.toLowerCase()));
        if (medicineInfo) {
            handleSelectPharmacy(pharmacy);
            handleSelectMedicine(medicineInfo);
        }
      }
    } else {
        const f = searchTerm
        ? allPharmacies.filter((pharmacy) =>
            (pharmacy.stock || []).some(
              (med) => med.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        : allPharmacies;
        setFilteredPharmacies(f);
    }
  }, [initialState, searchTerm, allPharmacies, isLoading, prescriptionToSend, medicinesToFind]);

  const handleSelectPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setSelectedMedicine(null);
    setSearchTerm('');
    setView('pharmacy');
  };
  
  const handleSelectPharmacyForSending = async (pharmacy: Pharmacy) => {
    const prescriptionData = prescriptionToSend || prescriptionToBill;
    if (!prescriptionData) {
        toast({ variant: "destructive", title: "Send Failed", description: "No prescription data found."});
        return;
    }

    try {
        const patientName = await getPatientName(user.uid) || user.displayName || 'Anonymous';
        const prescriptionDetails = {
            patientName: patientName,
            doctorName: prescriptionData.doctorName,
            medicines: prescriptionData.medications
        };
        await sendPrescription(pharmacy.id, prescriptionDetails);
        setSelectedPharmacy(pharmacy);
        setView('send-confirmation');
    } catch (error) {
        console.error("Error sending prescription:", error);
        toast({
            variant: "destructive",
            title: "Send Failed",
            description: "Could not send the prescription. Please try again.",
        });
    }
  };

  const handleSelectMedicine = (medicine: Medicine) => {
    // Find the best version of this medicine in stock (one with quantity > 0)
    const inStockVersion = selectedPharmacy?.stock?.find(m => 
        m.name === medicine.name && 
        m.manufacturer === medicine.manufacturer && 
        m.price === medicine.price &&
        m.quantity > 0
    ) || medicine; // fallback to the selected one if none are in stock
    setSelectedMedicine(inStockVersion);
  }

  const handleOrder = (medicine: Medicine) => {
    if (!selectedPharmacy) return;
    const inStockVersion = selectedPharmacy?.stock?.find(m => 
        m.name === medicine.name && 
        m.manufacturer === medicine.manufacturer && 
        m.price === medicine.price &&
        m.quantity > 0
    ) || medicine;

    if (inStockVersion.quantity === 0) {
        toast({
            variant: "destructive",
            title: "Out of Stock",
            description: "This medicine is currently out of stock.",
        });
        return;
    }
    
    setCartItem({ pharmacy: selectedPharmacy, medicine: inStockVersion, quantity: 1 });
    setView('payment');
  }

  const handlePayment = async () => {
    if (!cartItem) return;

    // Open Razorpay payment link
    const paymentUrl = 'https://razorpay.me/@amitlaxmanmohan';
    window.open(paymentUrl, '_blank');
    
    try {
      const items: OrderItem[] = [{
        medicineId: cartItem.medicine.id,
        name: cartItem.medicine.name,
        quantity: cartItem.quantity
      }];
      const total = cartItem.medicine.price * cartItem.quantity;
      const customerName = await getPatientName(user.uid) || user.displayName || 'Anonymous';
      await createOrder(user.uid, customerName, cartItem.pharmacy, items, total, 'single_med');
      setView('confirmation');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: 'Could not place your order. Please try again.',
      });
    }
  };

  const handleReset = () => {
    setView('list');
    setSearchTerm('');
    setCartItem(null);
    setSelectedPharmacy(null);
    setSelectedMedicine(null);
    setActiveTab('medical', {}); // Reset state in app-shell
  }
  
  const handleBackToHome = () => {
    handleReset();
    setActiveTab('home');
  }

  const updateQuantity = (amount: number) => {
    if (!cartItem) return;
    const medicineToUpdate = cartItem.medicine;
    const stockQuantity = selectedPharmacy?.stock?.find(m => 
        m.name === medicineToUpdate.name && 
        m.manufacturer === medicineToUpdate.manufacturer && 
        m.price === medicineToUpdate.price)?.quantity || 0;

    const newQuantity = cartItem.quantity + amount;
    if (newQuantity > 0 && newQuantity <= stockQuantity) {
      setCartItem({ ...cartItem, quantity: newQuantity });
    }
  }

  const getMedicineInfo = (pharmacy: Pharmacy, medName: string) => {
    return (pharmacy.stock || []).find(m => m.name.toLowerCase().includes(medName.toLowerCase()));
  }
  
  const calculateQuantity = (med: Medication): number => {
    if (!med.frequency || !med.days) return 1;

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
        } else {
            return 1; // Default to 1 if frequency is unparseable
        }
    }

    const numDays = parseInt(med.days, 10);

    if (freqMultiplier > 0 && !isNaN(numDays)) {
        return freqMultiplier * numDays;
    }

    return 1;
  };
  
  const calculateTotalBill = (pharmacy: Pharmacy, prescription: Prescription) => {
    return prescription.medications.reduce((total, med) => {
        const medInfo = getMedicineInfo(pharmacy, med.name);
        if (medInfo && medInfo.quantity > 0) {
            const price = medInfo.price;
            const quantity = billQuantities[med.name] || calculateQuantity(med);
            return total + price * quantity; 
        }
        return total;
    }, 0);
  }

  const handleOpenBillDialog = (prescription: Prescription) => {
    const initialQuantities = prescription.medications.reduce((acc, med) => {
        const qty = calculateQuantity(med);
        acc[med.name] = qty;
        return acc;
    }, {} as {[key: string]: number});
    setBillQuantities(initialQuantities);
    setMaxBillQuantities(initialQuantities); // Store the initial quantities as the max
  }

  const handleUpdateBillQuantity = (medName: string, amount: number) => {
    setBillQuantities(prev => {
        const currentQuantity = prev[medName] || 0;
        const maxQuantity = maxBillQuantities[medName] || currentQuantity;
        const newQuantity = Math.max(1, Math.min(currentQuantity + amount, maxQuantity));
        return {
            ...prev,
            [medName]: newQuantity,
        };
    });
  }

  const getUniqueMedicines = (stock: Medicine[] | undefined) => {
    if (!stock) return [];
    const uniqueMedicinesMap = new Map<string, Medicine>();
    stock.forEach(medicine => {
      const key = `${medicine.name.trim().toLowerCase()}-${medicine.manufacturer.trim().toLowerCase()}-${medicine.price}`;
      if (!uniqueMedicinesMap.has(key)) {
        uniqueMedicinesMap.set(key, medicine);
      }
    });
    return Array.from(uniqueMedicinesMap.values());
  };

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    )
  }


  if (view === 'send-confirmation') {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
            <Send className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold font-headline">Prescription Sent!</h2>
            <p className="text-muted-foreground">
                Your prescription from <strong>Dr. {prescriptionToSend?.doctorName || prescriptionToBill?.doctorName}</strong> has been sent to <strong>{selectedPharmacy?.pharmacyName}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
                The pharmacy will contact you shortly to confirm your order.
            </p>
            <Button
                onClick={handleBackToHome}
                className="mt-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Button>
        </div>
    );
  }

  if (view === 'send-prescription' && prescriptionToSend) {
      return (
        <div className="animate-in fade-in duration-500">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('prescriptions')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to prescriptions
            </Button>
            <h3 className="text-xl font-bold font-headline mb-4">Select a Pharmacy to Send To</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {allPharmacies.map((pharmacy) => (
              <Card key={pharmacy.id} className="rounded-xl shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                      <div>
                          <h3 className="font-semibold">{pharmacy.pharmacyName}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              <span>{pharmacy.location}</span>
                          </div>
                      </div>
                  </CardContent>
                  <CardFooter className='border-t p-2 flex gap-2'>
                        <Dialog onOpenChange={(isOpen) => {
                            if(isOpen) {
                                const prescription = { medications: prescriptionToSend.medications } as Prescription;
                                handleOpenBillDialog(prescription);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full text-primary">
                                    <FileText className="mr-2 h-4 w-4" /> View Bill
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Estimated Bill at {pharmacy.pharmacyName}</DialogTitle>
                                    <DialogDescription>
                                        This is an estimate for the prescribed medicines.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                    {prescriptionToSend.medications.map((med, i) => {
                                        const medInfo = getMedicineInfo(pharmacy, med.name);
                                        if (!medInfo || medInfo.quantity <= 0) return null;
                                        
                                        const price = medInfo.price;
                                        const quantity = billQuantities[med.name] || 0;
                                        const maxQuantity = maxBillQuantities[med.name] || 0;
                                        return (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <div className="w-2/5 break-words">
                                                    <p className='capitalize font-medium'>{med.name}</p>
                                                    <p className='text-xs text-muted-foreground'>{medInfo.manufacturer}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-6 w-6 text-red-500 hover:text-red-600" 
                                                      onClick={() => handleUpdateBillQuantity(med.name, -1)}
                                                      disabled={quantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="font-semibold w-8 text-center border rounded-md px-2 py-0.5">{quantity}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-green-500 hover:text-green-600" 
                                                        onClick={() => handleUpdateBillQuantity(med.name, 1)}
                                                        disabled={quantity >= maxQuantity}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <span className='font-mono w-32 text-right'>
                                                   ₹{price.toFixed(2)} x {quantity} = ₹{(price * quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                    <Separator className='my-2'/>
                                     <div className="flex justify-between items-center font-bold text-base">
                                        <span>Total</span>
                                        <span className='font-mono'>₹{prescriptionToSend.medications.reduce((acc, med) => {
                                            const medInfo = getMedicineInfo(pharmacy, med.name);
                                            if (medInfo && medInfo.quantity > 0) {
                                                const quantity = billQuantities[med.name] || 0;
                                                return acc + (medInfo.price * quantity);
                                            }
                                            return acc;
                                        }, 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                      <Button type="button" variant="secondary">Close</Button>
                                  </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Separator orientation='vertical' className='h-6' />
                        <Button variant="ghost" size="sm" className="w-full text-primary" onClick={() => handleSelectPharmacyForSending(pharmacy)}>
                            <Send className="mr-2 h-4 w-4" /> Send
                        </Button>
                    </CardFooter>
              </Card>
            ))}
            </div>
        </div>
      )
  }

  if (view === 'confirmation') {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-4 p-4 animate-in fade-in duration-500">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold font-headline">Order Placed!</h2>
        <p className="text-muted-foreground">
          Your order for <strong>{cartItem?.quantity} x {cartItem?.medicine.name}</strong> from{' '}
          <strong>{cartItem?.pharmacy?.pharmacyName}</strong> has been placed.
        </p>
        <p className="text-sm text-muted-foreground">
          You can track the status in the "Order History" section.
        </p>
        <Button
          onClick={() => setActiveTab('order-history')}
          className="mt-4"
        >
          View Order History
        </Button>
      </div>
    );
  }

  if (view === 'payment' && cartItem) {
    return (
      <div className="animate-in fade-in duration-500">
        <Button variant="ghost" size="sm" onClick={() => setView('pharmacy')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to pharmacy
        </Button>
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Confirm & Pay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-bold text-lg">{cartItem.pharmacy.pharmacyName}</h3>
                <p className="text-muted-foreground text-sm">{cartItem.pharmacy.location}</p>
            </div>
            <Separator />
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Medicine</span>
                    <span className="font-semibold capitalize">{cartItem.medicine.name}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Quantity</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(-1)}><Minus className="h-4 w-4" /></Button>
                        <span className="font-semibold w-4 text-center">{cartItem.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="font-semibold">₹{(cartItem.medicine.price * cartItem.quantity).toFixed(2)}</span>
                </div>
            </div>
            <Separator />
            <div className='text-center'>
              <p className='text-sm text-muted-foreground'>You will be redirected to Razorpay to complete your payment.</p>
            </div>
            <Button className="w-full" size="lg" onClick={handlePayment}>
              Pay ₹{(cartItem.medicine.price * cartItem.quantity).toFixed(2)} & Order
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (view === 'pharmacy' && selectedPharmacy) {
    const uniqueMedicines = getUniqueMedicines(selectedPharmacy.stock);
    return (
        <div className="animate-in fade-in duration-500">
             <Button variant="ghost" size="sm" onClick={() => { setView('list'); setSelectedPharmacy(null); }} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to list
            </Button>
            <Card className="rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle>{selectedPharmacy.pharmacyName}</CardTitle>
                    <div className="space-y-1 pt-1">
                      <CardDescription className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{selectedPharmacy.location}</span>
                      </CardDescription>
                      {selectedPharmacy.contactNumber && (
                        <CardDescription className="flex items-center text-sm pt-1">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{selectedPharmacy.contactNumber}</span>
                        </CardDescription>
                      )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h4 className='font-semibold'>Available Medicines</h4>
                    <div className="space-y-3 max-h-[45vh] overflow-y-auto">
                      {uniqueMedicines.map((medicine) => {
                          const stockInfo = selectedPharmacy.stock?.find(m => 
                            m.name.trim().toLowerCase() === medicine.name.trim().toLowerCase() && 
                            m.manufacturer.trim().toLowerCase() === medicine.manufacturer.trim().toLowerCase() && 
                            m.price === medicine.price && 
                            m.quantity > 0
                          );
                          const isInStock = stockInfo && stockInfo.quantity > 0;

                          return (
                            <div key={`${medicine.name}-${medicine.manufacturer}-${medicine.price}`} className="border rounded-lg p-3 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold capitalize">{medicine.name}</p>
                                        <p className="text-xs text-muted-foreground">{medicine.manufacturer}</p>
                                    </div>
                                    <Badge variant={isInStock ? "default" : "destructive"} className={cn(isInStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", "font-semibold")}>
                                      {isInStock ? "In Stock" : "Out of Stock"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center border-t pt-2 mt-2">
                                    <p className="font-semibold text-lg">₹{medicine.price.toFixed(2)}</p>
                                    <Button size="sm" onClick={() => handleOrder(medicine)} disabled={!isInStock}>
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Order
                                    </Button>
                                </div>
                            </div>
                          )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a medicine..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {medicinesToFind && (
        <p className="text-sm text-muted-foreground">Showing pharmacies that have all prescribed medicines in stock.</p>
      )}

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {filteredPharmacies.length > 0 ? (
          filteredPharmacies.map((pharmacy) => {
            const medInfo = searchTerm && !medicinesToFind ? getMedicineInfo(pharmacy, searchTerm) : null;
            return (
              <Card key={pharmacy.id} className="rounded-xl shadow-sm">
                  <CardContent className="p-4" onClick={() => handleSelectPharmacy(pharmacy)}>
                      <div className="flex items-start justify-between">
                        <div className="cursor-pointer flex-grow">
                            <h3 className="font-semibold">{pharmacy.pharmacyName}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5 mr-1" />
                                <span>{pharmacy.location}</span>
                            </div>
                        </div>
                        <Badge variant={pharmacy.isOpen ? 'default' : 'secondary'} className={cn('capitalize', pharmacy.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                            {pharmacy.isOpen ? 'Open' : 'Closed'}
                        </Badge>
                      </div>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1.5" />
                              <span>{pharmacy.timings}</span>
                        </div>
                      </div>
                      {medInfo && (
                         <div className='text-right mt-2 border-t pt-2'>
                            <div className='flex justify-between items-center'>
                                <p className='capitalize font-semibold'>{medInfo.name}</p>
                                <p className='text-sm font-semibold'>₹{medInfo.price}</p>
                            </div>
                            <div className='flex justify-between items-center text-xs'>
                                <p className='text-muted-foreground'>{medInfo.manufacturer}</p>
                                <Badge variant={medInfo.quantity > 0 ? 'default' : 'destructive'} className={cn('capitalize', medInfo.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                    {medInfo.quantity > 0 ? <CheckCircle className='w-3 h-3 mr-1.5'/> : <XCircle className='w-3 h-3 mr-1.5'/>}
                                    {medInfo.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                </Badge>
                            </div>
                         </div>
                      )}
                  </CardContent>
                  {prescriptionToBill && medicinesToFind && (
                    <CardFooter className='border-t p-2 flex gap-2'>
                       <Dialog onOpenChange={(isOpen) => {
                           if (isOpen) {
                               handleOpenBillDialog(prescriptionToBill)
                           }
                       }}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full text-primary">
                                    <FileText className="mr-2 h-4 w-4" /> View Bill
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Estimated Bill at {pharmacy.pharmacyName}</DialogTitle>
                                    <DialogDescription>
                                        This is an estimate for the prescribed medicines.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                    {prescriptionToBill.medications.map((med, i) => {
                                        const medInfo = getMedicineInfo(pharmacy, med.name);
                                        if (!medInfo || medInfo.quantity <= 0) return null;
                                        
                                        const price = medInfo.price;
                                        const quantity = billQuantities[med.name] || 0;
                                        const maxQuantity = maxBillQuantities[med.name] || 0;
                                        return (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <div className="w-2/5 break-words">
                                                    <p className='capitalize font-medium'>{med.name}</p>
                                                    <p className='text-xs text-muted-foreground'>{medInfo.manufacturer}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-6 w-6 text-red-500 hover:text-red-600" 
                                                      onClick={() => handleUpdateBillQuantity(med.name, -1)}
                                                      disabled={quantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="font-semibold w-8 text-center border rounded-md px-2 py-0.5">{quantity}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-green-500 hover:text-green-600" 
                                                        onClick={() => handleUpdateBillQuantity(med.name, 1)}
                                                        disabled={quantity >= maxQuantity}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <span className='font-mono w-32 text-right'>
                                                   ₹{price.toFixed(2)} x {quantity} = ₹{(price * quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                    <Separator className='my-2'/>
                                     <div className="flex justify-between items-center font-bold text-base">
                                        <span>Total</span>
                                        <span className='font-mono'>₹{calculateTotalBill(pharmacy, prescriptionToBill).toFixed(2)}</span>
                                    </div>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                      <Button type="button" variant="secondary">Close</Button>
                                  </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Separator orientation='vertical' className='h-6' />
                        <Button variant="ghost" size="sm" className="w-full text-primary" onClick={() => handleSelectPharmacyForSending(pharmacy)}>
                            <Send className="mr-2 h-4 w-4" /> Send
                        </Button>
                    </CardFooter>
                  )}
              </Card>
            )
          })
        ) : (
          <p className="text-center text-muted-foreground p-4">
            {searchTerm ? 'No pharmacies found with this medicine.' : 'Search to see pharmacy stock.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicineAvailability;

    
    
