# 🚂 RailTrack — India's Railway Food Accountability Platform

<div align="center">

![RailTrack Banner](https://img.shields.io/badge/RailTrack-Railway%20Food%20Accountability-0B1F3A?style=for-the-badge&logo=train&logoColor=F5A623)

**Know the price. Pay the right way. Report instantly.**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-railtrack--frontend.vercel.app-F5A623?style=for-the-badge)](https://railtrack-frontend.vercel.app/)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Powered by Razorpay](https://img.shields.io/badge/Payments-Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br />

> Built for the **Razorpay AI Buildathon** — A full-stack civic tech platform that protects India's 13 million daily railway passengers from food vendor overcharging through AI-powered payments, autonomous refunds, and real-time complaint routing.

</div>

---

## 🎯 The Problem

Every day, millions of train passengers across India are overcharged by food vendors. A ₹14 Rail Neer water bottle sold for ₹20. A ₹80 Veg Thali billed at ₹130. Vendors demanding cash to avoid accountability. And no fast, effective way to report or get justice.

**RailTrack fixes this.**

---

## 🌟 Live Demo

🔗 **[https://railtrack-frontend.vercel.app/](https://railtrack-frontend.vercel.app/)**


---

## ✨ Key Features

### 🔍 Vendor Price Transparency
- Search any train number → see all active vendors, coaches, and items
- Every item shows **official IRCTC MRP vs vendor's listed price**
- Overpriced items automatically flagged in red
- Public — no login required

### 💳 Razorpay UPI Payments
- Each vendor gets a **unique QR code** linked to their vendor profile
- Passengers scan QR → select items → pay via UPI
- Every transaction logged with receipt, vendor ID, train number, timestamp
- **Cash payments strictly prohibited** — cash demand triggers instant priority complaint

### 🤖 Autonomous AI Refund System *(Razorpay AI Buildathon Feature)*
- Passenger attaches their Razorpay Payment ID to an overcharging complaint
- AI (Groq LLaMA3) analyzes the transaction against official IRCTC MRP
- Razorpay gateway verifies the payment amount
- **Refund is automatically processed** within seconds if overcharge confirmed
- Confidence threshold: 85% — no false refunds
- Full audit trail stored in database

### 🎤 AI Voice Complaint Filing
- Tap microphone → speak complaint in **Hindi or English**
- Groq LLaMA3 parses the transcript and **auto-fills the form**
- Recognizes train numbers, coach codes, vendor names, item names, prices
- Built for India's 1.4 billion — no typing needed

### 🚨 Real-Time Complaint Routing
- Complaint filed → NTES API fetches live train position
- Nearest upcoming station identified automatically
- Complaint emailed to **Station Master + RPF** within 60 seconds
- Cash demand complaints → also routed to **GRP (Government Railway Police)**
- Passenger receives reference ID instantly

### 📊 Public Transparency Dashboard
- Zone-wise complaint heatmap across all 18 railway zones
- Top complained vendors — publicly visible
- Blacklisted vendor registry
- Resolution rate stats
- **No login required** — full public accountability

### 🛡️ Multi-Role Accountability System
- **Passenger** — search, pay, file complaint, track status
- **Vendor** — manage inventory, display QR, view complaints
- **Station Admin** — acknowledge, escalate to RPF, resolve with mandatory notes
- **Super Admin** — approve vendors, re-open fake resolutions, full audit oversight

### ✅ Anti-Corruption Safeguards
- Station admins **must write detailed resolution notes** (min 20 chars)
- All status changes permanently logged with admin account ID + timestamp
- Super Admin can **re-open suspicious resolutions**
- Short/fake resolution notes flagged automatically in audit trail

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + Vite |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |
| **Payments** | Razorpay Web SDK |
| **AI** | Groq LLaMA3 (voice parsing + refund analysis) |
| **Notifications** | React Hot Toast |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 📱 Application Pages

```
Public (no login)
├── /                    → Home — search, stats, how it works
├── /search              → Train vendor search by train number
├── /vendor/:id          → Vendor profile + price list
├── /pay/:vendorId       → UPI payment page (Razorpay)
├── /receipt/:id         → Payment receipt
├── /complaint           → File complaint (voice + AI autofill)
├── /track               → Track complaint by reference ID
└── /transparency        → Public accountability dashboard

Auth
├── /login               → Role-based login
├── /register            → Passenger registration
├── /vendor-register     → Vendor registration (pending approval)
└── /vendor-register-success

Dashboards (protected)
├── /dashboard           → Passenger: complaints + payment history
├── /vendor-dashboard    → Vendor: QR code + inventory manager
├── /station-admin       → Station Admin: complaints + escalation
└── /super-admin         → Super Admin: full platform oversight
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- RailTrack Backend running (see [backend repo](https://github.com/chandrakant-t/railtrack-backend))

### Installation

```bash
# Clone the repo
git clone https://github.com/chandrakant-t/railtrack-frontend.git
cd railtrack-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

For production:
```env
VITE_API_URL=https://railtrack-backend-e1na.onrender.com/api
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🤖 AI Features (Razorpay Buildathon)

### 1. Autonomous AI Refund Flow

```
Passenger paid ₹20 for ₹14 water via Razorpay
         ↓
Files complaint → attaches Payment ID
         ↓
RailTrack checks Payment ID in own DB (fraud guard)
         ↓
Razorpay API verifies payment is captured
         ↓
Groq LLaMA3 analyzes: "Is ₹20 > IRCTC MRP ₹14?"
         ↓
Confidence ≥ 85% → Razorpay refund API called
         ↓
₹6 refunded to passenger's account automatically
         ↓
Complaint filed + refund logged in DB
```

### 2. Voice Complaint Filing

```
Passenger speaks in Hindi/English
"Train 12951 mein vendor ne paani 20 rupaye mein diya"
         ↓
Web Speech API captures audio
         ↓
Transcript sent to Groq LLaMA3
         ↓
AI extracts: train_number=12951, item=water, charged_price=20
         ↓
Form auto-filled → passenger reviews → submits
```

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| 🏠 Home | Hero search, live stats, how it works |
| 🔍 Train Search | Vendor cards with Pay + View buttons |
| 💳 Pay Vendor | Item selection + Razorpay UPI checkout |
| 🧾 Receipt | Itemized receipt with report issue link |
| 🚨 File Complaint | Voice input + AI autofill + refund trigger |
| 📊 Transparency | Public heatmap + top offenders |
| 🛡️ Station Admin | Complaints with escalation + mandatory notes |
| 👑 Super Admin | Full platform control + vendor approvals |

---

## 📁 Project Structure

```
src/
├── api/                 # Axios API calls (typed)
│   ├── axios.ts         # Base axios instance + interceptors
│   ├── auth.api.ts
│   ├── complaint.api.ts
│   ├── vendor.api.ts
│   ├── inventory.api.ts
│   ├── payment.api.ts
│   └── admin.api.ts
│
├── components/
│   └── layout/
│       ├── Navbar.tsx
│       └── ProtectedRoute.tsx
│
├── context/
│   └── AuthContext.tsx   # JWT auth + role management
│
├── pages/
│   ├── public/           # No auth required
│   ├── passenger/        # Passenger dashboard
│   ├── vendor/           # Vendor dashboard
│   └── admin/            # Station + Super admin
│
├── utils/
│   ├── constants.ts      # Roles, status enums
│   └── helpers.ts        # Currency, date, color formatters
│
└── App.tsx               # All routes defined here
```

---

## 🌍 Impact

| Metric | Value |
|--------|-------|
| Daily railway passengers in India | 13 million |
| Trains running daily | 13,000+ |
| Licensed food vendors (IRCTC) | 10,000+ |
| Avg overcharge per item | ₹5–50 |
| Complaint resolution target | < 60 seconds to route |

---

## 🏆 Razorpay AI Buildathon

This project was built for the **Razorpay AI Buildathon** demonstrating:

- ✅ **Razorpay Payments** — UPI QR per vendor, order creation, payment verification
- ✅ **Razorpay Refund API** — Autonomous partial refund on overcharge confirmation
- ✅ **AI Integration** — Groq LLaMA3 for dispute analysis + voice parsing
- ✅ **Real-world civic use case** — Protecting 13M daily passengers
- ✅ **Full-stack production deployment** — Live and working

---

## 📄 License

MIT License — built with ❤️ for India's railway passengers.

---

## 👨‍💻 Built By

**Chandrakant Nilesh Kumar Trivedi**
BCA Student — Chitkara University
IMUN Campus Ambassador

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat&logo=linkedin)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github)](https://github.com/chandrakant-t)

---

<div align="center">

**🚂 RailTrack — Every rupee traced. Every complaint heard. Every vendor accountable.**

[Live Demo](https://railtrack-frontend.vercel.app/) · [Backend Repo](https://github.com/chandrakant-t/railtrack-backend) · [File an Issue](https://github.com/chandrakant-t/railtrack-frontend/issues)

</div>
