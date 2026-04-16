// components/TeamsView.jsx
import { useState } from "react";
import {
  Search, CheckCircle2, XCircle, Utensils, Edit3, Trash2,
  ChevronDown, ChevronUp, ExternalLink, Mail, Key, TableProperties,
  RotateCcw, Clock, ShieldCheck, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

function PlayerRow({ label, player, attendance, showDay2, onToggle }) {
  if (!player?.name) return null;
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-xs">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-600 w-16 flex-shrink-0">{label}</span>
          <span className="text-slate-300 font-medium truncate">{player.name}</span>
          <span className="text-slate-500 font-mono">SAP: {player.sap || "—"}</span>
          <span className="text-slate-500 truncate">{player.email || "—"}</span>
        </div>
      </div>
      <div className="inline-flex gap-1">
        <button
          type="button"
          onClick={() => onToggle?.("day1")}
          className={`btn-cyber text-[10px] py-1 px-2 ${attendance?.day1 ? "bg-cyber-900/40 border-cyber-500/50 text-cyber-300" : "border-slate-700 text-slate-300"}`}
          title={`Mark ${label} ${attendance?.day1 ? "absent" : "present"} for Day 1`}
        >
          {attendance?.day1 ? <><CheckCircle2 size={10} className="inline-block mr-1 text-cyber-400" />D1</> : <><XCircle size={10} className="inline-block mr-1 text-slate-400" />D1</>}
        </button>
        {showDay2 && (
          <button
            type="button"
            onClick={() => onToggle?.("day2")}
            className={`btn-cyber text-[10px] py-1 px-2 ${attendance?.day2 ? "bg-violet-900/30 border-violet-500/40 text-violet-300" : "border-slate-700 text-slate-300"}`}
            title={`Mark ${label} ${attendance?.day2 ? "absent" : "present"} for Day 2`}
          >
            {attendance?.day2 ? <><CheckCircle2 size={10} className="inline-block mr-1 text-violet-400" />D2</> : <><XCircle size={10} className="inline-block mr-1 text-slate-400" />D2</>}
          </button>
        )}
      </div>
    </div>
  );
}

function TeamRow({ team, settings, onUpdate, onDelete, onEmailOpen }) {
  const [expanded, setExpanded] = useState(false);
  const [editTable, setEditTable] = useState(false);
  const [tableInput, setTableInput] = useState(team.tableNumber || "");
  const [editNotes, setEditNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(team.notes || "");
  const [registering, setRegistering] = useState(false);
  const [unregistering, setUnregistering] = useState(false);

  const memberRoles = ["leader", "p2", "p3"];
  const formatAbsentList = (day, memberAttendance = team.memberAttendance || {}) => {
    const absent = memberRoles
      .filter(role => team[role]?.name)
      .filter(role => !(memberAttendance[role]?.[day]))
      .map(role => team[role].name);
    return absent.length ? absent.join(", ") : "None";
  };

  const buildMemberAttendanceForDay = (day, value) => {
    const next = { ...(team.memberAttendance || {}) };
    memberRoles.forEach(role => {
      if (team[role]?.name) {
        next[role] = { ...(next[role] || {}), [day]: value };
      }
    });
    return next;
  };

  const toggleAttendance = (day) => {
    const wasPresent = team.attendance?.[day];
    const newTime = new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
    const nextMemberAttendance = buildMemberAttendanceForDay(day, !wasPresent);
    const absentList = !wasPresent ? "" : formatAbsentList(day, nextMemberAttendance);

    onUpdate(team.id, {
      attendance: { ...team.attendance, [day]: !wasPresent },
      memberAttendance: nextMemberAttendance,
      checkInTime: { ...team.checkInTime, [day]: !wasPresent ? newTime : "" },
      absentPlayers: { ...team.absentPlayers, [day]: absentList },
    });
    toast.success(
      !wasPresent
        ? `${team.teamName} checked in for ${day === "day1" ? settings.day1Label || "Day 1" : settings.day2Label || "Day 2"}`
        : `${team.teamName} marked absent for ${day === "day1" ? settings.day1Label || "Day 1" : settings.day2Label || "Day 2"}`,
      { icon: !wasPresent ? "✅" : "↩️" }
    );
  };

  const toggleMemberAttendance = (role, day) => {
    const wasPresent = team.memberAttendance?.[role]?.[day];
    const nextMemberAttendance = { ...(team.memberAttendance || {}) };
    nextMemberAttendance[role] = { ...(nextMemberAttendance[role] || {}), [day]: !wasPresent };
    const absentList = formatAbsentList(day, nextMemberAttendance);
    const anyPresent = memberRoles.some(r => team[r]?.name && nextMemberAttendance[r]?.[day]);
    const currentTime = team.checkInTime?.[day] || new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

    onUpdate(team.id, {
      memberAttendance: nextMemberAttendance,
      attendance: { ...team.attendance, [day]: anyPresent },
      checkInTime: { ...team.checkInTime, [day]: anyPresent ? currentTime : "" },
      absentPlayers: { ...team.absentPlayers, [day]: absentList },
    });
    toast.success(
      `${team[role].name} marked ${!wasPresent ? "present" : "absent"} for ${day === "day1" ? settings.day1Label || "Day 1" : settings.day2Label || "Day 2"}`,
      { icon: !wasPresent ? "✅" : "↩️" }
    );
  };

  const toggleFood = (day) => {
    if (!team.attendance?.[day] && !team.food?.[day]) {
      toast.error("Team must be checked in first");
      return;
    }
    if (team.food?.[day]) {
      if (!confirm("Reverse food mark? Team will be able to collect again.")) return;
    }
    onUpdate(team.id, { food: { ...team.food, [day]: !team.food?.[day] } });
    toast.success(
      !team.food?.[day] ? `Food given to ${team.teamName}` : `Food reversed for ${team.teamName}`,
      { icon: !team.food?.[day] ? "🍽️" : "↩️" }
    );
  };

  const normalizeForUsername = (value) =>
    (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const generateCTFdUsername = (name, sap, role = "") => {
    const baseName = normalizeForUsername(name).slice(0, 15) || `user${role}`;
    const suffix = (sap || "").replace(/\D/g, "").slice(-3) || Math.random().toString(36).slice(2, 5);
    return `${baseName}_${suffix}`.replace(/__+/g, "_").slice(0, 32);
  };

  const generateCTFdPassword = () => Math.random().toString(36).slice(2, 10);

  const extractCtfdId = (data) => {
    if (!data || typeof data !== "object") return null;
    return (
      data.id ||
      data.team_id ||
      data?.team?.id ||
      data?.data?.id ||
      data?.data?.team?.id ||
      data?.data?.data?.id ||
      data?.data?.team_id ||
      null
    );
  };

  const registerToCTFD = async () => {
    if (!settings.ctfdUrl || !settings.ctfdAdminToken) {
      toast.error("Configure CTFd URL and admin token in Settings first.");
      return;
    }

    const toRegister = [
      { role: "leader", data: team.leader, email: team.leader.email },
      team.p2?.name && { role: "p2", data: team.p2, email: team.p2.email },
      team.p3?.name && { role: "p3", data: team.p3, email: team.p3.email },
    ].filter(Boolean);

    if (!toRegister.some(m => m.email)) {
      toast.error("At least the team leader must have an email.");
      return;
    }

    setRegistering(true);

    let ctfdTeamId = team.ctfdAccount?.team?.id;
    const ctfdTeam = team.ctfdAccount?.team || {
      name: team.teamName,
      captain: team.leader.name,
    };
    let staleRegistration = false;

    if (ctfdTeamId) {
      try {
        const verifyResp = await fetch("/api/ctfd-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ctfdUrl: settings.ctfdUrl,
            adminToken: settings.ctfdAdminToken,
            teamId: ctfdTeamId,
            checkTeamId: true,
          }),
        });
        const verifyData = await verifyResp.json();
        if (!verifyResp.ok) {
          const errorMsg = typeof verifyData.error === 'string' ? verifyData.error : JSON.stringify(verifyData.error) || "Team verification failed";
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.warn("Stored CTFd team ID is invalid, recreating team:", error.message);
        ctfdTeamId = null;
        staleRegistration = true;
      }
    }

    if (staleRegistration && team.ctfdAccount) {
      try {
        const staleUserIds = [
          team.ctfdAccount?.leader?.id,
          team.ctfdAccount?.p2?.id,
          team.ctfdAccount?.p3?.id,
        ].filter(Boolean);
        const staleTeamId = team.ctfdAccount?.team?.id || null;
        if (staleUserIds.length || staleTeamId) {
          const cleanupResp = await fetch("/api/ctfd-unregister", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ctfdUrl: settings.ctfdUrl,
              adminToken: settings.ctfdAdminToken,
              userIds: staleUserIds,
              teamId: staleTeamId,
              deleteTeam: true,
            }),
          });
          if (!cleanupResp.ok) {
            const cleanupData = await cleanupResp.json().catch(() => ({}));
            console.warn("Stale CTFd cleanup failed:", cleanupData.error || cleanupResp.statusText);
          }
        }
      } catch (cleanupError) {
        console.warn("Stale CTFd cleanup failed:", cleanupError);
      }
      onUpdate(team.id, { ctfdAccount: null });
    }

    if (!ctfdTeamId && team.teamName) {
      try {
        const teamResp = await fetch("/api/ctfd-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ctfdUrl: settings.ctfdUrl,
            adminToken: settings.ctfdAdminToken,
            teamName: team.teamName,
            createTeam: true,
          }),
        });
        const teamData = await teamResp.json();
        if (!teamResp.ok) {
          const errorMsg = typeof teamData.error === 'string' ? teamData.error : JSON.stringify(teamData.error) || "Failed to create CTFd team";
          throw new Error(errorMsg);
        }
        ctfdTeamId = extractCtfdId(teamData);
        if (!ctfdTeamId) {
          console.error("CTFd team creation response:", teamData);
          throw new Error("CTFd created the team, but no team ID was returned.");
        }
      } catch (error) {
        console.error("CTFd team creation error:", error);
        toast.error(`Could not create team ${team.teamName} on CTFd: ${error.message}`);
        setRegistering(false);
        return;
      }
    }

    const credentials = {};
    let successCount = 0;
    let leaderCtfdUserId = null;

    for (const member of toRegister) {
      if (!member.email) continue;

      const username =
        team.ctfdAccount?.[member.role]?.username ||
        generateCTFdUsername(member.data.name, member.data.sap, member.role);
      const password = team.ctfdAccount?.[member.role]?.password || generateCTFdPassword();

      try {
        const response = await fetch("/api/ctfd-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ctfdUrl: settings.ctfdUrl,
            adminToken: settings.ctfdAdminToken,
            username,
            password,
            name: member.data.name,
            email: member.email,
            teamId: ctfdTeamId,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          const errorMsg = typeof data?.error === 'string' ? data?.error : JSON.stringify(data?.error) || `Failed to register ${member.role}`;
          throw new Error(errorMsg);
        }
        const userId = extractCtfdId(data);
        if (member.role === "leader") {
          leaderCtfdUserId = userId;
        }
        credentials[member.role] = {
          id: userId,
          username,
          password,
          name: member.data.name,
          email: member.email,
          sap: member.data.sap,
          role: member.role === "leader" ? "Captain" : member.role.toUpperCase(),
          registeredAt: new Date().toISOString(),
          platformUrl: settings.ctfdUrl,
          status: "registered",
        };
        successCount++;
      } catch (error) {
        console.error(`Error registering ${member.role}:`, error);
        toast.error(`Failed to register ${member.data.name}: ${error.message}`);
      }
    }

    if (successCount > 0) {
      const ctfdAccount = team.ctfdAccount || {};
      if (!ctfdAccount.team) {
        ctfdAccount.team = {
          id: ctfdTeamId,
          name: team.teamName,
          captain: team.leader.name,
          createdAt: new Date().toISOString(),
        };
      }
      Object.assign(ctfdAccount, credentials);

      if (leaderCtfdUserId && ctfdTeamId) {
        try {
          const captainResp = await fetch("/api/ctfd-register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ctfdUrl: settings.ctfdUrl,
              adminToken: settings.ctfdAdminToken,
              teamId: ctfdTeamId,
              setCaptain: true,
              captainId: leaderCtfdUserId,
            }),
          });
          const captainData = await captainResp.json();
          if (!captainResp.ok) {
            console.warn("Failed to set CTFd captain:", captainData);
          }
        } catch (captainError) {
          console.warn("CTFd captain assignment failed:", captainError);
        }
      }

      onUpdate(team.id, { ctfdAccount });
      toast.success(`Successfully registered ${successCount} team member(s) on CTFd`);
    }

    setRegistering(false);
  };

  const saveTable = () => {
    onUpdate(team.id, { tableNumber: tableInput });
    setEditTable(false);
    toast.success(`Table ${tableInput} assigned to ${team.teamName}`);
  };

  const saveNotes = () => {
    onUpdate(team.id, { notes: notesInput });
    setEditNotes(false);
    toast.success("Notes saved");
  };

  const isRegisteredOnCTFD = !!(
    team.ctfdAccount?.team?.id ||
    team.ctfdAccount?.leader?.id ||
    team.ctfdAccount?.leader?.username ||
    team.ctfdAccount?.p2?.id ||
    team.ctfdAccount?.p3?.id
  );

  const unregisterFromCTFD = async () => {
    if (!settings.ctfdUrl || !settings.ctfdAdminToken) {
      toast.error("Configure CTFd URL and admin token in Settings first.");
      return;
    }

    if (!confirm("Clear CTFd registration data? This will remove saved platform credentials and allow re-registration.")) {
      return;
    }

    const userIds = [
      team.ctfdAccount?.leader?.id,
      team.ctfdAccount?.p2?.id,
      team.ctfdAccount?.p3?.id,
    ].filter(Boolean);
    const teamId = team.ctfdAccount?.team?.id || null;

    setUnregistering(true);

    try {
      const response = await fetch("/api/ctfd-unregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ctfdUrl: settings.ctfdUrl,
          adminToken: settings.ctfdAdminToken,
          userIds,
          teamId,
          deleteTeam: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMsg = typeof data?.error === 'string' ? data?.error : JSON.stringify(data?.error) || "Failed to remove registration from CTFd";
        throw new Error(errorMsg);
      }
      onUpdate(team.id, { ctfdAccount: null });
      toast.success("CTFd registration data cleared. You can register again.");
    } catch (error) {
      console.error("Unregister from CTFd failed:", error);
      toast.error(error.message || "Failed to clear CTFd registration data");
    } finally {
      setUnregistering(false);
    }
  };

  const toggleFee = () => {
    onUpdate(team.id, { feeVerified: !team.feeVerified });
    toast.success(team.feeVerified ? "Fee unverified" : "Fee verified ✓");
  };

  const day1Label = settings.day1Label || "Day 1";
  const day2Label = settings.day2Label || "Day 2";
  const showDay2 = settings.numberOfDays >= 2;

  return (
    <div className="cyber-card rounded-xl overflow-hidden mb-3 transition-all">
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Team info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-display font-semibold text-white">{team.teamName}</h3>
              {team.tableNumber && (
                <span className="badge badge-table">
                  <TableProperties size={10} /> T-{team.tableNumber}
                </span>
              )}
              {team.feeVerified && <span className="badge badge-verified"><ShieldCheck size={10} /> Verified</span>}
              {!team.feeVerified && <span className="badge badge-pending"><AlertCircle size={10} /> Fee Pending</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-slate-400">{team.leader.name}</span>
              <span className="text-xs text-slate-600 font-mono">SAP: {team.leader.sap}</span>
              {team.leader.phone && <span className="text-xs text-slate-500">{team.leader.phone}</span>}
              <span className="text-xs text-slate-600">{team.campus?.split(" ").slice(0, 2).join(" ")}</span>
              {team.semester && <span className="text-xs text-slate-600">{team.semester} Sem</span>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Attendance toggles */}
            <button
              onClick={() => toggleAttendance("day1")}
              className={`btn-cyber text-xs py-1 px-2.5 ${team.attendance?.day1 ? "bg-cyber-900/40 border-cyber-500/50 text-cyber-300" : ""}`}
              title={team.attendance?.day1 ? `In at ${team.checkInTime?.day1 || "?"} — click to reverse` : `Mark present for ${day1Label}`}
            >
              {team.attendance?.day1
                ? <><CheckCircle2 size={12} className="text-cyber-400" /> {day1Label} <span className="text-slate-500 text-xs">{team.checkInTime?.day1}</span></>
                : <><XCircle size={12} className="text-slate-500" /> {day1Label}</>
              }
            </button>

            {showDay2 && (
              <button
                onClick={() => toggleAttendance("day2")}
                className={`btn-cyber text-xs py-1 px-2.5 ${team.attendance?.day2 ? "bg-violet-900/30 border-violet-500/40 text-violet-300" : ""}`}
                title={team.attendance?.day2 ? `In at ${team.checkInTime?.day2 || "?"} — click to reverse` : `Mark present for ${day2Label}`}
              >
                {team.attendance?.day2
                  ? <><CheckCircle2 size={12} className="text-violet-400" /> {day2Label} <span className="text-slate-500 text-xs">{team.checkInTime?.day2}</span></>
                  : <><XCircle size={12} className="text-slate-500" /> {day2Label}</>
                }
              </button>
            )}

            {/* Food */}
            <button
              onClick={() => toggleFood("day1")}
              className={`btn-cyber text-xs py-1 px-2.5 ${team.food?.day1 ? "bg-amber-900/30 border-amber-500/40 text-amber-300" : ""}`}
              title={team.food?.day1 ? "Food given Day 1 — click to reverse" : "Give food Day 1"}
            >
              <Utensils size={12} /> D1
              {team.food?.day1 ? " ✓" : ""}
            </button>
            {showDay2 && (
              <button
                onClick={() => toggleFood("day2")}
                className={`btn-cyber text-xs py-1 px-2.5 ${team.food?.day2 ? "bg-amber-900/30 border-amber-500/40 text-amber-300" : ""}`}
                title={team.food?.day2 ? "Food given Day 2 — click to reverse" : "Give food Day 2"}
              >
                <Utensils size={12} /> D2
                {team.food?.day2 ? " ✓" : ""}
              </button>
            )}

            {/* Email */}
            <button onClick={() => onEmailOpen(team)} className="btn-cyber text-xs py-1 px-2.5" title="Send email">
              <Mail size={12} />
              {(team.emailSent?.confirmation || team.emailSent?.reminder) && <span className="text-cyber-400">✓</span>}
            </button>

            {/* Credentials email */}
            <button onClick={() => onEmailOpen(team, "credentials")} className="btn-cyber text-xs py-1 px-2.5" title="Send CTFd credentials email">
              <Key size={12} />
            </button>

            {/* CTFd register */}
            <button
              onClick={registerToCTFD}
              disabled={registering}
              className={`btn-cyber text-xs py-1 px-2.5 ${isRegisteredOnCTFD ? "bg-cyan-900/40 border-cyan-500/50 text-cyan-300" : ""}`}
              title={isRegisteredOnCTFD ? "Re-register team on CTFd" : "Register team on CTFd"}
            >
              {registering ? "⌛" : "CTFd"}
            </button>
            {settings.ctfdUrl && (
              <button
                onClick={unregisterFromCTFD}
                disabled={unregistering}
                className="btn-cyber btn-cyber-danger text-xs py-1 px-2.5"
                title="Clear CTFd registration data"
              >
                {unregistering ? "⌛" : <XCircle size={12} />}
              </button>
            )}

            {/* Fee verify */}
            <button onClick={toggleFee} className={`btn-cyber text-xs py-1 px-2.5 ${team.feeVerified ? "btn-cyber-solid" : ""}`} title="Toggle fee verification">
              <ShieldCheck size={12} />
            </button>

            {/* Delete */}
            <button onClick={() => onDelete(team.id)} className="btn-cyber btn-cyber-danger text-xs py-1 px-2.5" title="Remove team">
              <Trash2 size={12} />
            </button>

            {/* Expand */}
            <button onClick={() => setExpanded(e => !e)} className="btn-cyber text-xs py-1 px-2.5">
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-4 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Players */}
            <div>
              <div className="text-xs font-display font-semibold text-slate-500 mb-2 tracking-widest uppercase">Players & Attendance</div>
              <div className="divide-y divide-white/5">
                <PlayerRow
                  label="Leader"
                  player={team.leader}
                  attendance={team.memberAttendance?.leader}
                  showDay2={showDay2}
                  onToggle={(day) => toggleMemberAttendance("leader", day)}
                />
                <PlayerRow
                  label="Player 2"
                  player={team.p2}
                  attendance={team.memberAttendance?.p2}
                  showDay2={showDay2}
                  onToggle={(day) => toggleMemberAttendance("p2", day)}
                />
                <PlayerRow
                  label="Player 3"
                  player={team.p3}
                  attendance={team.memberAttendance?.p3}
                  showDay2={showDay2}
                  onToggle={(day) => toggleMemberAttendance("p3", day)}
                />
              </div>
              <div className="mt-3 text-xs text-slate-400 space-y-1">
                <div><span className="font-semibold text-slate-300">Absent D1:</span> {formatAbsentList("day1")}</div>
                {showDay2 && <div><span className="font-semibold text-slate-300">Absent D2:</span> {formatAbsentList("day2")}</div>}
              </div>
            </div>

            {/* Table assignment + notes */}
            <div className="space-y-3">
              <div>
                <div className="text-xs font-display font-semibold text-slate-500 mb-2 tracking-widest uppercase">Table Assignment</div>
                {editTable ? (
                  <div className="flex gap-2">
                    <input
                      className="cyber-input text-xs py-1.5"
                      value={tableInput}
                      onChange={e => setTableInput(e.target.value)}
                      placeholder="Table number"
                      onKeyDown={e => e.key === "Enter" && saveTable()}
                    />
                    <button onClick={saveTable} className="btn-cyber btn-cyber-solid text-xs">Save</button>
                    <button onClick={() => setEditTable(false)} className="btn-cyber text-xs">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{team.tableNumber ? `Table ${team.tableNumber}` : "Not assigned"}</span>
                    <button onClick={() => { setTableInput(team.tableNumber || ""); setEditTable(true); }} className="btn-cyber text-xs py-1 px-2">
                      <Edit3 size={10} /> Edit
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-display font-semibold text-slate-500 mb-2 tracking-widest uppercase">Check-in Times</div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex gap-3">
                    <span className="text-slate-600">{day1Label}:</span>
                    <span className={team.checkInTime?.day1 ? "text-cyber-400" : "text-slate-600"}>
                      {team.checkInTime?.day1 || "Not checked in"}
                    </span>
                    {team.checkInTime?.day1 && (
                      <button onClick={() => toggleAttendance("day1")} className="text-slate-600 hover:text-amber-400 transition-colors" title="Reverse check-in">
                        <RotateCcw size={10} />
                      </button>
                    )}
                  </div>
                  {showDay2 && (
                    <div className="flex gap-3">
                      <span className="text-slate-600">{day2Label}:</span>
                      <span className={team.checkInTime?.day2 ? "text-violet-400" : "text-slate-600"}>
                        {team.checkInTime?.day2 || "Not checked in"}
                      </span>
                      {team.checkInTime?.day2 && (
                        <button onClick={() => toggleAttendance("day2")} className="text-slate-600 hover:text-amber-400 transition-colors" title="Reverse check-in">
                          <RotateCcw size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-display font-semibold text-slate-500 mb-2 tracking-widest uppercase">Notes</div>
                {editNotes ? (
                  <div className="space-y-1.5">
                    <textarea
                      className="cyber-input text-xs py-1.5 resize-none"
                      rows={3}
                      value={notesInput}
                      onChange={e => setNotesInput(e.target.value)}
                      placeholder="Add notes..."
                    />
                    <div className="flex gap-2">
                      <button onClick={saveNotes} className="btn-cyber btn-cyber-solid text-xs">Save</button>
                      <button onClick={() => setEditNotes(false)} className="btn-cyber text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-slate-400 flex-1">{team.notes || "No notes"}</span>
                    <button onClick={() => { setNotesInput(team.notes || ""); setEditNotes(true); }} className="btn-cyber text-xs py-1 px-2">
                      <Edit3 size={10} /> Edit
                    </button>
                  </div>
                )}
              </div>

              {team.ctfdAccount?.leader && (
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <div className="text-xs font-display font-semibold text-slate-500 mb-2 tracking-widest uppercase">CTFd Credentials</div>
                  <div className="text-xs text-slate-300 space-y-2">
                    {team.ctfdAccount?.leader && (
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="font-semibold text-cyan-300">{team.ctfdAccount.leader.name}</div>
                        <div className="text-slate-400">Username: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs">{team.ctfdAccount.leader.username}</code></div>
                        <div className="text-slate-400">Password: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs">{team.ctfdAccount.leader.password}</code></div>
                      </div>
                    )}
                    {team.ctfdAccount?.p2 && (
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="font-semibold text-cyan-300">{team.ctfdAccount.p2.name}</div>
                        <div className="text-slate-400">Username: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs">{team.ctfdAccount.p2.username}</code></div>
                        <div className="text-slate-400">Password: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs">{team.ctfdAccount.p2.password}</code></div>
                      </div>
                    )}
                    {team.ctfdAccount?.p3 && (
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="font-semibold text-cyan-300">{team.ctfdAccount.p3.name}</div>
                        <div className="text-slate-400">Username: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs">{team.ctfdAccount.p3.username}</code></div>
                        <div className="text-slate-400">Password: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs">{team.ctfdAccount.p3.password}</code></div>
                      </div>
                    )}
                    {team.ctfdAccount?.leader?.platformUrl && (
                      <div><a href={team.ctfdAccount.leader.platformUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline text-xs">Open CTFd Platform</a></div>
                    )}
                  </div>
                </div>
              )}
              {team.paymentSlip && (
                <div>
                  <div className="text-xs font-display font-semibold text-slate-500 mb-1.5 tracking-widest uppercase">Payment Slip</div>
                  <a href={team.paymentSlip} target="_blank" rel="noreferrer" className="btn-cyber text-xs py-1 px-2.5">
                    <ExternalLink size={10} /> View Slip
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamsView({ teams, settings, onUpdate, onDelete, onEmailOpen }) {
  const [search, setSearch] = useState("");
  const [filterFee, setFilterFee] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [filterCampus, setFilterCampus] = useState("all");
  const [sortBy, setSortBy] = useState("registered");

  const campuses = [...new Set(teams.map(t => t.campus).filter(Boolean))];
  const showDay2 = settings.numberOfDays >= 2;

  const filtered = teams
    .filter(t => {
      const q = search.toLowerCase();
      if (q) {
        const match =
          t.teamName.toLowerCase().includes(q) ||
          t.leader.name.toLowerCase().includes(q) ||
          t.leader.sap.includes(q) ||
          t.p2?.sap?.includes(q) ||
          t.p3?.sap?.includes(q) ||
          (t.leader.email || "").toLowerCase().includes(q) ||
          (t.p2?.name || "").toLowerCase().includes(q) ||
          (t.p3?.name || "").toLowerCase().includes(q) ||
          (t.tableNumber && t.tableNumber.includes(q));
        if (!match) return false;
      }
      if (filterFee === "verified" && !t.feeVerified) return false;
      if (filterFee === "pending" && t.feeVerified) return false;
      if (filterDay === "day1_present" && !t.attendance?.day1) return false;
      if (filterDay === "day1_absent" && t.attendance?.day1) return false;
      if (filterDay === "day2_present" && !t.attendance?.day2) return false;
      if (filterDay === "day2_absent" && t.attendance?.day2) return false;
      if (filterCampus !== "all" && t.campus !== filterCampus) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.teamName.localeCompare(b.teamName);
      if (sortBy === "table") return (a.tableNumber || "999") > (b.tableNumber || "999") ? 1 : -1;
      if (sortBy === "registered") return new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0);
      return 0;
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-display font-bold text-white">Teams ({filtered.length}/{teams.length})</h2>
      </div>

      {/* Filters */}
      <div className="cyber-card rounded-xl p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="cyber-input pl-9 text-sm py-2"
            placeholder="Search by name, SAP, email, table..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="cyber-input text-xs py-2 w-auto" value={filterFee} onChange={e => setFilterFee(e.target.value)}>
          <option value="all">All Fee Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
        <select className="cyber-input text-xs py-2 w-auto" value={filterDay} onChange={e => setFilterDay(e.target.value)}>
          <option value="all">All Attendance</option>
          <option value="day1_present">{settings.day1Label || "Day 1"} Present</option>
          <option value="day1_absent">{settings.day1Label || "Day 1"} Absent</option>
          {showDay2 && (
            <>
              <option value="day2_present">{settings.day2Label || "Day 2"} Present</option>
              <option value="day2_absent">{settings.day2Label || "Day 2"} Absent</option>
            </>
          )}
        </select>
        <select className="cyber-input text-xs py-2 w-auto" value={filterCampus} onChange={e => setFilterCampus(e.target.value)}>
          <option value="all">All Campuses</option>
          {campuses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="cyber-input text-xs py-2 w-auto" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="registered">Sort: Newest</option>
          <option value="name">Sort: Name</option>
          <option value="table">Sort: Table</option>
        </select>
      </div>

      {/* Team list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <p className="text-2xl mb-2">⚔</p>
          <p className="text-sm">No teams found</p>
        </div>
      ) : (
        <div>
          {filtered.map(team => (
            <TeamRow
              key={team.id}
              team={team}
              settings={settings}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEmailOpen={onEmailOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
