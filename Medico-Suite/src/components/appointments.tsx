
'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Video, Phone, MessageSquare, CheckCircle, Clock, AlertTriangle, Info, RefreshCw, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, DocumentData, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tab } from './app-shell';
import { createNotification } from '@/lib/notification-service';
import { formatDoctorName } from '@/lib/utils';


interface Appointment extends DocumentData {
    id: string;
    doctorName: string;
    specialty: string;
    type: 'video' | 'audio' | 'chat';
    date: Timestamp;
    status: 'upcoming' | 'completed' | 'cancelled';
    cancellationReason?: string;
    cancelledBy?: 'patient' | 'doctor';
    start_url?: string;
    join_url?: string;
}

interface AppointmentsProps {
    user: User;
    setActiveTab: (tab: Tab) => void;
}

const AppointmentIcon = ({ type }: { type: 'video' | 'audio' | 'chat' }) => {
    switch (type) {
        case 'video': return <Video className="h-5 w-5 text-primary" />;
        case 'audio': return <Phone className="h-5 w-5 text-primary" />;
        case 'chat': return <MessageSquare className="h-5 w-5 text-primary" />;
        default: return <Calendar className="h-5 w-5 text-primary" />;
    }
};

const Appointments = ({ user, setActiveTab }: AppointmentsProps) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
    const { toast } = useToast();
    const notifiedCancellations = useRef(new Set<string>());


    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        const q = query(
            collection(db, 'appointments'),
            where('patientId', '==', user.uid),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedAppointments: Appointment[] = [];
            querySnapshot.forEach((doc) => {
                const appointment = { id: doc.id, ...doc.data() } as Appointment;
                fetchedAppointments.push(appointment);

                // Reliable check for doctor cancellations
                if (
                    appointment.status === 'cancelled' &&
                    appointment.cancelledBy === 'doctor' &&
                    !notifiedCancellations.current.has(appointment.id)
                ) {
                    createNotification(user.uid, {
                        title: 'Appointment Cancelled',
                        description: `${formatDoctorName(appointment.doctorName)} cancelled your appointment. Reason: ${appointment.cancellationReason}`,
                        type: 'alert'
                    });
                    notifiedCancellations.current.add(appointment.id);
                }
            });

            setAppointments(fetchedAppointments);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to fetch appointments:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleCancelAppointment = async () => {
        if (!selectedAppointmentId) return;
        try {
            const appointmentRef = doc(db, 'appointments', selectedAppointmentId);
            await updateDoc(appointmentRef, { status: 'cancelled', cancellationReason: 'Cancelled by patient', cancelledBy: 'patient' });
            
            const apt = appointments.find(a => a.id === selectedAppointmentId);
            if (apt) {
                createNotification(user.uid, {
                    title: 'Appointment Cancelled',
                    description: `You have cancelled your appointment with ${formatDoctorName(apt.doctorName)}.`,
                    type: 'appointment'
                });
            }

            toast({
                title: 'Appointment Cancelled',
                description: 'Your appointment has been successfully cancelled.',
            });
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to cancel the appointment. Please try again.',
            });
        } finally {
            setIsCancelDialogOpen(false);
            setSelectedAppointmentId(null);
        }
    };

    const openCancelDialog = (appointmentId: string) => {
        setSelectedAppointmentId(appointmentId);
        setIsCancelDialogOpen(true);
    };

    const now = new Date();
    const upcomingAppointments = appointments.filter(a => a.status === 'upcoming' && a.date.toDate() > now);
    const pastAppointments = appointments.filter(a => a.status !== 'upcoming' || a.date.toDate() <= now);
    
    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return new Date();
        return timestamp.toDate();
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-headline">Your Appointments</h2>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
            </div>
        );
    }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline">Your Appointments</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary"/>
            Upcoming
        </h3>
        {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(apt => (
                <Card key={apt.id} className="shadow-sm rounded-xl">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-secondary p-3 rounded-full">
                                    <AppointmentIcon type={apt.type} />
                                </div>
                                <div>
                                    <p className="font-bold">{formatDoctorName(apt.doctorName)}</p>
                                    <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(apt.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        {' at '}
                                        {formatDate(apt.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                           {apt.type === 'video' && apt.join_url ? (
                                <Button className="w-full" asChild>
                                    <a href={apt.join_url} target="_blank" rel="noopener noreferrer">
                                        Join Video Call <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            ) : apt.type === 'chat' ? (
                                <Button className="w-full" onClick={() => {/* logic to start chat */}}>
                                    Start Chat
                                </Button>
                            ) : (
                                <Button className="w-full">Join Call</Button>
                            )}
                            <Button variant="destructive" className="w-full" onClick={() => openCancelDialog(apt.id)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            ))
        ) : (
            <p className="text-muted-foreground text-sm text-center py-4">You have no upcoming appointments.</p>
        )}
      </div>

       <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600"/>
            Past
        </h3>
        {pastAppointments.length > 0 ? (
            pastAppointments.map(apt => {
                 const isCompleted = apt.status === 'completed' || (apt.status === 'upcoming' && apt.date.toDate() <= now);
                 const statusLabel = isCompleted ? 'Completed' : 'Cancelled';

                return (
                <Card key={apt.id} className="shadow-sm rounded-xl opacity-80">
                    <CardContent className="p-4 pb-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-secondary p-3 rounded-full">
                                    <AppointmentIcon type={apt.type} />
                                </div>
                                <div>
                                    <p className="font-bold">{formatDoctorName(apt.doctorName)}</p>
                                    <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(apt.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={isCompleted ? 'default' : 'destructive'} className='capitalize'>
                                {statusLabel}
                            </Badge>
                        </div>
                         {apt.status === 'cancelled' && apt.cancellationReason && (
                            <Alert variant="destructive" className="mt-4 bg-destructive/5 border-destructive/30">
                                <Info className="h-4 w-4" />
                                <AlertTitle className='text-destructive'>Cancellation Reason</AlertTitle>
                                <AlertDescription className='text-destructive/80'>
                                    {apt.cancellationReason}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    {apt.status === 'cancelled' && (
                        <CardFooter className="p-4">
                            <Button className="w-full" variant="outline" onClick={() => setActiveTab('consult')}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reschedule
                            </Button>
                        </CardFooter>
                    )}
                </Card>
                )
            })
        ) : (
            <p className="text-muted-foreground text-sm text-center py-4">You have no past appointments.</p>
        )}
      </div>
      
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently cancel your appointment.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedAppointmentId(null)}>Back</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelAppointment} className="bg-destructive hover:bg-destructive/90">
                    Yes, cancel it
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
     </AlertDialog>


    </div>
  );
}

export default Appointments;
