
'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Loader2 } from 'lucide-react';
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { Patient } from '@/lib/types';
import { getPatientsForDoctor } from '@/services/patientService';

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      if (user) {
        setIsLoading(true);
        const fetchedPatients = await getPatientsForDoctor(user.uid);
        setPatients(fetchedPatients);
        setIsLoading(false);
      }
    }
    fetchPatients();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients</CardTitle>
        <CardDescription>
          Manage your patients and view their health records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : patients.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="hidden md:table-cell">Age</TableHead>
                <TableHead className="hidden md:table-cell">
                  Last Visit
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={patient.avatar}
                          alt={patient.name}
                          data-ai-hint="person portrait"
                        />
                        <AvatarFallback>
                          {patient.name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{patient.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.age}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.lastVisit}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/patients/${patient.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href={`/dashboard/patients/${patient.id}`}>Create Prescription</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No patients found. Patients who book an appointment with you will appear here.
          </div>
        )}
      </CardContent>
      {!isLoading && patients.length > 0 && (
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{patients.length}</strong> of{' '}
            <strong>{patients.length}</strong> patients
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
