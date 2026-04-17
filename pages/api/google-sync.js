// pages/api/google-sync.js
import { loadSettings, importTeamsAPI, parseCSV, rowToTeam, getUniqueKey, loadTeams } from "../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Load settings to check if auto-sync is enabled
    const settings = await loadSettings();

    if (!settings.googleFormEnabled || !settings.googleFormURL) {
      return res.status(200).json({
        success: true,
        message: "Auto-sync disabled or no Google Form URL configured",
        synced: false
      });
    }

    // Fetch CSV from Google Forms
    const response = await fetch(settings.googleFormURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Form: ${response.status}`);
    }

    const csv = await response.text();

    // Parse CSV
    const rows = parseCSV(csv);
    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No valid data found in Google Form",
        synced: false
      });
    }

    // Get existing teams to check for duplicates
    const existingTeams = await loadTeams();
    const existingKeys = new Set(existingTeams.map(t => getUniqueKey(t)));

    // Filter new teams
    const newRows = rows.filter(r =>
      !existingKeys.has(getUniqueKey({
        teamName: r["Team Name"] || "",
        leader: { sap: r["Leader SAP ID"] || "" }
      }))
    );

    if (newRows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No new teams to import",
        synced: false,
        totalInForm: rows.length,
        newTeams: 0
      });
    }

    // Convert to team objects
    const toAdd = newRows.map((r, i) => rowToTeam(r, existingTeams.length + i));

    // Import teams
    const importedTeams = await importTeamsAPI(toAdd);

    res.status(200).json({
      success: true,
      message: `Successfully synced ${importedTeams.length} new teams from Google Form`,
      synced: true,
      totalInForm: rows.length,
      newTeams: importedTeams.length,
      teams: importedTeams
    });

  } catch (error) {
    console.error("Google sync API error:", error);
    res.status(500).json({
      error: error.message || "Failed to sync from Google Form",
      synced: false
    });
  }
}