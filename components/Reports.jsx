// components/Reports.jsx
import { useState } from "react";
import { FileDown, Printer, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";

function generatePDFHTML(type, teams, settings, options = {}) {
  const now = new Date().toLocaleString("en-PK");
  const showDay2 = settings.numberOfDays >= 2;
  const orientation = options.orientation || 'portrait';
  const th = `background:#0d9488;color:#fff;padding:8px 10px;text-align:left;font-size:11px;border:1px solid #0d9488;white-space:nowrap`;
  const td = `padding:7px 10px;font-size:11px;border:1px solid #e2e8f0;vertical-align:top`;
  const tdAlt = `padding:7px 10px;font-size:11px;border:1px solid #e2e8f0;background:#f8fafc;vertical-align:top`;

  const memberRoles = [
    { key: "leader", label: "Leader" },
    { key: "p2", label: "Player 2" },
    { key: "p3", label: "Player 3" },
  ];

  const row = (cells, i) => `<tr>${cells.map(c => `<td style="${i % 2 === 0 ? td : tdAlt}">${c ?? "–"}</td>`).join("")}</tr>`;
  const absentList = (t, day) => {
    const roles = ["leader", "p2", "p3"].filter(role => t[role]?.name);
    const absent = roles.filter(role => !(t.memberAttendance?.[role]?.[day])).map(role => t[role].name);
    return absent.length ? absent.join(", ") : "None";
  };

  const getMembers = (team) => memberRoles
    .filter(({ key }) => team[key]?.name)
    .map(({ key, label }) => ({
      key,
      label,
      name: team[key].name,
      sap: team[key].sap || "–",
      day1: !!team.memberAttendance?.[key]?.day1,
      day2: !!team.memberAttendance?.[key]?.day2,
    }));
  const formatStatus = (isPresent) => `<span style="color:${isPresent ? "#22c55e" : "#f87171"};font-weight:600">${isPresent ? "Present" : "Absent"}</span>`;
  const totalPlayers = teams.reduce((count, team) => count + getMembers(team).length, 0);
  
  if (type === "attendance") {
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;color:#0f172a;background:#0b1120}
      h1{font-size:22px;margin-bottom:4px;color:#38bdf8;}
      .meta{font-size:11px;color:#94a3b8;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #1e293b}
    </style></head><body>
    <h1>${settings.eventName} - Attendance Report</h1>
    <p class="meta">Generated: ${now} | Total Teams: ${teams.length} | Total Players: ${totalPlayers}</p>
    <table>
      <thead><tr>
        <th style="${th}">#</th>
        <th style="${th}">Team Name</th>
        <th style="${th}">Campus</th>
        <th style="${th}">Table</th>
        <th style="${th}">Members</th>
        <th style="${th}">${settings.day1Label || "Day 1"} Status</th>
        <th style="${th}">In Time D1</th>
        ${showDay2 ? `<th style="${th}">${settings.day2Label || "Day 2"} Status</th><th style="${th}">In Time D2</th>` : ""}
        <th style="${th}">Fee</th>
      </tr></thead>
      <tbody>
        ${teams.map((t, i) => {
          const members = getMembers(t);
          const memberList = members.map(m => `${m.label}: ${m.name} <span style="color:#64748b">(SAP: ${m.sap})</span>`).join("<br/>");
          const day1Status = members.map(m => `${m.label}: ${formatStatus(m.day1)}`).join("<br/>");
          const day2Status = members.map(m => `${m.label}: ${formatStatus(m.day2)}`).join("<br/>");

          return row([
            i + 1,
            t.teamName,
            t.campus?.split(" ").slice(0, 2).join(" "),
            t.tableNumber ? `T-${t.tableNumber}` : "-",
            memberList || "-",
            day1Status || formatStatus(false),
            t.checkInTime?.day1 || "-",
            ...(showDay2 ? [
              day2Status || formatStatus(false),
              t.checkInTime?.day2 || "-"
            ] : []),
            `<span style="color:${t.feeVerified ? "#22c55e" : "#f59e0b"};font-weight:600">${t.feeVerified ? "Verified" : "Pending"}</span>`,
          ], i);
        }).join("")}
      </tbody>
    </table>
    </body></html>`;
  }

  if (type === "food") {
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;color:#0f172a;background:#0b1120}
      h1{font-size:22px;margin-bottom:4px;color:#38bdf8;}
      .meta{font-size:11px;color:#94a3b8;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #1e293b}
    </style></head><body>
    <h1>${settings.eventName} – Food Distribution</h1>
    <p class="meta">Generated: ${now}</p>
    <table>
      <thead><tr>
        <th style="${th}">#</th>
        <th style="${th}">Team</th>
        <th style="${th}">Leader</th>
        <th style="${th}">Table</th>
        <th style="${th}">D1 Attend</th>
        <th style="${th}">D1 Food</th>
        ${showDay2 ? `<th style="${th}">D2 Attend</th><th style="${th}">D2 Food</th>` : ""}
      </tr></thead>
      <tbody>
        ${teams.map((t, i) => row([
          i + 1,
          t.teamName,
          t.leader.name,
          t.tableNumber ? `T-${t.tableNumber}` : "–",
          t.attendance?.day1 ? "✓" : "✗",
          `<span style="color:${t.food?.day1 ? "#22c55e" : "#f87171"};font-weight:600">${t.food?.day1 ? "✓ Given" : "✗ Not Given"}</span>`,
          ...(showDay2 ? [
            t.attendance?.day2 ? "✓" : "✗",
            `<span style="color:${t.food?.day2 ? "#22c55e" : "#f87171"};font-weight:600">${t.food?.day2 ? "✓ Given" : "✗ Not Given"}</span>`
          ] : []),
        ], i)).join("")}
      </tbody>
    </table>
    </body></html>`;
  }

  if (type === "players") {
    const rows = [];
    let idx = 1;
    teams.forEach(t => {
      const players = [
        { role: "Leader", ...t.leader },
        t.p2?.name ? { role: "Player 2", ...t.p2 } : null,
        t.p3?.name ? { role: "Player 3", ...t.p3 } : null,
      ].filter(Boolean);
      players.forEach(p => {
        rows.push(row([idx++, t.teamName, p.role, p.name, p.sap, p.email || "–", t.campus?.split(" ").slice(0, 2).join(" "), t.semester, t.tableNumber ? `T-${t.tableNumber}` : "–"], idx));
      });
    });
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;color:#0f172a;background:#0b1120}
      h1{font-size:22px;margin-bottom:4px;color:#38bdf8;}
      .meta{font-size:11px;color:#94a3b8;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #1e293b}
    </style></head><body>
    <h1>${settings.eventName} – Full Player List</h1>
    <p class="meta">Generated: ${now} | Total Players: ${totalPlayers}</p>
    <table>
      <thead><tr>
        <th style="${th}">#</th>
        <th style="${th}">Team</th>
        <th style="${th}">Role</th>
        <th style="${th}">Name</th>
        <th style="${th}">SAP ID</th>
        <th style="${th}">Email</th>
        <th style="${th}">Campus</th>
        <th style="${th}">Semester</th>
        <th style="${th}">Table</th>
      </tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
    </body></html>`;
  }

  if (type === "teams_full") {
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;color:#0f172a;background:#0b1120}
      h1{font-size:22px;margin-bottom:4px;color:#38bdf8;}
      .meta{font-size:11px;color:#94a3b8;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #1e293b}
    </style></head><body>
    <h1>${settings.eventName} – Complete Team Registry</h1>
    <p class="meta">Generated: ${now} | Teams: ${teams.length}</p>
    <table>
      <thead><tr>
        <th style="${th}">#</th>
        <th style="${th}">Team Name</th>
        <th style="${th}">Campus</th>
        <th style="${th}">Sem</th>
        <th style="${th}">Leader</th>
        <th style="${th}">Leader SAP</th>
        <th style="${th}">Leader Email</th>
        <th style="${th}">Leader Phone</th>
        <th style="${th}">P2</th>
        <th style="${th}">P2 SAP</th>
        <th style="${th}">P3</th>
        <th style="${th}">P3 SAP</th>
        <th style="${th}">Table</th>
        <th style="${th}">Fee</th>
        <th style="${th}">D1</th>
        <th style="${th}">D2</th>
        <th style="${th}">Notes</th>
      </tr></thead>
      <tbody>
        ${teams.map((t, i) => row([
          i + 1, t.teamName, t.campus?.split(" ").slice(0, 2).join(" "), t.semester,
          t.leader.name, t.leader.sap, t.leader.email, t.leader.phone || "–",
          t.p2?.name || "–", t.p2?.sap || "–",
          t.p3?.name || "–", t.p3?.sap || "–",
          t.tableNumber ? `T-${t.tableNumber}` : "–",
          t.feeVerified ? "✓" : "⊘",
          t.attendance?.day1 ? "✓" : "✗",
          t.attendance?.day2 ? "✓" : "✗",
          t.notes || "–",
        ], i)).join("")}
      </tbody>
    </table>
    </body></html>`;
  }

  if (type === "credentials") {
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;color:#0f172a;background:#0b1120}
      h1{font-size:22px;margin-bottom:4px;color:#38bdf8;}
      .meta{font-size:11px;color:#94a3b8;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #1e293b}
      .strong{font-weight:700;color:#0f172a}
    </style></head><body>
    <h1>${settings.eventName} – CTFd Credentials</h1>
    <p class="meta">Generated: ${now} | Teams: ${teams.length}</p>
    <table>
      <thead><tr>
        <th style="${th}">Team Name</th>
        <th style="${th}">Member Name</th>
        <th style="${th}">Role</th>
        <th style="${th}">SAP ID</th>
        <th style="${th}">Email</th>
        <th style="${th}">CTFd Username</th>
        <th style="${th}">CTFd Password</th>
      </tr></thead>
      <tbody>
        ${teams.flatMap(t => {
          const members = [];
          if (t.ctfdAccount?.leader) members.push({ ...t.ctfdAccount.leader, role: "Leader", displayName: t.ctfdAccount.leader.name || t.leader.name });
          if (t.ctfdAccount?.p2) members.push({ ...t.ctfdAccount.p2, role: "Player 2", displayName: t.ctfdAccount.p2.name || t.p2?.name });
          if (t.ctfdAccount?.p3) members.push({ ...t.ctfdAccount.p3, role: "Player 3", displayName: t.ctfdAccount.p3.name || t.p3?.name });
          return members.map((m, idx) => row([
            idx === 0 ? t.teamName : "",
            m.displayName || m.name || "–",
            m.role,
            m.sap || "–",
            m.email || "–",
            m.username,
            m.password,
          ], idx));
        }).join("")}
      </tbody>
    </table>
    </body></html>`;
  }

  if (type === "absent_members") {
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;color:#0f172a;background:#0b1120}
      h1{font-size:22px;margin-bottom:4px;color:#38bdf8;}
      .meta{font-size:11px;color:#94a3b8;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #1e293b}
    </style></head><body>
    <h1>${settings.eventName} – Absent Players Report</h1>
    <p class="meta">Generated: ${now} | Teams: ${teams.length}</p>
    <table>
      <thead><tr>
        <th style="${th}">#</th>
        <th style="${th}">Team</th>
        <th style="${th}">Table</th>
        <th style="${th}">Absent D1</th>
        ${showDay2 ? `<th style="${th}">Absent D2</th>` : ""}
      </tr></thead>
      <tbody>
        ${teams.map((t, i) => row([
          i + 1,
          t.teamName,
          t.tableNumber ? `T-${t.tableNumber}` : "–",
          absentList(t, "day1"),
          ...(showDay2 ? [absentList(t, "day2")] : []),
        ], i)).join("")}
      </tbody>
    </table>
    </body></html>`;
  }

  if (type === "table_card") {
  const isLandscape = orientation === 'landscape';

  return `<html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    @page{
      ${isLandscape ? 'size:A4 landscape;' : 'size:A4 portrait;'}
      margin:0;
    }
    html,body{
      width:100%;
      height:100%;
      background:#fff;
    }
    body{
      font-family:'Segoe UI','Inter',system-ui,-apple-system,BlinkMacSystemFont,sans-serif;
      background:#fff;
      color:#000;
    }
    .page{
      width:${isLandscape ? '297mm' : '210mm'};
      height:${isLandscape ? '210mm' : '297mm'};
      page-break-after:always;
      break-after:page;
      display:flex;
      flex-direction:column;
      padding:14mm;
      background:#fff;
      position:relative;
      overflow:hidden;
    }
    .page:last-child{page-break-after:avoid;break-after:avoid}
    /* Green top accent bar */
    .page::before{
      content:'';
      position:absolute;
      top:0;left:0;right:0;
      height:8mm;
      background:linear-gradient(90deg,#059669 0%,#10b981 55%,#34d399 100%);
    }
    /* Subtle background watermark */
    .page::after{
      content:'CTF';
      position:absolute;
      bottom:10mm;right:10mm;
      font-size:80mm;
      font-weight:900;
      color:rgba(5,150,105,0.04);
      line-height:1;
      pointer-events:none;
      user-select:none;
    }
    .card-inner{
      display:flex;
      flex-direction:column;
      height:100%;
      padding-top:6mm;
    }
    /* Header */
    .header{
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      margin-bottom:8mm;
      padding-bottom:6mm;
      border-bottom:0.5mm solid #d1fae5;
    }
    .event-label{
      font-size:9pt;
      text-transform:uppercase;
      letter-spacing:0.18em;
      color:#059669;
      font-weight:700;
      margin-bottom:3mm;
    }
    .team-name{
      font-size:${isLandscape ? '32pt' : '28pt'};
      font-weight:900;
      color:#0f172a;
      line-height:1.05;
      letter-spacing:-0.5px;
    }
    .table-badge{
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      min-width:${isLandscape ? '40mm' : '36mm'};
      padding:4mm 5mm;
      background:#059669;
      border-radius:4mm;
      color:#fff;
      text-align:center;
      flex-shrink:0;
      box-shadow:0 3px 12px rgba(5,150,105,0.35);
    }
    .table-label{font-size:8pt;text-transform:uppercase;letter-spacing:0.2em;opacity:0.85;font-weight:600;margin-bottom:1mm}
    .table-number{font-size:${isLandscape ? '30pt' : '26pt'};font-weight:900;line-height:1}
    /* Info row */
    .info-row{
      display:grid;
      grid-template-columns:1fr 1fr ${isLandscape ? '1fr 1fr' : ''};
      gap:5mm;
      margin-bottom:8mm;
    }
    .info-box{
      padding:4mm 5mm;
      background:#f0fdf4;
      border-left:2mm solid #059669;
      border-radius:0 2mm 2mm 0;
    }
    .info-label{font-size:7pt;text-transform:uppercase;color:#059669;letter-spacing:0.12em;font-weight:700;margin-bottom:1.5mm}
    .info-value{font-size:${isLandscape ? '12pt' : '11pt'};color:#0f172a;font-weight:700;line-height:1.2}
    .info-detail{font-size:8pt;color:#64748b;margin-top:1mm}
    /* Members */
    .members-title{
      font-size:8pt;text-transform:uppercase;color:#059669;
      letter-spacing:0.15em;font-weight:700;margin-bottom:4mm;
    }
    .members{
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:5mm;
      flex:1;
    }
    .member-card{
      display:flex;
      flex-direction:column;
      padding:5mm;
      background:linear-gradient(145deg,#f0fdf4,#ecfdf5);
      border:0.5mm solid #a7f3d0;
      border-radius:3mm;
      position:relative;
      overflow:hidden;
    }
    .member-card::before{
      content:'';
      position:absolute;
      top:0;left:0;right:0;
      height:1.5mm;
      background:#059669;
    }
    .member-role{
      font-size:7.5pt;text-transform:uppercase;color:#059669;
      letter-spacing:0.12em;font-weight:800;margin-bottom:2.5mm;
    }
    .member-name{
      font-size:${isLandscape ? '13pt' : '12pt'};
      font-weight:800;color:#0f172a;line-height:1.2;margin-bottom:2mm;
      flex:1;
    }
    .member-sap{font-size:9pt;color:#475569;font-weight:600}
    .member-email{font-size:7.5pt;color:#64748b;margin-top:1.5mm;word-break:break-all}
    /* Footer */
    .footer{
      margin-top:auto;
      padding-top:4mm;
      border-top:0.3mm solid #d1fae5;
      display:flex;
      justify-content:space-between;
      align-items:center;
    }
    .footer-text{font-size:7pt;color:#94a3b8}
    .footer-event{font-size:7pt;color:#059669;font-weight:700;text-transform:uppercase;letter-spacing:0.1em}
    @media print{
      html,body{margin:0;padding:0}
      .page{margin:0;padding:14mm;padding-top:20mm}
    }
  </style></head><body>
    ${teams.map((t) => {
      const members = [
        t.leader?.name ? { role: 'LEADER', name: t.leader.name, sap: t.leader.sap || '–', email: t.leader.email || '' } : null,
        t.p2?.name ? { role: 'PLAYER 2', name: t.p2.name, sap: t.p2.sap || '–', email: t.p2.email || '' } : null,
        t.p3?.name ? { role: 'PLAYER 3', name: t.p3.name, sap: t.p3.sap || '–', email: t.p3.email || '' } : null,
      ].filter(Boolean);

      const campusShort = t.campus?.split(" ").slice(0, 2).join(" ") || "–";

      return `<div class="page">
        <div class="card-inner">
          <div class="header">
            <div>
              <div class="event-label">${settings.eventName || "CTF 2026"}</div>
              <div class="team-name">${t.teamName}</div>
            </div>
            <div class="table-badge">
              <div class="table-label">Table</div>
              <div class="table-number">${t.tableNumber || "–"}</div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-box">
              <div class="info-label">Team Leader</div>
              <div class="info-value">${t.leader?.name || "–"}</div>
              <div class="info-detail">SAP: ${t.leader?.sap || "–"}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Campus</div>
              <div class="info-value">${campusShort}</div>
              <div class="info-detail">Semester: ${t.semester || "–"}</div>
            </div>
            ${isLandscape ? `
            <div class="info-box">
              <div class="info-label">Fee Status</div>
              <div class="info-value" style="color:${t.feeVerified ? '#059669' : '#d97706'}">${t.feeVerified ? 'Verified ✓' : 'Pending ⊘'}</div>
              <div class="info-detail">Registration</div>
            </div>
            <div class="info-box">
              <div class="info-label">Contact</div>
              <div class="info-value">${t.leader?.phone || "–"}</div>
              <div class="info-detail">${t.leader?.email?.split('@')[0] || "–"}@...</div>
            </div>` : ''}
          </div>

          <div class="members-title">Team Members</div>
          <div class="members">
            ${members.map(m => `<div class="member-card">
              <div class="member-role">${m.role}</div>
              <div class="member-name">${m.name}</div>
              <div class="member-sap">SAP: ${m.sap}</div>
              ${m.email ? `<div class="member-email">${m.email}</div>` : ''}
            </div>`).join("")}
          </div>

          <div class="footer">
            <span class="footer-text">Generated: ${now}</span>
            <span class="footer-event">${settings.eventName || "CTF 2026"}</span>
          </div>
        </div>
      </div>`;
    }).join("")}
  </body></html>`;
}

  if (type === "team_cards") {
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#050816;color:#e2e8f0;margin:0;padding:20px;}
      .card{width:100%;max-width:760px;margin:0 auto 24px auto;padding:28px;border:1px solid rgba(56,189,248,0.25);border-radius:26px;box-shadow:0 20px 80px rgba(15,23,42,0.55);background:linear-gradient(135deg,rgba(14,37,82,0.92),rgba(4,10,30,0.96));}
      .header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:16px;}
      .event{font-size:12px;text-transform:uppercase;letter-spacing:0.22em;color:#38bdf8;}
      .team-name{font-size:34px;line-height:1.05;font-weight:800;color:#f8fafc;margin:0;}
      .table-badge{font-size:13px;padding:10px 14px;border-radius:999px;background:rgba(56,189,248,0.12);color:#38bdf8;letter-spacing:0.08em;}
      .row{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:12px;}
      .label{font-size:10px;text-transform:uppercase;color:#94a3b8;letter-spacing:0.18em;margin-bottom:4px;}
      .value{font-size:14px;color:#f8fafc;}
      .chip{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;background:rgba(255,255,255,0.04);border:1px solid rgba(148,163,184,0.18);font-size:11px;color:#cbd5e1;}
      .member-list{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;}
      .member{padding:12px 14px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(148,163,184,0.12);}
      .member-title{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:6px;}
      .member-name{font-size:13px;color:#f8fafc;font-weight:600;}
      .member-note{font-size:11px;color:#cbd5e1;margin-top:4px;}
      .absent{color:#fb7185;font-weight:600;}
      .present{color:#22c55e;font-weight:600;}
      .page-break{page-break-after:always;}
    </style></head><body>
      ${teams.map(t => {
        const d1Absent = absentList(t, "day1");
        const d2Absent = showDay2 ? absentList(t, "day2") : "N/A";
        return `<div class="card">
          <div class="header">
            <div>
              <div class="event">${settings.eventName || "CTF Team Card"}</div>
              <h1 class="team-name">${t.teamName}</h1>
            </div>
            <div class="table-badge">${t.tableNumber ? `Table ${t.tableNumber}` : "Table N/A"}</div>
          </div>
          <div class="row">
            <div>
              <div class="label">Leader</div>
              <div class="value">${t.leader.name || "–"}</div>
            </div>
            <div>
              <div class="label">Leader SAP</div>
              <div class="value">${t.leader.sap || "–"}</div>
            </div>
          </div>
          <div class="row">
            <div class="chip">D1 ${t.attendance?.day1 ? `Present` : `Absent`}</div>
            ${showDay2 ? `<div class="chip">D2 ${t.attendance?.day2 ? `Present` : `Absent`}</div>` : ""}
            <div class="chip">Fee ${t.feeVerified ? `Verified` : `Pending`}</div>
          </div>
          <div class="member-list">
            ${["leader", "p2", "p3"].map(role => {
              const player = t[role];
              if (!player?.name) return "";
              const status1 = t.memberAttendance?.[role]?.day1 ? "present" : "absent";
              const status2 = showDay2 ? (t.memberAttendance?.[role]?.day2 ? "present" : "absent") : null;
              return `<div class="member">
                <div class="member-title">${role === "leader" ? "Leader" : role === "p2" ? "Player 2" : "Player 3"}</div>
                <div class="member-name">${player.name}</div>
                <div class="member-note">SAP: ${player.sap || "–"}</div>
                <div class="member-note">D1: <span class="${status1}">${status1}</span></div>
                ${showDay2 ? `<div class="member-note">D2: <span class="${status2}">${status2}</span></div>` : ""}
              </div>`;
            }).join("")}
          </div>
          <div class="row">
            <div>
              <div class="label">Absent D1</div>
              <div class="value ${d1Absent === "None" ? "present" : "absent"}">${d1Absent}</div>
            </div>
            ${showDay2 ? `<div>
              <div class="label">Absent D2</div>
              <div class="value ${d2Absent === "None" ? "present" : "absent"}">${d2Absent}</div>
            </div>` : ""}
          </div>
        </div><div class="page-break"></div>`;
      }).join("")}
    </body></html>`;
  }
}

function openPrint(html) {
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 600);
}

export default function Reports({ teams, settings }) {
  const [tableCardOrientation, setTableCardOrientation] = useState('portrait');
  const totalPlayers = teams.reduce((count, team) => {
    return count + ["leader", "p2", "p3"].filter(role => team[role]?.name).length;
  }, 0);
  const reports = [
    { key: "attendance", title: "Attendance Report", desc: "All teams with Day 1 & Day 2 check-in times and fee status", icon: "AR" },
    { key: "food", title: "Food Distribution", desc: "Which teams received food per day", icon: "FD" },
    { key: "absent_members", title: "Absent Members", desc: "Day-wise absent players per team", icon: "AM" },
    { key: "table_card", title: "Table Cards", desc: "Professional print-ready cards for tables - One card per page", icon: "TC" },
    { key: "team_cards", title: "Attendance Cards", desc: "Modern cyber cards with attendance & member status", icon: "AC" },
    { key: "credentials", title: "CTFd Credentials", desc: "Username/password list for registered CTFd users", icon: "ID" },
    { key: "players", title: "Full Player List", desc: "Individual player rows with SAP IDs and emails", icon: "PL" },
    { key: "teams_full", title: "Complete Registry", desc: "All fields including notes, table, fee, attendance", icon: "CR" },
  ];

  const handlePrint = (key, options = {}) => {
    if (!teams.length) { toast.error("No teams to export"); return; }
    const html = generatePDFHTML(key, teams, settings, options);
    openPrint(html);
    toast.success("Print dialog opened - Save as PDF from print menu");
  };

  const handleExportCSV = () => {
    if (!teams.length) { toast.error("No teams to export"); return; }
    const headers = [
      "Team Name", "Campus", "Semester", "Table",
      "Leader Name", "Leader SAP", "Leader Email", "Leader Phone",
      "Player 2", "P2 SAP", "Player 3", "P3 SAP",
      "Fee Verified", "Day 1 Present", "Day 1 Check-in", "Day 2 Present", "Day 2 Check-in",
      "Food Day1", "Food Day2", "Email Sent", "Notes", "Registered At"
    ];
    const rows = teams.map(t => [
      t.teamName, t.campus, t.semester, t.tableNumber || "",
      t.leader.name, t.leader.sap, t.leader.email, t.leader.phone || "",
      t.p2?.name || "", t.p2?.sap || "", t.p3?.name || "", t.p3?.sap || "",
      t.feeVerified ? "Yes" : "No",
      t.attendance?.day1 ? "Yes" : "No", t.checkInTime?.day1 || "",
      t.attendance?.day2 ? "Yes" : "No", t.checkInTime?.day2 || "",
      t.food?.day1 ? "Yes" : "No", t.food?.day2 ? "Yes" : "No",
      [t.emailSent?.confirmation && "Confirmation", t.emailSent?.reminder && "Reminder"].filter(Boolean).join("|") || "None",
      t.notes || "", t.registeredAt || ""
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ctf-export-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const d1Present = teams.filter(t => t.attendance?.day1).length;
  const d2Present = teams.filter(t => t.attendance?.day2).length;
  const feeVerified = teams.filter(t => t.feeVerified).length;
  const foodD1 = teams.filter(t => t.food?.day1).length;
  const foodD2 = teams.filter(t => t.food?.day2).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <BarChart3 size={18} className="text-cyber-400" /> Reports & Export
        </h2>
        <button onClick={handleExportCSV} className="btn-cyber text-xs">
          <FileDown size={13} /> Export All CSV
        </button>
      </div>

      {/* Quick stats */}
      <div className="cyber-card rounded-xl p-4">
        <div className="text-xs font-display font-semibold text-slate-500 mb-3 tracking-widest uppercase">Summary</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          {[
            { label: "Total Teams", value: teams.length, color: "text-cyber-400" },
            { label: "Fee Verified", value: feeVerified, color: "text-emerald-400" },
            { label: "Day 1 Present", value: d1Present, color: "text-blue-400" },
            { label: "Day 2 Present", value: d2Present, color: "text-violet-400" },
            { label: "Total Players", value: totalPlayers, color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 rounded-lg p-3">
              <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reports.map(r => (
          <div key={r.key} className="cyber-card rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{r.icon}</span>
                <h3 className="text-sm font-display font-semibold text-white">{r.title}</h3>
              </div>
              <p className="text-xs text-slate-500">{r.desc}</p>
            </div>
            {r.key === 'table_card' ? (
              <div className="flex flex-col gap-2 flex-shrink-0">
                <select
                  value={tableCardOrientation}
                  onChange={(e) => setTableCardOrientation(e.target.value)}
                  className="cyber-input text-xs py-1 px-2 w-24"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
                <button
                  onClick={() => handlePrint(r.key, { orientation: tableCardOrientation })}
                  className="btn-cyber text-xs py-1.5"
                >
                  <Printer size={12} /> Print / PDF
                </button>
              </div>
            ) : (
              <button
                onClick={() => handlePrint(r.key)}
                className="btn-cyber text-xs py-1.5 flex-shrink-0"
              >
                <Printer size={12} /> Print / PDF
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="cyber-card rounded-xl p-4 border-amber-500/20">
        <div className="text-xs font-display font-semibold text-amber-400 mb-2 tracking-wide uppercase">How to Save as PDF</div>
        <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
          <li>Click "Print / PDF" on any report above</li>
          <li>In the print dialog, change <strong className="text-slate-300">Destination</strong> to "Save as PDF"</li>
          <li>Click Save - you'll get a properly formatted PDF with one card per page</li>
        </ol>
      </div>
    </div>
  );
}