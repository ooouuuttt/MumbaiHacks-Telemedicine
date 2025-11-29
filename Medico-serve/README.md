# MediServe – Pharmacy Management System (AI Agent–Enhanced)

MediServe is a robust, real-time pharmacy management platform built with Next.js and Firebase. It modernizes pharmacy workflows with integrated AI agents that automate routine tasks, optimize inventory health, strengthen customer communication, and deliver predictive operational insights.

---

## 🚀 Features

---

## 🔐 Authentication

- Secure registration and login using Firebase Authentication (Email & Password)
- All operational features are protected behind authenticated routes

---

## 📊 Dashboard

A centralized command center offering real-time visibility into pharmacy performance.

**Key Metrics**

- Total medicines
- Low-stock items
- Out-of-stock alerts

**Incoming Prescriptions**

- View newly received prescriptions pending processing

**Real-Time Notifications**

- Unread alerts for:
  - Low stock
  - New prescriptions
  - Expiry warnings

---

## 🏥 Stock & Inventory Management

- View, search, filter, and sort the complete medicine inventory
- Add new items with manufacturer, stock count, pricing, and expiry details
- Automatic stock indicators:
  - In Stock
  - Low Stock
  - Out of Stock

Smart categorization ensures faster navigation and restocking efficiency.

---

## 📜 Prescription Handling

Manage prescriptions received from customers or doctors through a centralized table:

- Track all incoming prescriptions
- Update status: **Pending → Ready for Pickup → Completed**

---

## 🤖 1. Prescription Notification Agent

Automatically generates message-ready notifications to inform customers when their order is ready.  
Designed for clarity and friendliness.

---

## 📦 Order Fulfillment

- Dedicated workflow to manage pharmacy orders
- Track progress and update statuses
- Supports smooth delivery or pickup operations

---

## 📈 AI Agent–Driven Analytics & Reporting

### 🤖 2. Sales Insights Agent

Analyzes sales data to identify:

- Best-selling medicines
- Seasonal demand patterns
- Sudden demand spikes

### 🤖 3. Inventory Forecasting Agent

Uses historical purchase trends to:

- Predict future stock needs
- Recommend reorder quantities
- Flag potential overstock situations

### 🤖 4. Stock Optimization Agent

Offers data-backed suggestions to:

- Prevent stockouts
- Avoid overstocking
- Maintain stable inventory cycles

Insights are displayed through interactive visual charts.

---

## 🧠 AI Symptom Checker Agent

Allows customers to enter symptoms and receive:

- Preliminary AI-generated symptom analysis
- Possible conditions
- Suggested next steps or advisories

Adds value beyond traditional pharmacy operations.

---

## 🏪 Profile Management

- Update pharmacy details, address, and contact information
- Toggle Open/Closed status, visible across the dashboard

---

## 🔔 Real-Time Notifications

Automatic alerts for:

- New prescriptions
- Low stock levels
- Out-of-stock medicines
- Expiring inventory

Ensures the pharmacy team never misses key operational events.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Backend & Database:** Firebase (Auth, Firestore)
- **AI Agents:** Custom server-side agent flows
- **Real-Time Automation:** Firebase Cloud Functions

---

## ⚙ Getting Started

---

### 1. Prerequisites

- Node.js v18+
- Active Firebase project

---

### 2. Setup Instructions

#### Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-name>
```
