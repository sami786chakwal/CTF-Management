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
  smtpEmail: "",
  smtpPassword: "",
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