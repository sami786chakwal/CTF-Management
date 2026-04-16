// pages/api/teams.js
import { kv } from '@vercel/kv';

const TEAMS_KEY = "ctf_teams_v3";
const isLocal = process.env.NODE_ENV === "development";

let localTeams = [];

export default async function handler(req, res) {
  try {
    if (isLocal) {
      // LOCAL DEVELOPMENT - uses localStorage fallback
      if (req.method === "GET") {
        if (typeof window !== "undefined") {
          localTeams = JSON.parse(localStorage.getItem(TEAMS_KEY) || "[]");
        }
        return res.status(200).json(localTeams);
      }

      if (req.method === "POST") {
        const payload = req.body;
        localTeams = Array.isArray(payload)
          ? [...localTeams, ...payload]
          : [...localTeams, payload];
        if (typeof window !== "undefined") {
          localStorage.setItem(TEAMS_KEY, JSON.stringify(localTeams));
        }
        return res.status(200).json(localTeams);
      }

      if (req.method === "PUT") {
        const { id, patch } = req.body;
        localTeams = localTeams.map(t => t.id === id ? { ...t, ...patch } : t);
        if (typeof window !== "undefined") {
          localStorage.setItem(TEAMS_KEY, JSON.stringify(localTeams));
        }
        return res.status(200).json(localTeams);
      }

      if (req.method === "DELETE") {
        const { id } = req.body;
        localTeams = localTeams.filter(t => t.id !== id);
        if (typeof window !== "undefined") {
          localStorage.setItem(TEAMS_KEY, JSON.stringify(localTeams));
        }
        return res.status(200).json(localTeams);
      }
    } 
    else {
      // PRODUCTION - uses Vercel KV
      if (req.method === "GET") {
        const teams = (await kv.get(TEAMS_KEY)) || [];
        return res.status(200).json(teams);
      }

      if (req.method === "POST") {
        const payload = req.body;
        const current = (await kv.get(TEAMS_KEY)) || [];
        const updated = Array.isArray(payload)
          ? [...current, ...payload]
          : [...current, payload];
        await kv.set(TEAMS_KEY, updated);
        return res.status(200).json(updated);
      }

      if (req.method === "PUT") {
        const { id, patch } = req.body;
        const current = (await kv.get(TEAMS_KEY)) || [];
        const updated = current.map((t) =>
          t.id === id ? { ...t, ...patch } : t
        );
        await kv.set(TEAMS_KEY, updated);
        return res.status(200).json(updated);
      }

      if (req.method === "DELETE") {
        const { id } = req.body;
        const current = (await kv.get(TEAMS_KEY)) || [];
        const updated = current.filter((t) => t.id !== id);
        await kv.set(TEAMS_KEY, updated);
        return res.status(200).json(updated);
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Teams API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}