# Medico – Your Personal Health Companion

Medico is an advanced, AI-powered healthcare platform built using Next.js, Firebase, and custom intelligent AI agents. It delivers a fast, intuitive, and smart healthcare ecosystem—from symptom analysis to medicine ordering and appointment scheduling.

---

## ✨ Features

---

## 🧠 AI Agents (Core Intelligence Layer)

### **Symptom Checker AI Agent**

Users describe their symptoms in natural language, and the system provides:

- Possible conditions
- Severity & urgency level
- Recommended next actions (self-care, doctor visit, emergency indicators)

### **Prescription Scanner AI Agent**

Upload a photo of a handwritten or digital prescription. The AI extracts:

- Medicine names
- Dosage & frequency
- Doctor’s information
- Additional notes

### **Google Calendar Medication Reminder Agent**

Once medicine details are extracted, reminders can be automatically added to Google Calendar:

- Medicine name
- Dosage
- Frequency
- Start & end dates
- Notification timings

---

## 👨‍⚕ Teleconsultations

- Book appointments across multiple medical specialties
- View doctor profiles (experience, qualifications, specialization)
- Choose consultation mode:
  - Video
  - Audio
  - Real-time chat
- Intelligent scheduling with available time slot suggestions

---

## 🎤 Voice Command System

Supports voice interaction in:

- English
- Hindi
- Punjabi

Users can navigate the app, book appointments, check symptoms, and more through voice commands.

---

## 💊 Medicine Ordering

- Search for medicines and check availability across nearby pharmacies
- Order medicines through:
  - In-app search
  - AI-digitized prescription
- Send e-prescriptions to pharmacies for quick pickup

---

## 📜 Order History

Track all previous medicine orders with clear timelines:

- Pending
- Ready for Pickup
- Completed

---

## 📂 Health Records

A centralized dashboard to manage all medical data:

- Personal health profile
- Vitals (BP, HR, etc.)
- Consultation summaries
- Uploaded medical documents

---

## 📝 E-Prescriptions

Doctors can issue electronic prescriptions that users can:

- View
- Download
- Use for medicine orders

---

## 🔔 Real-time Notifications

Receive alerts for:

- Appointment reminders
- New prescriptions
- Medicine order updates

---

## 🌐 Multi-language Support

Full UI translations available in:

- English
- Hindi
- Punjabi

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database & Auth:** Firebase (Firestore, Auth)
- **AI Agents:** Custom server-side AI agents
- **Deployment:** Vercel

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

- Node.js v18+
- npm or yarn

---

### 2️⃣ Environment Setup

Create a `.env` file and add:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

# Google OAuth for Calendar Integration
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```
