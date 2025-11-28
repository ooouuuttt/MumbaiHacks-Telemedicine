
'use client';

import { useState, useEffect } from 'react';
import { File, ListFilter, MoreHorizontal, Loader2, Video, Trash2, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { getAppointmentsForDoctor, cancelAppointment, completeAppointment } from '@/services/appointmentService';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/lib/types';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilters, setTypeFilters] = useState<{ video: boolean; chat: boolean }>({
    video: true,
    chat: true,
  });
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    async function fetchAppointments() {
      if (user) {
        setIsLoading(true);
        const fetchedAppointments = await getAppointmentsForDoctor(user.uid);
        setAppointments(fetchedAppointments);
        setIsLoading(false);
      }
    }
    fetchAppointments();
  }, [user]);

  const handleTypeFilterChange = (type: 'video' | 'chat', checked: boolean) => {
    setTypeFilters(prev => ({ ...prev, [type]: checked }));
  };
  
  const handleCancelAppointment = async () => {
    if (!appointmentToCancel || !cancellationReason.trim()) {
        toast({
            variant: 'destructive',
            title: 'Reason Required',
            description: 'Please provide a reason for the cancellation.',
        });
        return;
    }

    const result = await cancelAppointment(appointmentToCancel.id, cancellationReason);
    if (result.success) {
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentToCancel.id ? { ...app, status: 'cancelled', cancellationReason } : app
        )
      );
      toast({
        title: 'Appointment Cancelled',
        description: `The appointment with ${appointmentToCancel.patientName} has been cancelled.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description: result.error || 'Could not cancel the appointment. Please try again.',
      });
    }
    setAppointmentToCancel(null);
    setCancellationReason('');
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    const result = await completeAppointment(appointmentId);
    if (result.success) {
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'completed' } : app
        )
      );
      toast({
        title: 'Appointment Completed',
        description: 'The appointment has been marked as completed.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.error || 'Could not mark the appointment as completed.',
      });
    }
  };
  
  const openCancelDialog = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setCancellationReason('');
  }

  const filteredAppointments = appointments.filter(appointment => {
    const statusMatch = activeTab === 'all' || appointment.status.toLowerCase() === activeTab;
    const selectedTypes = [];
    if (typeFilters.video) selectedTypes.push('video');
    if (typeFilters.chat) selectedTypes.push('chat');
    const typeMatch = selectedTypes.length === 0 || selectedTypes.length === 2 || selectedTypes.includes(appointment.type.toLowerCase());
    return statusMatch && typeMatch;
  });

  const renderTableRows = (appointmentsToRender: Appointment[]) => (
    <TableBody>
      {appointmentsToRender.map((appointment) => (
        <TableRow key={appointment.id}>
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={appointment.patientAvatar} alt={appointment.patientName} data-ai-hint="person portrait" />
                <AvatarFallback>{appointment.patientName?.charAt(0) || ''}</AvatarFallback>
              </Avatar>
              <span>{appointment.patientName}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className="capitalize">{appointment.type}</Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
                 <Badge
                  variant={
                    appointment.status === 'completed'
                      ? 'default'
                      : appointment.status === 'cancelled'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className={cn(appointment.status === "upcoming" && "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30", "capitalize")}
                >
                  {appointment.status}
                </Badge>
                {appointment.status === 'cancelled' && appointment.cancellationReason && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs text-sm">Reason: {appointment.cancellationReason}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
          </TableCell>
          <TableCell>{appointment.time} <br/> <span className="text-xs text-muted-foreground">{appointment.date}</span></TableCell>
          <TableCell>
             {appointment.status === 'upcoming' && (
              <div className="flex items-center gap-2">
                {appointment.type === 'video' && appointment.zoomStartUrl ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={appointment.zoomStartUrl} target="_blank">
                        <Video className="mr-2 h-4 w-4" /> Join
                      </Link>
                    </Button>
                ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/consultation/${appointment.id}`}>
                         {appointment.type === 'video' ? <Video className="mr-2 h-4 w-4" /> : null}
                         {appointment.type === 'video' ? 'Join' : 'Chat'}
                      </Link>
                    </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCompleteAppointment(appointment.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                </Button>
                 <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => openCancelDialog(appointment)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <>
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled" className="hidden sm:flex">
              Cancelled
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter by Type
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={typeFilters.video}
                  onCheckedChange={(checked) => handleTypeFilterChange('video', !!checked)}
                >
                  Video
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={typeFilters.chat}
                  onCheckedChange={(checked) => handleTypeFilterChange('chat', !!checked)}
                >
                  Chat
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-rap">
                Export
              </span>
            </Button>
          </div>
        </div>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>
              Manage your appointments and view consultation details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAppointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time & Date</TableHead>
                    <TableHead>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                {renderTableRows(filteredAppointments)}
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No appointments found for the selected filters.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{filteredAppointments.length}</strong> of <strong>{appointments.length}</strong> appointments
            </div>
          </CardFooter>
        </Card>
        
      </Tabs>
      
      <AlertDialog open={!!appointmentToCancel} onOpenChange={(open) => !open && setAppointmentToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel the appointment with <strong>{appointmentToCancel?.patientName}</strong> on {appointmentToCancel?.date} at {appointmentToCancel?.time}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <label htmlFor="cancellation-reason" className="text-sm font-medium">Reason for Cancellation</label>
            <Textarea 
                id="cancellation-reason"
                placeholder="Please provide a reason for cancelling..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAppointmentToCancel(null)}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelAppointment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
