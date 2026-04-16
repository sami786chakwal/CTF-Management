// pages/api/settings.js
import { kv } from '@vercel/kv';

const SETTINGS_KEY = "ctf_settings_v3";

export const DEFAULT_SETTINGS = {
  adminUsername: "admin",
  adminPassword: "ctf2026",
  eventName: "CTF 2026 — Riphah University",
  venue: "Computer Lab, Block A",
  day1Label: "Day 1",
  day2Label: "Day 2",
  numberOfDays: 2,
  totalTables: 20,
  day1Date: "",
  day2Date: "",
  eventDate: "Wed, 22 April 2026 | 10:00 AM – 2:00 PM",
  eventVenue: "Block A (A-114), Riphah I-14 Campus",
  lastRegisterDate: "20th April, 2026",
  platformUrl: "https://ctf.stealthwormctf.sbs",
  discordUrl: "https://discord.com/invite/89tDPnqnqN",
  smtpEmail: "",
  smtpPassword: "",
  ctfdUrl: "",
  ctfdAdminToken: "",
  ctfdTeamPrefix: "team",
  emailSubjectCredentials: "Your CTFd Login for {{eventName}}",
  emailBodyCredentials: "Hello {{leaderName}},\n\nYour team has been successfully registered for {{eventName}}.\nUse the login below to access the CTFd platform:\n\nUsername: {{ctfdUsername}}\nPassword: {{ctfdPassword}}\nPlatform: {{ctfdUrl}}\n\nLogin with your provided credentials and keep them safe.\n\nGood luck,\nEvent Team",
  emailSubjectConfirm: "🎉 Registration Confirmed — {{teamName}} | {{eventName}}",
  emailBodyConfirm: "Dear {{leaderName}},\n\nYour team has been registered successfully for {{eventName}}.\n\nBest regards,\nEvent Team",
  emailSubjectReminder: "⚡ Reminder — {{eventName}} Tomorrow!",
  emailBodyReminder: "Dear {{leaderName}},\n\nDon't forget! {{eventName}} is happening tomorrow.\n\nPlease arrive on time and bring your student ID.\n\nGood luck!",
  events: [] // New field for events
};

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const settings = (await kv.get(SETTINGS_KEY)) || {};
      return res.status(200).json({ ...DEFAULT_SETTINGS, ...settings });
    }

    if (req.method === "POST") {
      const updated = { ...DEFAULT_SETTINGS, ...(await kv.get(SETTINGS_KEY) || {}), ...req.body };
      await kv.set(SETTINGS_KEY, updated);
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Settings API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}