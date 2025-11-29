# Medico-Suite – Unified AI-Powered Healthcare Ecosystem

Medico-Suite is an integrated, enterprise-grade healthcare ecosystem composed of **three AI-enhanced applications**—Medico (Patient App), Medico-Doc (Doctor Dashboard), and MediServe (Pharmacy Management System).  
Together, these applications create an end-to-end digital healthcare network powered by Next.js, Firebase, and intelligent server-side AI agents.

This suite addresses the entire care cycle: **patients → doctors → pharmacies**, forming a fully connected and automated healthcare environment.

---

# 🏥 Medico-Suite Architecture Overview

Medico-Suite is built around three major applications:

1. **Medico – Personal Health Companion (Patient Application)**  
2. **Medico-Doc – Doctor’s AI-Assisted Dashboard**  
3. **MediServe – Pharmacy Management System**

Each module runs independently but synchronizes through Firebase Firestore, AI agents, and cloud functions.

---

# 1. Medico – Personal Health Companion

Medico empowers users with AI-powered health insights, online consultations, medicine discovery, and digital health record management.

## ✨ Key Features

### 🧠 AI Agents
- **Symptom Checker Agent** – Identifies possible conditions, urgency, and next steps  
- **Prescription Scanner Agent** – Extracts medicines, dosage, doctor info  
- **Google Calendar Reminder Agent** – Auto-schedules medicines into user’s Google Calendar  

### 👨‍⚕ Teleconsultations
- Book appointments  
- Video / audio / chat consultations  
- Intelligent slot allocation  
- Doctor profile viewing  

### 🎤 Voice Commands
Supports: **English, Hindi, Punjabi**

### 💊 Medicine Ordering
- Search local pharmacies  
- Place orders via search or AI-digitized prescriptions  
- E-prescriptions for faster pickup  

### 📜 Order History & Tracking

### 📂 Unified Health Records
- Vitals, documents, summaries  

### 📝 E-Prescriptions
- View, download, and use for medicine orders  

### 🔔 Notifications & Multi-language UI

---

# 2. Medico-Doc – AI-Powered Doctor Dashboard

An interactive, real-time medical workstation enabling doctors to manage patients, consultations, and clinical decisions with AI support.

## 🔥 Core AI Agents

### 🧠 Symptom Summarization Agent
Summaries, red flags, key vitals, follow-ups.

### 📄 Prescription Drafting Agent
Drafts precise, structured prescriptions based on notes and history.

### 🩻 Multi-Model Image Analyzer Agent
Auto-detects image type → routes to correct medical model → returns structured clinical findings.

### 📬 Notification Intelligence Agent
Manages all real-time triggers across the doctor ecosystem.

## 🚀 Key Features
- Secure doctor authentication and editable profile  
- Real-time consultation dashboard  
- Appointment lifecycle management  
- In-depth patient records  
- Live notifications  
- Real-time chat with patients  

---

# 3. MediServe – Pharmacy Management System

A modern solution designed for pharmacies to manage inventory, prescriptions, orders, and AI-based business insights.

## 🚀 Core Features

### 🔐 Authentication & Secure Portal

### 📊 Pharmacy Dashboard
- Total medicines  
- Low/out-of-stock alerts  
- Incoming prescriptions  
- Real-time notifications  

### 🏥 Stock & Inventory Management
- Full inventory control  
- Indicators: In Stock / Low Stock / Out Of Stock  
- Quick add/edit workflows  

### 📜 Prescription Handling
- Centralized table  
- Status: **Pending → Ready → Completed**  

### 🤖 AI Agents
- **Notification Agent** – Auto-generates customer alerts  
- **Sales Insights Agent** – Top sellers, seasonal trends  
- **Inventory Forecasting Agent** – Predicts stock requirements  
- **Stock Optimization Agent** – Prevents stock imbalance  
- **Symptom Checker Agent** – Customer-side symptom analysis  

### 📦 Order Fulfillment

### 🏪 Profile Management & Alerts

---

# 🧠 Medico-Suite AI Layer (Cross-Application)

All three apps leverage intelligent AI flows that support:

- Healthcare text analysis  
- Medical image inference  
- Inventory forecasting  
- Prescription structuring  
- Symptom classification  
- Automated communication (patients/pharmacies)  

AI agents run server-side for consistency and compliance.

---

# 🛠 Tech Stack (Suite-Wide)

- **Framework:** Next.js (App Router)  
- **UI Libraries:** Tailwind CSS + shadcn/ui  
- **Database & Auth:** Firebase Authentication, Firestore  
- **AI Agents:** Custom server-side agent flows  
- **Cloud Logic:** Firebase Cloud Functions  
- **Deployment:** Vercel  

---

# ⚙ Getting Started (Monorepo or Multi-Repo)

If using a monorepo (recommended):

