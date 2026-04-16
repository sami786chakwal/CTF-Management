// pages/api/ctfd-register.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    ctfdUrl,
    adminToken,
    username,
    password,
    email,
    name,
    teamName,
    teamId,
    createTeam,
    checkTeamId,
    setCaptain,
    captainId,
  } = req.body;

  const normalizedUrl = ctfdUrl?.trim().replace(/\/+$/, "");
  if (!normalizedUrl || !adminToken) {
    return res.status(400).json({ error: "Missing required fields for CTFd registration" });
  }

  const extractCtfdId = (data) => {
    if (!data || typeof data !== "object") return null;
    return (
      data.id ||
      data.team_id ||
      data.user_id ||
      data?.team?.id ||
      data?.data?.id ||
      data?.data?.team?.id ||
      data?.data?.data?.id ||
      data?.data?.team_id ||
      null
    );
  };

  try {
    if (setCaptain) {
      if (!teamId || !captainId) {
        return res.status(400).json({ error: "Missing teamId or captainId for CTFd captain assignment" });
      }

      const patchResponse = await fetch(`${normalizedUrl}/api/v1/teams/${encodeURIComponent(teamId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${adminToken}`,
        },
        body: JSON.stringify({ captain_id: captainId }),
      });

      let patchData = await patchResponse.json().catch(() => ({}));
      if (!patchResponse.ok) {
        // Try alternative captain field name if CTFd expects it.
        const fallbackResponse = await fetch(`${normalizedUrl}/api/v1/teams/${encodeURIComponent(teamId)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${adminToken}`,
          },
          body: JSON.stringify({ captain: captainId }),
        });
        patchData = await fallbackResponse.json().catch(() => ({}));
        if (fallbackResponse.ok) {
          return res.status(200).json({ success: true, data: patchData });
        }
        const message = patchData.message || patchData.error || `CTFd responded with ${fallbackResponse.status}`;
        return res.status(500).json({ error: message, data: patchData });
      }

      return res.status(200).json({ success: true, data: patchData });
    }

    if (checkTeamId) {
      if (!teamId) {
        return res.status(400).json({ error: "Missing teamId for CTFd team verification" });
      }

      const verifyResponse = await fetch(`${normalizedUrl}/api/v1/teams/${encodeURIComponent(teamId)}`, {
        method: "GET",
        headers: {
          Authorization: `Token ${adminToken}`,
        },
      });

      const verifyData = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) {
        let message = verifyData.message || `CTFd responded with ${verifyResponse.status}`;
        if (verifyData.error) {
          message = typeof verifyData.error === 'string' ? verifyData.error : JSON.stringify(verifyData.error);
        }
        if (!message || message === `CTFd responded with ${verifyResponse.status}`) {
          message = JSON.stringify(verifyData);
        }
        return res.status(500).json({ error: message, data: verifyData });
      }

      return res.status(200).json({ success: true, data: verifyData });
    }

    if (createTeam) {
      if (!teamName) {
        return res.status(400).json({ error: "Missing teamName for CTFd team creation" });
      }

      const teamResponse = await fetch(`${normalizedUrl}/api/v1/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${adminToken}`,
        },
        body: JSON.stringify({
          name: teamName,
          password: Math.random().toString(36).slice(2, 18),
        }),
      });

      const teamData = await teamResponse.json().catch(() => ({}));
      if (!teamResponse.ok) {
        let message = teamData.message || teamData.errors || `CTFd responded with ${teamResponse.status}`;
        if (teamData.error) {
          message = typeof teamData.error === 'string' ? teamData.error : JSON.stringify(teamData.error);
        }
        if (!message || message === `CTFd responded with ${teamResponse.status}`) {
          message = JSON.stringify(teamData);
        }
        return res.status(500).json({ error: message, data: teamData });
      }

      const teamId = teamData.id || teamData?.team?.id || teamData?.data?.id || teamData?.data?.team?.id || teamData?.data?.data?.id || teamData?.data?.team_id || null;
      if (!teamId) {
        // fallback: try to locate the newly-created team by name
        const tryLookup = async (queryKey) => {
          const listResp = await fetch(`${normalizedUrl}/api/v1/teams?${queryKey}=${encodeURIComponent(teamName)}`, {
            method: "GET",
            headers: {
              Authorization: `Token ${adminToken}`,
            },
          });
          if (!listResp.ok) return null;
          const listData = await listResp.json().catch(() => ({}));
          const items = Array.isArray(listData) ? listData : Array.isArray(listData.data) ? listData.data : [];
          return items.find((item) => item.name === teamName || item.team_name === teamName || item.id === teamId);
        };

        try {
          const match = await tryLookup("search") || await tryLookup("q");
          if (match) {
            const fallbackId = match.id || match.team_id || null;
            if (fallbackId) {
              return res.status(200).json({
                success: true,
                data: {
                  ...teamData,
                  id: fallbackId,
                  team: { ...(teamData.team || {}), id: fallbackId },
                  data: { ...(teamData.data || {}), id: fallbackId },
                },
              });
            }
          }
        } catch (lookupError) {
          console.warn("Fallback team lookup failed:", lookupError);
        }

        return res.status(500).json({
          error: "Team was created on CTFd, but its ID could not be resolved. Please retry or check CTFd logs.",
          data: teamData,
        });
      }

      return res.status(200).json({ success: true, data: teamData });
    }

    if (!username || !password || !email || !name) {
      return res.status(400).json({ error: "Missing required fields for CTFd user registration" });
    }

    const endpoint = `${normalizedUrl}/api/v1/users`;
    const body = {
      name,
      email,
      password,
      username,
    };

    if (teamId) {
      body.team_id = teamId;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${adminToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      let message = data.message || `CTFd responded with ${response.status}`;
      if (data.error) {
        message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      }
      if (!message || message === `CTFd responded with ${response.status}`) {
        message = JSON.stringify(data);
      }
      return res.status(500).json({ error: message, data });
    }

    const userId = extractCtfdId(data);
    if (teamId && userId) {
      try {
        await fetch(`${normalizedUrl}/api/v1/users/${encodeURIComponent(userId)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${adminToken}`,
          },
          body: JSON.stringify({ team_id: teamId }),
        });
      } catch (attachError) {
        console.warn("Failed to attach CTFd user to team:", attachError);
      }
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("CTFd registration error:", error);
    return res.status(500).json({ error: error.message || "Failed to register user on CTFd" });
  }
}
