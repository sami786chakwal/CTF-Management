// pages/api/import-teams.js
import { importTeamsAPI } from "../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { teams } = req.body;

    if (!teams || !Array.isArray(teams)) {
      return res.status(400).json({ error: "Missing or invalid teams array" });
    }

    const importedTeams = await importTeamsAPI(teams);

    res.status(200).json({
      success: true,
      message: `Imported ${importedTeams.length} teams successfully`,
      importedCount: importedTeams.length,
      teams: importedTeams
    });
  } catch (error) {
    console.error("Import teams API error:", error);
    res.status(500).json({ error: error.message || "Failed to import teams" });
  }
}