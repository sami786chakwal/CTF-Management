export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ctfdUrl, adminToken, userIds = [], teamId, deleteTeam } = req.body;
  const normalizedUrl = ctfdUrl?.trim().replace(/\/+$/, "");

  if (!normalizedUrl || !adminToken) {
    return res.status(400).json({ error: "Missing required CTFd URL or admin token" });
  }

  if ((!Array.isArray(userIds) || userIds.length === 0) && !teamId) {
    // No IDs to clean on platform, but allow local data clearing
    return res.status(200).json({ success: true, message: "No CTFd resources to clean" });
  }

  const parseJson = async (response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { raw: text };
    }
  };

  const errors = [];

  try {
    if (Array.isArray(userIds) && userIds.length > 0) {
      for (const userId of userIds) {
        try {
          const response = await fetch(`${normalizedUrl}/api/v1/users/${encodeURIComponent(userId)}`, {
            method: "DELETE",
            headers: {
              Authorization: `Token ${adminToken}`,
            },
          });
          if (!response.ok && response.status !== 404) {
            const data = await parseJson(response);
            const message = data.message || data.error || `CTFd responded with ${response.status}`;
            errors.push({ type: "user", id: userId, message });
          }
        } catch (error) {
          errors.push({ type: "user", id: userId, message: error.message });
        }
      }
    }

    if (deleteTeam && teamId) {
      try {
        const response = await fetch(`${normalizedUrl}/api/v1/teams/${encodeURIComponent(teamId)}`, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${adminToken}`,
          },
        });
        if (!response.ok && response.status !== 404) {
          const data = await parseJson(response);
          const message = data.message || data.error || `CTFd responded with ${response.status}`;
          errors.push({ type: "team", id: teamId, message });
        }
      } catch (error) {
        errors.push({ type: "team", id: teamId, message: error.message });
      }
    }

    if (errors.length) {
      return res.status(500).json({ success: false, errors });
    }

    return res.status(200).json({ success: true, deleted: { userIds, teamId: deleteTeam ? teamId : null } });
  } catch (error) {
    console.error("CTFd unregister error:", error);
    return res.status(500).json({ error: error.message || "Failed to unregister from CTFd" });
  }
}
