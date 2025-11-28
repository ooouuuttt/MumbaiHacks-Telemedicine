
import type { Patient, Appointment, Doctor, Message, PastPrescription } from './types';
import { PlaceHolderImages } from './placeholder-images';

export type { Message };

export const doctor: Doctor = {
  name: 'Anjali Sharma',
  specialization: 'Cardiologist',
  avatar: PlaceHolderImages.find(img => img.id === '1')?.imageUrl || '',
};

const pastPrescriptions: PastPrescription[] = [
    {
        id: 'presc1',
        date: '2023-08-10',
        medications: [
            { name: 'Amlodipine', dosage: '5mg', frequency: 'Once a day' },
            { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once a day at night' },
        ],
        notes: 'Follow up in 2 months. Monitor blood pressure weekly.'
    }
];

export const patients: Patient[] = [
  {
    id: '1',
    name: 'Rohan Verma',
    age: 45,
    gender: 'Male',
    lastVisit: '2023-10-15',
    avatar: PlaceHolderImages.find(img => img.id === '2')?.imageUrl || '',
    healthRecords: `Patient reports intermittent chest pain, especially during physical exertion. History of hypertension, managed with medication. Non-smoker. Family history of heart disease. Recent EKG shows minor abnormalities. Cholesterol levels are slightly elevated. Patient also complains of occasional shortness of breath.`,
    messages: [
      { id: '1', sender: 'patient', text: 'Good morning, Doctor. I\'m still feeling some chest discomfort.', timestamp: '10:30 AM' },
      { id: '2', sender: 'doctor', text: 'Good morning, Rohan. Please describe the discomfort. Is it sharp or dull?', timestamp: '10:32 AM' },
      { id: '3', sender: 'patient', text: 'It\'s a dull ache, mostly when I walk up the stairs.', timestamp: '10:35 AM' },
    ],
    vitals: {
        bloodPressure: '140/90 mmHg',
        heartRate: '85 bpm',
        temperature: '98.6°F',
        respiratoryRate: '18 breaths/min'
    },
    labReports: [
        { id: 'lab1', title: 'Lipid Panel', date: '2023-10-05', url: '#' },
        { id: 'lab2', title: 'EKG Report', date: '2023-10-05', url: '#' },
    ],
    pastPrescriptions: pastPrescriptions,
  },
  {
    id: '2',
    name: 'Priya Patel',
    age: 32,
    gender: 'Female',
    lastVisit: '2023-11-01',
    avatar: PlaceHolderImages.find(img => img.id === '3')?.imageUrl || '',
    healthRecords: `32-year-old female presenting with persistent dry cough and fatigue for the past 3 weeks. Denies fever. Works in a crowded office environment. Reports difficulty sleeping due to cough. No significant past medical history. Seasonal allergies reported, usually managed with over-the-counter antihistamines.`,
    messages: [
        { id: '1', sender: 'patient', text: 'Hello Dr. Sharma, I wanted to follow up on my cough.', timestamp: 'Yesterday' },
        { id: '2', sender: 'doctor', text: 'Hello Priya, how have you been feeling since our last appointment?', timestamp: 'Yesterday' },
        { id: '3', sender: 'patient', text: 'The cough is still there, especially at night. The medicine helps a bit.', timestamp: '9:00 AM' },
        { id: '4', sender: 'doctor', text: 'Okay, let\'s monitor it for another two days. If it doesn\'t improve, we may need to try a different approach.', timestamp: '9:05 AM' },
    ],
    vitals: {
        bloodPressure: '120/80 mmHg',
        heartRate: '72 bpm',
        temperature: '98.4°F',
        respiratoryRate: '16 breaths/min'
    },
    labReports: [
        { id: 'lab3', title: 'Chest X-Ray', date: '2023-10-28', url: '#' },
    ],
    pastPrescriptions: [],
  },
  {
    id: '3',
    name: 'Amit Singh',
    age: 68,
    gender: 'Male',
    lastVisit: '2023-11-20',
    avatar: PlaceHolderImages.find(img => img.id === '4')?.imageUrl || '',
    healthRecords: `Patient with Type 2 Diabetes, struggling with glucose control. Reports symptoms of polyuria and polydipsia. Last HbA1c was 8.5%. Also manages high blood pressure. Complains of tingling sensation in feet. Diet adherence is a challenge for the patient.`,
    messages: [
        { id: '1', sender: 'patient', text: 'Doctor, I\'ve been checking my sugar levels and they are high.', timestamp: '2 days ago' },
    ],
    vitals: {
        bloodPressure: '130/85 mmHg',
        heartRate: '80 bpm',
        temperature: '98.7°F',
        respiratoryRate: '18 breaths/min'
    },
  },
  {
    id: '4',
    name: 'Sunita Rao',
    age: 55,
    gender: 'Female',
    lastVisit: '2023-12-05',
    avatar: PlaceHolderImages.find(img => img.id === '5')?.imageUrl || '',
    healthRecords: `Patient reports severe migraine headaches, occurring 3-4 times per month. Headaches are accompanied by nausea and sensitivity to light. Current medication provides only partial relief. No other neurological symptoms. Seeking alternative treatment options.`,
    messages: [
      { id: '1', sender: 'patient', text: 'Can I reschedule my next appointment?', timestamp: 'Yesterday' },
      { id: '2', sender: 'doctor', text: 'Of course, please call the clinic to find a suitable time.', timestamp: 'Yesterday' },
    ]
  },
  {
    id: '5',
    name: 'Vikram Reddy',
    age: 28,
    gender: 'Male',
    lastVisit: '2024-01-10',
    avatar: PlaceHolderImages.find(img => img.id === '6')?.imageUrl || '',
    healthRecords: `28-year-old male athlete with right knee pain following a football injury. Swelling and instability reported. MRI results suggest a possible ACL tear. Pain is significant when walking. Patient is anxious about long-term impact on his athletic career.`,
    messages: [
      { id: '1', sender: 'patient', text: 'I have the MRI report. Should I send it to you?', timestamp: '1:00 PM' },
      { id: '2', sender: 'doctor', text: 'Yes, please upload it to the patient portal.', timestamp: '1:02 PM' },
    ],
  },
];

export const appointments: Appointment[] = [
  {
    id: '1',
    patientName: 'Priya Patel',
    patientAvatar: PlaceHolderImages.find(img => img.id === '3')?.imageUrl || '',
    time: '10:00 AM',
    type: 'Video',
    status: 'Upcoming',
  },
  {
    id: '2',
    patientName: 'Amit Singh',
    patientAvatar: PlaceHolderImages.find(img => img.id === '4')?.imageUrl || '',
    time: '11:30 AM',
    type: 'Chat',
    status: 'Upcoming',
  },
  {
    id: '3',
    patientName: 'Rohan Verma',
    patientAvatar: PlaceHolderImages.find(img => img.id === '2')?.imageUrl || '',
    time: '02:00 PM',
    type: 'Video',
    status: 'Completed',
  },
  {
    id: '4',
    patientName: 'Sunita Rao',
    patientAvatar: PlaceHolderImages.find(img => img.id === '5')?.imageUrl || '',
    time: '03:00 PM',
    type: 'Video',
    status: 'Cancelled',
  },
];
