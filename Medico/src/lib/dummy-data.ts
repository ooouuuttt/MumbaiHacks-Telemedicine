
import type { LucideIcon } from "lucide-react";

export type Consultation = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  notes?: string;
  summary?: string;
};

export type Prescription = {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedOn: string;
};

export type Document = {
  id: string;
  name: string;
  type: string;
  date: string;
}

export type Doctor = {
    id: string;
    name: string;
    specialty: string;
    experience: number;
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);

export const consultations: Consultation[] = [
  { 
    id: 'c1', 
    doctor: 'Dr. Anjali Sharma', 
    specialty: 'General Physician', 
    date: '2024-07-15',
    summary: 'Patient reported symptoms of a common cold. Advised rest, hydration, and over-the-counter medication. Follow-up if symptoms persist for more than a week. No signs of bacterial infection were observed.'
  },
  { id: 'c2', doctor: 'Dr. Rohan Mehra', specialty: 'Pediatrics', date: '2024-06-20', summary: 'Routine check-up for the child. Growth and development are on track. Discussed vaccination schedule and nutrition. No immediate concerns.' },
  { id: 'c3', doctor: 'Dr. Priya Singh', specialty: 'Gynecology', date: '2024-05-10', summary: 'Patient presented with minor hormonal imbalances. Prescribed supplements and recommended lifestyle changes. Scheduled a follow-up in 3 months.' },
];

export const prescriptions: Prescription[] = [
  { id: 'p1', medicine: 'Paracetamol', dosage: '500mg', frequency: 'Twice a day', duration: '3 days', prescribedOn: '2024-07-15' },
  { id: 'p2', medicine: 'Amoxicillin', dosage: '250mg', frequency: 'Thrice a day', duration: '5 days', prescribedOn: '2024-06-20' },
  { id: 'p3', medicine: 'Folic Acid', dosage: '5mg', frequency: 'Once a day', duration: '30 days', prescribedOn: '2024-05-10' },
];

export const documents: Document[] = [
    { id: 'doc1', name: 'Blood Test Report', type: 'PDF', date: '2024-07-10'},
    { id: 'doc2', name: 'X-Ray Scan', type: 'JPG', date: '2024-05-22'},
];

export const specialties = [
    { name: 'General Physician', icon: 'Stethoscope' },
    { name: 'Pediatrics', icon: 'Baby' },
    { name: 'Gynecology', icon: 'HeartPulse' },
    { name: 'Dermatology', icon: 'Sparkles' },
    { name: 'Orthopedics', icon: 'Bone' },
    { name: 'Cardiology', icon: 'Activity' },
];


function generateVitals(days: number, min: number, max: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    };
  });
}

function generateBloodPressure(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const systolic = Math.floor(Math.random() * (130 - 110 + 1)) + 110;
    const diastolic = Math.floor(Math.random() * (85 - 70 + 1)) + 70;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      systolic,
      diastolic
    };
  });
}

export const vitalsData = {
  heartRate: generateVitals(7, 60, 90),
  bloodPressure: generateBloodPressure(7),
  temperature: generateVitals(7, 97, 100),
}

    
