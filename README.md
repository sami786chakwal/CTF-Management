# CTF Management System

A professional event operations dashboard for running university or community Capture The Flag competitions. The system centralizes registration imports, team administration, attendance, food tracking, seating, reporting, email communication, and CTFd account provisioning in a single Next.js application.

## Overview

This project is designed for organizers who need to manage an in-person CTF from registration through check-in. It provides a realtime admin console backed primarily by Firebase Realtime Database, with operational tools for handling teams, participants, communication, logistics, and reporting.

## Core Features

### Registration and Team Data

- Import teams from Google Forms CSV exports.
- Preview incoming CSV files before import.
- Skip duplicate teams automatically using `Team Name + Leader SAP ID`.
- Store leader and player details, SAP IDs, emails, phone numbers, semester, campus, and payment slip links.
- Track notes and custom team metadata inside the admin panel.
- Support direct Google Forms auto-sync at a configurable interval.

### Team Operations

- Search teams by team name, leader, SAP, email, or table number.
- Filter by fee status, attendance state, and campus.
- Sort by newest registration, team name, or table number.
- Edit table assignments and internal notes per team.
- Remove teams individually or clear the full dataset from settings.

### Attendance Management

- Mark team-level attendance for Day 1 and Day 2.
- Track per-player attendance for leader, player 2, and player 3.
- Record check-in times automatically.
- Show absent-member lists per day.
- Reverse attendance actions when corrections are needed.
- Support one-day and two-day events with configurable labels and dates.

### Food Distribution

- Track meal collection separately for each event day.
- Prevent food distribution before a team is checked in.
- Reverse food distribution marks when needed.
- Use a dedicated food-distribution view for quick desk operations.

### Seating and Venue Control

- Assign teams to physical table numbers.
- Configure the total number of available tables.
- Generate print-ready table cards and attendance cards for on-site use.

### Communication

- Send confirmation emails, reminder emails, and CTFd credential emails.
- Use Gmail SMTP with app passwords.
- Save default SMTP credentials in settings for faster operations.
- Customize email subjects and bodies with placeholders such as `{{teamName}}`, `{{leaderName}}`, `{{eventName}}`, `{{tableNumber}}`, `{{ctfdUsername}}`, and `{{ctfdPassword}}`.
- Send personalized credential emails to each registered team member.

### CTFd Integration

- Create teams on CTFd directly from the admin panel.
- Register team members on CTFd and attach them to the correct team.
- Persist generated usernames and passwords for later retrieval.
- Set the team captain automatically when possible.
- Remove saved CTFd registrations and optionally delete remote users/teams.
- Export a dedicated CTFd credentials report for organizer use.

### Reporting and Export

- Export all records to CSV.
- Generate print/PDF outputs for attendance.
- Generate print/PDF outputs for food distribution.
- Generate print/PDF outputs for absent members.
- Generate print/PDF outputs for table cards.
- Generate print/PDF outputs for attendance cards.
- Generate print/PDF outputs for CTFd credentials.
- Generate print/PDF outputs for the full player list.
- Generate print/PDF outputs for the complete team registry.

### Realtime Collaboration

- Sync teams and settings across multiple admin sessions using Firebase Realtime Database.
- Reflect updates instantly without manual refresh in normal workflow.

### Event Configuration

- Configure event name, venue, day labels, dates, and number of days.
- Store event-specific metadata for email templates and credentials mailers.
- Manage a simple list of additional events from settings.
- Update admin login credentials from inside the application.

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Firebase Realtime Database
- Nodemailer
- PapaParse
- Lucide React
- React Hot Toast
- Vercel-ready deployment configuration

## Project Structure

```text
ctf-system/
|-- components/
|   |-- Dashboard.jsx
|   |-- EmailModal.jsx
|   |-- FoodView.jsx
|   |-- ImportView.jsx
|   |-- LoginPage.jsx
|   |-- Reports.jsx
|   |-- SettingsView.jsx
|   |-- TableMap.jsx
|   `-- TeamsView.jsx
|-- lib/
|   |-- firebase.js
|   `-- store.js
|-- pages/
|   |-- api/
|   |   |-- ctfd-register.js
|   |   |-- ctfd-unregister.js
|   |   |-- google-sync.js
|   |   |-- import-teams.js
|   |   |-- send-email.js
|   |   |-- settings.js
|   |   `-- teams.js
|   `-- index.js
|-- styles/
|   `-- globals.css
|-- package.json
`-- vercel.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Create a `.env.local` file in `ctf-system/` and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Start the application

```bash
npm run dev
```

Open `http://localhost:3000`.

## Default Login

```text
Username: admin
Password: ctf2026
```

Change these credentials immediately from the Settings view after first login.

## Firebase Setup

Firebase is the primary datastore for teams and settings in the current application flow.

### Required steps

1. Create a Firebase project.
2. Enable Realtime Database.
3. Create a web app and copy its config into `.env.local`.
4. Add the same environment variables to your hosting platform for production.

### Development database rules

Use strict rules in production. For local testing, a temporary open setup may look like this:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Deployment

### Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add all `NEXT_PUBLIC_FIREBASE_*` environment variables.
4. Deploy.

### Notes

- The repository includes `vercel.json` and is structured for straightforward Next.js deployment.
- Some legacy API routes reference Vercel KV, but the active UI data flow is driven by Firebase-backed reads and writes. Treat Firebase configuration as required for the current app experience.

## Operational Workflows

### Import registration data

1. Export responses from Google Forms as CSV or provide a published CSV URL.
2. Open the `Import CSV` tab to upload a file manually.
3. Review the preview to see new teams and duplicates.
4. Confirm the import.

### Enable Google Forms auto-sync

1. Open `Settings`.
2. Add the published Google Sheets CSV export URL.
3. Set a sync interval in minutes.
4. Enable auto-sync.
5. Use `Test Fetch Now` or `Sync Now` to verify the integration.

### Check in teams

1. Open the `Teams` tab.
2. Mark team attendance by day.
3. Expand a team row to adjust per-player attendance and review absent members.
4. Use recorded check-in times for auditability.

### Distribute food

1. Open the `Food` tab for faster service-desk workflow.
2. Search the team.
3. Mark food collection for the relevant day.

### Register teams on CTFd

1. Add `CTFd Base URL` and `CTFd Admin Token` in `Settings`.
2. Open a team row in `Teams`.
3. Click the `CTFd` action to create the team and register members.
4. Use the key/email actions to send credentials afterward.

### Send email

1. Configure Gmail address and app password in `Settings`.
2. Open the email modal for a team.
3. Choose `Confirmation`, `Day 2 Reminder`, or `CTFd Credentials`.
4. Review the generated preview and send.

### Export reports

1. Open the `Reports` tab.
2. Choose the required report.
3. Click `Print / PDF`.
4. In the browser print dialog, select `Save as PDF` if needed.

## CSV Format

The importer is built for Google Forms CSV exports and expects these primary columns:

- `Timestamp`
- `CAMPUS`
- `Team Name`
- `Leader Name`
- `Leader SAP ID`
- `Leader Gmail`
- `Leader Contact Number`
- `Player 2 Name`
- `Player 2 SAP ID`
- `Player 2 Gmail`
- `Player 3 Name`
- `Player 3 SAP ID`
- `Player 3 Gmail`
- `Semester`

Additional columns are tolerated. Registration fee slip links are also detected when present.

## Email Placeholders

Supported placeholders in configurable templates include:

- `{{teamName}}`
- `{{leaderName}}`
- `{{memberName}}`
- `{{eventName}}`
- `{{tableNumber}}`
- `{{ctfdUsername}}`
- `{{ctfdPassword}}`
- `{{ctfdUrl}}`

## Security Notes

- Replace the default admin credentials before production use.
- Use Gmail app passwords instead of your main Google account password.
- Do not expose your CTFd admin token publicly.
- Lock down Firebase Realtime Database rules before production rollout.
- Treat exported credentials reports and emailed credentials as sensitive operational material.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Recommended Improvements Before Production

- Add authenticated server-side access controls for API routes.
- Replace permissive Firebase rules with scoped rules.
- Move sensitive settings away from client-visible storage patterns.
- Add audit logging for organizer actions.
- Add automated tests for import, reporting, and CTFd integration flows.

## License

Add your preferred license before public distribution.
