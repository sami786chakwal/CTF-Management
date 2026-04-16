# ⚡ CTF Management System

A complete, production-ready CTF event management system built with **Next.js** — deployable on **Vercel** in minutes

---

## Features

| Feature | Description |
|---|---|
| 🔐 **Login** | Username/password protected admin console |
| 📥 **CSV Import** | Import Google Form responses; duplicates auto-skipped |
| 👥 **Team Management** | Search by SAP, name, email, table number |
| ✅ **Attendance** | Day 1 & Day 2 check-in with timestamp, fully reversible |
| 🍽️ **Food Tracking** | Per-day food distribution — prevents double-serving |
| 🪑 **Table Map** | Visual seating chart, drag-assign teams to tables |
| 📧 **Email Sender** | Confirmation + reminder emails via Gmail SMTP App Password |
| 📄 **PDF Reports** | Print-to-PDF attendance, food, player list, full registry |
| ⚙️ **Settings** | Change event name, venue, dates, admin credentials, SMTP |
| 🔥 **Real-time Sync** | Firebase-powered real-time collaboration for multiple admins |
| 📅 **Event Management** | Create and manage multiple events with custom durations |

---

## Firebase Setup (Required for Real-time Features)

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Realtime Database

2. **Get Firebase Config**:
   - Go to Project Settings > General > Your apps
   - Click "Add app" > Web app
   - Copy the config object

3. **Environment Variables**:
   - Copy `.env.local` and fill in your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Database Rules** (Realtime Database)**:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

---

## Vercel Deployment

1. **Connect Repository**:
   - Push code to GitHub
   - Connect to Vercel
   - Add environment variables in Vercel dashboard

2. **Environment Variables in Vercel**:
   - Add all `NEXT_PUBLIC_FIREBASE_*` variables
   - Redeploy

3. **Vercel KV (Optional)**:
   - For additional persistence, set up Vercel KV
   - Add `KV_URL` and `KV_REST_API_URL` if using KV

---

## Quick Deploy on Vercel

### Step 1 — Get the code on GitHub

1. Create a new repository on [github.com](https://github.com)
2. Upload all files from this folder into it (keep the folder structure)

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy**
5. Done! Your app is live at `https://your-project.vercel.app`

No environment variables required — all settings are stored in the browser's localStorage.

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

---

## Default Login

```
Username: admin
Password: ctf2026
```

**Change these immediately** in Settings after first login.

---

## Gmail App Password Setup

The email sender uses **Gmail SMTP with App Passwords** (more secure than your real password):

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. **Security** → **2-Step Verification** (must be enabled first)
3. Scroll down → **App passwords**
4. Create a new app password for "Mail"
5. Copy the 16-character password (no spaces needed)
6. Paste it in **Settings → Default Gmail SMTP** or in the email modal

---

## CSV Format

The system expects Google Forms CSV export. Required columns:

- `Timestamp`
- `CAMPUS`
- `Team Name`
- `Leader Name`
- `Leader SAP ID`
- `Leader Gmail`
- `Leader Contact Number`
- `Player 2 Name`, `Player 2 SAP ID`, `Player 2 Gmail`
- `Player 3 Name`, `Player 3 SAP ID`, `Player 3 Gmail`
- `Semester`

Extra columns (payment slip link, Discord status, confirmation) are automatically parsed if present.

**Duplicate protection:** A team is considered duplicate if both `Team Name` AND `Leader SAP ID` match an existing entry. New data is always added; existing records are never overwritten.

---

## How to Generate PDF Reports

1. Go to **Reports** tab
2. Click **Print / PDF** on the desired report
3. In the browser print dialog → change **Destination** to **Save as PDF**
4. Click Save

Reports available:
- **Attendance Report** — all teams, Day 1 & Day 2 present/absent, check-in times, fee status
- **Food Distribution** — which teams received food each day
- **Full Player List** — individual rows for every player with SAP IDs
- **Complete Registry** — everything in one wide table

---

## Data Storage

All data lives in **browser localStorage** — no database needed.

- ✅ Works completely offline after first load
- ✅ Free to deploy
- ⚠️ Clearing browser data will erase all teams — **export CSV regularly** from Reports tab

---

## Attendance & Reversals

Any action can be reversed:
- Click an active **Day 1 / Day 2** button to toggle present → absent
- Click an active **Food D1 / D2** button to reverse food mark (requires confirmation)
- Fee verification toggle works the same way
- Table assignments can be cleared and reassigned anytime

---

## Project Structure

```
ctf-system/
├── pages/
│   ├── index.js          # Main app + routing
│   └── api/
│       └── send-email.js # Gmail SMTP endpoint
├── components/
│   ├── LoginPage.jsx     # Auth screen
│   ├── Dashboard.jsx     # Stats overview
│   ├── TeamsView.jsx     # Team list + management
│   ├── TableMap.jsx      # Visual seating chart
│   ├── EmailModal.jsx    # Email composer
│   ├── ImportView.jsx    # CSV import
│   ├── Reports.jsx       # PDF/CSV export
│   └── SettingsView.jsx  # App configuration
├── lib/
│   └── store.js          # Data helpers + CSV parser
├── styles/
│   └── globals.css       # Theme + cyber aesthetic
└── package.json
```

---

## Tech Stack

- **Next.js 14** — React framework with API routes
- **Tailwind CSS** — Utility-first styling
- **Nodemailer** — Gmail SMTP email sending
- **PapaParse** — CSV parsing
- **Lucide React** — Icons
- **React Hot Toast** — Notifications
