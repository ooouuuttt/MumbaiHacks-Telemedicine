
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import ConsultationTrendsChart from '@/components/consultation-trends-chart';
import { Loader2 } from 'lucide-react';
import { getPatientsForDoctor } from '@/services/patientService';
import type { Patient, Appointment } from '@/lib/types';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        const fetchedPatients = await getPatientsForDoctor(user.uid);
        setPatients(fetchedPatients);
        setIsLoading(false);
      };

      fetchInitialData();

      const appointmentsCol = collection(db, 'appointments');
      const q = query(appointmentsCol, where('doctorId', '==', user.uid));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedAppointments = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamp to Date object
            const date = (data.date as Timestamp).toDate();
            return {
                id: doc.id,
                ...data,
                date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            } as Appointment;
        });
        setAppointments(fetchedAppointments);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const upcomingAppointmentsCount = appointments.filter(
    (app) => app.status === 'upcoming'
  ).length;

  const recentAppointments = [...appointments]
    .sort((a, b) => {
        // We need to convert date strings back to date objects for sorting
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);


  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold font-headline">
        Welcome back, {user?.displayName || 'Doctor'}
      </h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              All-time patient count
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointmentsCount}</div>
            <p className="text-xs text-muted-foreground">Live updates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {appointments.filter(app => app.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total consultations
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>
                Review and manage your recent patient consultations.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/appointments">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden xl:table-column">Type</TableHead>
                  <TableHead className="hidden xl:table-column">
                    Status
                  </TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={appointment.patientAvatar} alt={appointment.patientName} data-ai-hint="person portrait" />
                            <AvatarFallback>{appointment.patientName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{appointment.patientName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column capitalize">
                      <Badge variant="outline">
                          {appointment.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-column capitalize">
                      <Badge variant="outline">{appointment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {appointment.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <ConsultationTrendsChart />
      </div>
    </div>
  );
}
