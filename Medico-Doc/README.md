# Medico-Doc: AI Agent–Driven Doctor’s Dashboard

Medico-Doc is a modern, real-time, AI-assisted platform built for medical professionals. Developed with Next.js, Firebase, and intelligent server-side agents, it streamlines patient management, enhances clinical workflows, and enables data-driven decision-making.

---

## 🔥 Core AI Agents

---

### 🧠 1. Symptom Summarization Agent

Transforms lengthy or unstructured patient records into:

- Concise summaries
- Highlighted red flags
- Key vitals to monitor
- Suggested follow-ups

Purpose-built to reduce pre-consultation workload for doctors.

---

### 📄 2. Prescription Drafting Agent

An AI assistant that helps doctors create medical-grade prescription drafts by:

- Analyzing patient notes
- Considering historical prescriptions
- Suggesting medicines and dosages
- Structuring the output in a clinical format

Doctors retain full control to edit, approve, and dispatch prescriptions.

---

### 🩻 3. Multi-Model Medical Image Analyzer Agent **(NEW)**

A smart agent that auto-selects the correct medical model based on the uploaded image type.

**How it works:**

1. Doctor uploads an image (X-ray, MRI, CT, brain scan, chest scan, etc.).
2. The agent identifies the image type.
3. It routes the scan to the appropriate internal AI model:
   - Brain tumor classifier
   - Alzheimer’s MRI model
   - Chest X-ray pathology detector
   - Future models as they are added
4. Generates a detailed clinical report:
   - Key findings
   - Areas of concern
   - Severity score
   - Recommended follow-ups

Enables rapid decision-making in high-volume clinical setups.

---

### 📬 4. Notification Intelligence Agent

Manages all real-time triggers and ensures doctors receive timely updates for critical events.

---

## 🚀 Key Features

---

### 1. Doctor Authentication & Profile Management

- Secure login via email/password or Google OAuth
- Protected dashboard routes
- Editable profile: specialization, bio, consultation type, fee, availability

---

### 2. Real-Time Dashboard Overview

A centralized hub showing live metrics:

- Total active patients
- Upcoming appointments
- New messages
- Activity charts for consultation trends

---

### 3. Appointment Lifecycle Management

- Structured appointment list
- Filters by status (Upcoming / Completed / Cancelled)
- Filters by consultation mode (Chat / Video)
- Mandatory reason for appointment cancellation

---

### 4. Patient & Consultation Management

- Full patient list with detailed profiles
- Access to:
  - Medical history
  - Vitals
  - Lab reports
  - Past prescriptions
- AI assistance for:
  - Patient history summarization
  - Prescription drafting
  - Medical image analysis

---

### 5. Real-Time Notifications

- Unread badge indicator
- Alerts for:
  - New appointments
  - Cancellations
  - Patient messages
  - Prescription deliveries
- Powered by Firebase Cloud Functions

---

### 6. Real-Time Chat System

- Instant doctor–patient messaging
- Firestore listeners ensure live syncing

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** React + Tailwind CSS + shadcn/ui
- **Database & Auth:** Firebase (Firestore, Authentication)
- **AI Agents:** Custom server-side agents
- **Backend Logic:** Firebase Cloud Functions

---

## ⚙ Getting Started

---

### Prerequisites

- Node.js v18+
- npm or yarn
- Firebase project

---

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-directory>
```
---

### 2. Install Dependencies
```bash
Copy code
npm install
```
---

### 3. Configure Firebase
- Open Firebase Console
- Navigate to Project Settings → Web App
- Copy your Firebase config into firebaseConfig inside src/lib/firebase.ts

---

### 4. Setup Environment Variables
Create a .env file:

```env
Copy code
# Firebase keys and other configs
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...


# Optional: OAuth or calendar-based agents
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
---

5. Start Development Servers
Terminal 1 – Run Next.js
```bash
Copy code
npm run dev
```
Visit:
http://localhost:9002

Terminal 2 – Run AI Flow Watcher (if using AI flow tooling)
```bash
Copy code
npm run genkit:watch
```
Dashboard:
http://localhost:4000
