
import type { Timestamp } from 'firebase/firestore';

export type Message = {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
};

export type Vitals = {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
};

export type LabReport = {
  id: string;
  title: string;
  date: string;
  url: string; // Link to the report PDF/image
};

export type PastPrescription = {
    id: string;
    date: string;
    medications: { name: string; dosage: string; frequency: string }[];
    notes: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  lastVisit: string;
  avatar: string;
  healthRecords: string;
  messages?: Message[];
  vitals?: Vitals;
  labReports?: LabReport[];
  pastPrescriptions?: PastPrescription[];
};

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  time: string;
  date: string;
  type: 'video' | 'chat';
  status: 'upcoming' | 'completed' | 'cancelled';
  cancellationReason?: string;
  zoomStartUrl?: string;
  zoomJoinUrl?: string;
};

export type Doctor = {
  name: string;
  specialization: string;
  avatar: string;
};

export type Notification = {
    id: string;
    doctorId: string;
    title: string;
    message: string;
    createdAt: Date;
    read: boolean;
};
