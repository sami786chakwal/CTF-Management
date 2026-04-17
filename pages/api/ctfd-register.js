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
    memberIds,
    action,
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

  const ensureNumericId = (id) => {
    if (typeof id === "number") return id;
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? id : parsed;
  };

  /**
   * Add a single user to a team using the correct CTFd endpoint:
   * POST /api/v1/teams/{teamId}/members  { user_id: userId }
   *
   * Falls back to PATCH /api/v1/users/{userId} { team_id: teamId }
   * in case the instance is an older CTFd version.
   */
  const addUserToTeam = async (teamId, userId) => {
    const numericTeamId = ensureNumericId(teamId);
    const numericUserId = ensureNumericId(userId);

    // Primary method: POST /api/v1/teams/{id}/members
    const primaryResp = await fetch(`${normalizedUrl}/api/v1/teams/${numericTeamId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${adminToken}`,
      },
      body: JSON.stringify({ user_id: numericUserId }),
    });

    const primaryData = await primaryResp.json().catch(() => ({}));
    if (primaryResp.ok) {
      console.log(`[TEAM] Added user ${numericUserId} to team ${numericTeamId} via POST /members`);
      return { ok: true, data: primaryData };
    }

    console.warn(
      `[TEAM] POST /members failed (${primaryResp.status}), falling back to PATCH /users/${numericUserId}:`,
      primaryData.message || primaryData.error
    );

    // Fallback: PATCH /api/v1/users/{userId}
    const fallbackResp = await fetch(`${normalizedUrl}/api/v1/users/${numericUserId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${adminToken}`,
      },
      body: JSON.stringify({ team_id: numericTeamId }),
    });

    const fallbackData = await fallbackResp.json().catch(() => ({}));
    if (fallbackResp.ok) {
      console.log(`[TEAM] Added user ${numericUserId} to team ${numericTeamId} via PATCH /users fallback`);
    } else {
      console.error(
        `[TEAM] Both methods failed for user ${numericUserId} → team ${numericTeamId}:`,
        fallbackData.message || fallbackData.error
      );
    }
    return { ok: fallbackResp.ok, data: fallbackData };
  };

  try {
    // ============================================
    // ACTION: Add members to existing team
    // ============================================
    if (action === "addMembersToTeam" || (memberIds && memberIds.length > 0 && teamId && !createTeam)) {
      if (!teamId) {
        return res.status(400).json({ error: "Missing teamId for adding members to team" });
      }
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ error: "Missing or invalid memberIds array" });
      }

      const results = { success: true, added: [], failed: [] };

      for (const memberId of memberIds) {
        try {
          const result = await addUserToTeam(teamId, memberId);
          if (result.ok) {
            results.added.push({ userId: memberId, data: result.data });
          } else {
            results.failed.push({
              userId: memberId,
              error: result.data.message || result.data.error || "Unknown error",
            });
          }
        } catch (err) {
          results.failed.push({ userId: memberId, error: err.message });
        }
      }

      if (results.failed.length > 0) {
        return res.status(207).json({
          success: false,
          message: `Successfully added ${results.added.length} members, but ${results.failed.length} failed`,
          ...results,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Successfully added ${results.added.length} members to team`,
        ...results,
      });
    }

    // ============================================
    // ACTION: Set team captain
    // ============================================
    if (action === "setCaptain" || setCaptain) {
      if (!teamId || !captainId) {
        return res.status(400).json({ error: "Missing teamId or captainId for CTFd captain assignment" });
      }

      const numericTeamId = ensureNumericId(teamId);
      const numericCaptainId = ensureNumericId(captainId);

      console.log(`[CAPTAIN] Setting captain ${numericCaptainId} for team ${numericTeamId}`);

      const patchResponse = await fetch(`${normalizedUrl}/api/v1/teams/${numericTeamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${adminToken}`,
        },
        body: JSON.stringify({ captain_id: numericCaptainId }),
      });

      const patchData = await patchResponse.json().catch(() => ({}));

      if (patchResponse.status === 404) {
        console.error(`[CAPTAIN ERROR] Team ID ${numericTeamId} not found.`, patchData);
        return res.status(404).json({
          error: `Team with ID ${numericTeamId} not found on CTFd. Please verify the team ID is correct.`,
          data: patchData,
          teamId: numericTeamId,
        });
      }

      if (!patchResponse.ok) {
        const message = patchData.message || patchData.error || `CTFd responded with ${patchResponse.status}`;
        console.error(`[CAPTAIN ERROR] Failed to set captain:`, message);
        return res.status(500).json({ error: message, data: patchData });
      }

      console.log(`[CAPTAIN] Successfully set captain for team ${numericTeamId}`);
      return res.status(200).json({ success: true, data: patchData });
    }

    // ============================================
    // ACTION: Verify team exists
    // ============================================
    if (action === "checkTeamId" || checkTeamId) {
      if (!teamId) {
        return res.status(400).json({ error: "Missing teamId for CTFd team verification" });
      }

      const numericTeamId = ensureNumericId(teamId);
      const verifyResponse = await fetch(`${normalizedUrl}/api/v1/teams/${numericTeamId}`, {
        method: "GET",
        headers: { Authorization: `Token ${adminToken}` },
      });

      const verifyData = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) {
        let message = verifyData.message || `CTFd responded with ${verifyResponse.status}`;
        if (verifyData.error) {
          message = typeof verifyData.error === "string" ? verifyData.error : JSON.stringify(verifyData.error);
        }
        if (!message || message === `CTFd responded with ${verifyResponse.status}`) {
          message = JSON.stringify(verifyData);
        }
        return res.status(500).json({ error: message, data: verifyData });
      }

      return res.status(200).json({ success: true, data: verifyData });
    }

    // ============================================
    // ACTION: Create team (optionally with members and captain)
    // ============================================
    if (action === "createTeamWithMembers" || createTeam) {
      if (!teamName) {
        return res.status(400).json({ error: "Missing teamName for CTFd team creation" });
      }

      console.log(`[TEAM] Creating team: ${teamName}`);

      // Step 1: Create the team
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
          message = typeof teamData.error === "string" ? teamData.error : JSON.stringify(teamData.error);
        }
        if (!message || message === `CTFd responded with ${teamResponse.status}`) {
          message = JSON.stringify(teamData);
        }
        return res.status(500).json({ error: message, data: teamData });
      }

      let createdTeamId = extractCtfdId(teamData);
      createdTeamId = ensureNumericId(createdTeamId);

      console.log(`[TEAM] Team created with ID: ${createdTeamId}`);

      // Step 2: Fallback team lookup if ID not found
      if (!createdTeamId) {
        const tryLookup = async (queryKey) => {
          const listResp = await fetch(
            `${normalizedUrl}/api/v1/teams?${queryKey}=${encodeURIComponent(teamName)}`,
            { method: "GET", headers: { Authorization: `Token ${adminToken}` } }
          );
          if (!listResp.ok) return null;
          const listData = await listResp.json().catch(() => ({}));
          const items = Array.isArray(listData) ? listData : Array.isArray(listData.data) ? listData.data : [];
          return items.find((item) => item.name === teamName || item.team_name === teamName);
        };

        try {
          const match =
            (await tryLookup("search").catch(() => null)) || (await tryLookup("q").catch(() => null));
          if (match) {
            createdTeamId = ensureNumericId(extractCtfdId(match));
            console.log(`[TEAM] Found team via fallback lookup: ${createdTeamId}`);
          }
        } catch (lookupError) {
          console.warn("Fallback team lookup failed:", lookupError);
        }
      }

      if (!createdTeamId) {
        return res.status(500).json({
          error: "Team was created on CTFd, but its ID could not be resolved. Please retry or check CTFd logs.",
          data: teamData,
        });
      }

      // Step 3: Add members to the team using correct endpoint
      const addMembersResults = { added: [], failed: [] };

      if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
        console.log(`[TEAM] Adding ${memberIds.length} members to team ${createdTeamId}`);
        for (const memberId of memberIds) {
          try {
            const result = await addUserToTeam(createdTeamId, memberId);
            if (result.ok) {
              addMembersResults.added.push({ userId: memberId, data: result.data });
            } else {
              addMembersResults.failed.push({
                userId: memberId,
                error: result.data.message || result.data.error || "Unknown error",
              });
            }
          } catch (err) {
            addMembersResults.failed.push({ userId: memberId, error: err.message });
            console.error(`[TEAM] Error adding user ${memberId}:`, err.message);
          }
        }
      }

      // Step 4: Set captain if provided
      let captainResult = null;
      if (captainId && createdTeamId) {
        const numericCaptainId = ensureNumericId(captainId);
        console.log(`[TEAM] Setting captain ${numericCaptainId} for team ${createdTeamId}`);
        try {
          const captainResponse = await fetch(`${normalizedUrl}/api/v1/teams/${createdTeamId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${adminToken}`,
            },
            body: JSON.stringify({ captain_id: numericCaptainId }),
          });

          const captainData = await captainResponse.json().catch(() => ({}));
          captainResult = {
            success: captainResponse.ok,
            data: captainData,
            error: captainResponse.ok ? undefined : captainData.message || captainData.error,
          };
          if (captainResponse.ok) {
            console.log(`[TEAM] Captain set successfully`);
          } else {
            console.warn(`[TEAM] Failed to set captain:`, captainData.message || captainData.error);
          }
        } catch (err) {
          captainResult = { success: false, error: err.message };
          console.error(`[TEAM] Error setting captain:`, err.message);
        }
      }

      return res.status(200).json({
        success: true,
        data: teamData,
        teamId: createdTeamId,
        members: addMembersResults,
        captain: captainResult,
      });
    }

    // ============================================
    // ACTION: Register single user (default)
    // ============================================
    if (!username || !password || !email || !name) {
      return res.status(400).json({ error: "Missing required fields for CTFd user registration" });
    }

    const endpoint = `${normalizedUrl}/api/v1/users`;
    // Build registration body.
    // CTFd field reference:
    //   name     = public display name shown on scoreboard (e.g. "Hanan Hamza")
    //   username = login handle / CTFd username (e.g. "hanan_hamza_158")
    const body = {
      name,       // real full name — shown publicly on CTFd scoreboard
      username,   // generated CTFd handle — used for login
      email,
      password,
    };

    console.log(`[USER] Registering user: ${username} (display name: ${name})`);

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
        message = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
      }
      if (!message || message === `CTFd responded with ${response.status}`) {
        message = JSON.stringify(data);
      }
      console.error(`[USER] Registration failed:`, message);
      return res.status(500).json({ error: message, data });
    }

    const userId = ensureNumericId(extractCtfdId(data));
    console.log(`[USER] User registered with ID: ${userId} (username: ${username}, name: ${name})`);

    // Step 1b: Explicitly PATCH the display name to ensure it shows correctly on CTFd.
    // Some CTFd versions override 'name' with 'username' after creation.
    if (userId && name) {
      try {
        const nameResp = await fetch(`${normalizedUrl}/api/v1/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${adminToken}`,
          },
          body: JSON.stringify({ name }),
        });
        const nameData = await nameResp.json().catch(() => ({}));
        if (nameResp.ok) {
          console.log(`[USER] Display name confirmed: "${name}" for user ${userId}`);
        } else {
          console.warn(`[USER] Could not patch display name for user ${userId}:`, nameData.message || nameData.error);
        }
      } catch (nameErr) {
        console.warn(`[USER] Display name patch failed for user ${userId}:`, nameErr.message);
      }
    }

    // Step 2: Attach user to team using the correct CTFd endpoint
    if (teamId && userId) {
      const result = await addUserToTeam(teamId, userId);
      if (!result.ok) {
        console.warn(`[USER] Warning: user ${userId} registered but could not be added to team ${teamId}`);
      }
    }

    return res.status(200).json({ success: true, data, userId });
  } catch (error) {
    console.error("CTFd registration error:", error);
    return res.status(500).json({ error: error.message || "Failed to register user on CTFd" });
  }
}