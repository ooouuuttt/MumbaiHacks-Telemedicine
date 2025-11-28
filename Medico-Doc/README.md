# Medico-Doc: AI-Powered Doctor's Dashboard

Medico-Doc is a modern, real-time, and AI-assisted web application for medical professionals. Built with Next.js, Firebase, and Genkit, it provides doctors with a comprehensive suite of tools to manage patients, appointments, and consultations efficiently.

## Key Features

### 1. Doctor Authentication & Profile Management
*   **Secure Sign-Up & Login:** Doctors can create an account using email/password or sign in with their Google account. All dashboard routes are protected.
*   **Comprehensive Doctor Profile:** Doctors can manage their professional profile, including specialization, bio, consultation types (video, audio, chat), and fees.

### 2. Real-Time Dashboard Overview
*   **Centralized Hub:** A dynamic dashboard provides an at-a-glance overview of key metrics like total patients and upcoming appointments.
*   **Live Data Updates:** Key statistics, such as the upcoming appointment count, update in real-time without requiring a page refresh.
*   **Visual Trends:** A chart visualizes consultation trends, helping doctors track their practice's activity.

### 3. Complete Appointment Lifecycle Management
*   **View & Filter:** Doctors can view a comprehensive list of all appointments and filter them by status (Upcoming, Completed, Cancelled) and type (Video, Chat).
*   **Cancellations with Reason:** Doctors can cancel upcoming appointments and are required to provide a reason, ensuring a clear audit trail.

### 4. Patient & Consultation Management
*   **Detailed Patient Records:** A dedicated page lists all patients, with a detailed view for each containing their health records, vitals, lab reports, and prescription history.
*   **AI-Powered Symptom Summarization:** An integrated AI tool generates concise, easy-to-read summaries from raw patient health records, saving doctors valuable time.
*   **AI-Assisted Prescription Generation:** Doctors can use an AI assistant to generate draft prescriptions based on patient records. The doctor retains full control to review, edit, and finalize the prescription before sending.

### 5. Fully Functional, Real-Time Notification System
*   **Instant Alerts:** A robust, real-time notification system keeps doctors informed of critical events. The header bell icon displays a live count of unread notifications.
*   **Comprehensive Triggers:** Notifications are automatically generated for:
    *   A new appointment being booked by a patient.
    *   An appointment being cancelled by the doctor.
    *   A new message being received from a patient.
    *   A prescription being successfully sent.
*   **Backend Listeners:** Firebase Functions are used to reliably trigger notifications for events initiated by patients (new appointments, new messages), ensuring no event is missed.

### 6. Real-Time Communication
*   **Live Chat:** A fully functional, real-time messaging page allows doctors to have live conversations with their patients.

## Tech Stack

*   **Framework:** Next.js (with App Router)
*   **UI:** React, ShadCN UI, Tailwind CSS
*   **Authentication & Database:** Firebase (Auth, Firestore)
*   **Generative AI:** Google AI & Genkit
*   **Real-time Backend:** Firebase Cloud Functions

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn
*   A Firebase project.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

1.  Go to your [Firebase Console](https://console.firebase.google.com/).
2.  In your project settings, find your web app's configuration object.
3.  Copy this object into the `firebaseConfig` variable in `src/lib/firebase.ts`.

### 4. Configure Google AI (Genkit)

1.  Go to the [Google AI Studio](https://aistudio.google.com/) and get an API key.
2.  Create a `.env` file in the root of the project.
3.  Add your API key to the `.env` file:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

### 5. Run the Development Servers

This project requires two development servers to be running simultaneously: one for the Next.js frontend and another for the Genkit AI flows.

*   **Terminal 1: Run the Next.js App**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

*   **Terminal 2: Run the Genkit Flows**
    ```bash
    npm run genkit:watch
    ```
    This command starts the Genkit development server and watches for any changes in your AI flows. The Genkit UI will be available at `http://localhost:4000`.

You are now all set up to run and develop the Medico-Doc application!
