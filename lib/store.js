// lib/store.js
import { DEFAULT_SETTINGS } from "../pages/api/settings";
import { database, ref, onValue, set, update, remove } from './firebase';

export async function loadTeams() {
  try {
    const teamsRef = ref(database, 'teams');
    return new Promise((resolve) => {
      onValue(teamsRef, (snapshot) => {
        const data = snapshot.val();
        resolve(data ? Object.values(data) : []);
      }, { onlyOnce: true });
    });
  } catch (e) {
    console.warn("Using localStorage fallback for teams");
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("ctf_teams_v3") || "[]");
    }
    return [];
  }
}

export async function saveTeams(teams) {
  try {
    const teamsRef = ref(database, 'teams');
    const teamsObject = {};
    teams.forEach(team => {
      teamsObject[team.id] = team;
    });
    await set(teamsRef, teamsObject);
  } catch (e) {
    console.error("Save teams failed", e);
  }
}

export async function loadSettings() {
  try {
    const settingsRef = ref(database, 'settings');
    return new Promise((resolve) => {
      onValue(settingsRef, (snapshot) => {
        const data = snapshot.val();
        resolve({ ...DEFAULT_SETTINGS, ...data });
      }, { onlyOnce: true });
    });
  } catch {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ctf_settings_v3");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s) {
  try {
    console.log('Saving settings to Firebase:', s);
    const settingsRef = ref(database, 'settings');
    await set(settingsRef, s);
    console.log('Settings saved successfully to Firebase');
  } catch (e) {
    console.error("Save settings failed", e);
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("ctf_settings_v3", JSON.stringify(s));
    }
    throw e;
  }
}

export async function updateTeamAPI(id, patch) {
  try {
    console.log('Updating team in Firebase:', id, patch);
    const teamRef = ref(database, `teams/${id}`);
    await update(teamRef, patch);
    console.log('Team updated successfully in Firebase');
    // Firebase real-time listener will handle state updates
  } catch (e) {
    console.error("Update team failed", e);
    throw e;
  }
}

export async function deleteTeamAPI(id) {
  try {
    console.log('Deleting team from Firebase:', id);
    const teamRef = ref(database, `teams/${id}`);
    await remove(teamRef);
    console.log('Team deleted successfully from Firebase');
  } catch (e) {
    console.error("Delete team failed", e);
    throw e;
  }
}

export async function clearAllTeams() {
  try {
    console.log('Clearing all teams from Firebase');
    const teamsRef = ref(database, 'teams');
    await set(teamsRef, {});
    console.log('All teams cleared from Firebase');
  } catch (e) {
    console.error("Clear all teams failed", e);
    throw e;
  }
}

export async function importTeamsAPI(newTeams) {
  try {
    console.log('Importing teams to Firebase:', newTeams.length, 'teams');
    const teamsRef = ref(database, 'teams');
    const current = await loadTeams();
    const existingKeys = new Set(current.map(getUniqueKey));
    const uniqueNew = [];

    newTeams.forEach(team => {
      const key = getUniqueKey(team);
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        uniqueNew.push(team);
      }
    });

    const updated = [...current, ...uniqueNew];
    const teamsObject = {};
    updated.forEach(team => {
      teamsObject[team.id] = team;
    });
    await set(teamsRef, teamsObject);
    console.log('Teams imported successfully to Firebase:', uniqueNew.length, 'new teams added');
    return uniqueNew;
  } catch (e) {
    console.error("Import failed", e);
    throw e;
  }
}

// === Keep your original CSV functions below ===
export function parseCSV(text) {
  const lines = [];
  let cur = ""; 
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { inQ = !inQ; cur += c; }
    else if (c === '\n' && !inQ) { 
      lines.push(cur); 
      cur = ""; 
    }
    else { cur += c; }
  }
  if (cur) lines.push(cur);

  const parseRow = (line) => {
    const cells = []; 
    let cell = ""; 
    let inQ2 = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ2 = !inQ2; }
      else if (c === ',' && !inQ2) { 
        cells.push(cell.trim()); 
        cell = ""; 
      }
      else { cell += c; }
    }
    cells.push(cell.trim());
    return cells;
  };

  const nonEmpty = lines.filter(l => l.trim());
  if (nonEmpty.length < 2) return [];
  const headers = parseRow(nonEmpty[0]);
  return nonEmpty.slice(1).map(line => {
    const vals = parseRow(line);
    const obj = {};
    headers.forEach((h, i) => { 
      obj[h.trim()] = (vals[i] || "").trim(); 
    });
    return obj;
  }).filter(r => r["Team Name"] && r["Team Name"].trim());
}

export function rowToTeam(row, idx) {
  return {
    id: `team_${Date.now()}_${Math.random().toString(36).slice(2)}_${idx}`,
    teamName: row["Team Name"] || "",
    campus: row["CAMPUS"] || "",
    semester: row["Semester"] || "",
    registeredAt: row["Timestamp"] || "",
    leader: {
      name: row["Leader Name"] || "",
      sap: row["Leader SAP ID"] || "",
      email: row["Leader Gmail"] || "",
      phone: (row["Leader Contact Number"] || row["Leader Phone No."] || "").trim(),
    },
    p2: {
      name: row["Player 2 Name"] || "",
      sap: row["Player 2 SAP ID"] || "",
      email: row["Player 2 Gmail"] || "",
    },
    p3: {
      name: row["Player 3 Name"] || "",
      sap: row["Player 3 SAP ID"] || "",
      email: row["Player 3 Gmail"] || "",
    },
    paymentSlip: Object.keys(row).find(k => k.startsWith("Registration Fees")) 
      ? row[Object.keys(row).find(k => k.startsWith("Registration Fees"))] || "" 
      : "",
    feeVerified: false,
    tableNumber: "",
    attendance: { day1: false, day2: false },
    checkInTime: { day1: "", day2: "" },
    food: { day1: false, day2: false },
    emailSent: { confirmation: false, reminder: false },
    notes: "",
    absentPlayers: { day1: "", day2: "" },
    memberAttendance: {
      leader: { day1: false, day2: false },
      p2: { day1: false, day2: false },
      p3: { day1: false, day2: false },
    },
  };
}

export function getUniqueKey(team) {
  return `${team.teamName.toLowerCase().trim()}__${team.leader.sap.trim()}`;
}