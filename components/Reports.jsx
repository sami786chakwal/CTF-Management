// components/Reports.jsx
import { FileDown, Printer, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";

function generatePDFHTML(type, teams, settings) {
  const now = new Date().toLocaleString("en-PK");
  const showDay2 = settings.numberOfDays >= 2;
  const th = `background:#0d9488;color:#fff;padding:8px 10px;text-align:left;font-size:11px;border:1px solid #0d9488;white-space:nowrap`;
  const td = `padding:7px 10px;font-size:11px;border:1px solid #e2e8f0;vertical-align:top`;
  const tdAlt = `padding:7px 10px;font-size:11px;border:1px solid #e2e8f0;background:#f8fafc;vertical-align:top`;

  const row = (cells, i) => `<tr>${cells.map(c => `<td style="${i % 2 === 0 ? td : tdAlt}">${c ?? "—"}</td>`).join("")}</tr>`;
  const absentList = (t, day) => {
    const roles = ["leader", "p2", "p3"].filter(role => t[role]?.name);
    const absent = roles.filter(role => !(t.memberAttendance?.[role]?.[day])).map(role => t[role].name);
    return absent.length ? absent.join(", ") : "None";
  };

  if (type === "attendance") {
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;color:#0f172a;background:#0b1120}
      h1{font-size:22px;margin-bottom:4px;color:#38bdf8;}
      .meta{font-size:11px;color:#94a3b8;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #1e293b}
    </style></head><body>
    <h1>${settings.eventName} — Attendance Report</h1>
    <p class="meta">Generated: ${now} | Total Teams: ${teams.length}</p>
    <table>
      <thead><tr>
        <th style="${th}">#</th>
        <th style="${th}">Team Name</th>
        <th style="${th}">Leader</th>
        <th style="${th}">SAP ID</th>
        <th style="${th}">Campus</th>
        <th style="${th}">Table</th>
        <th style="${th}">${settings.day1Label || "Day 1"}</th>
        <th style="${th}">In Time D1</th>
        ${showDay2 ? `<th style="${th}">${settings.day2Label || "Day 2"}</th><th style="${th}">In Time D2</th>` : ""}
        <th style="${th}">Fee</th>
      </tr></thead>
      <tbody>
        ${teams.map((t, i) => row([
          i + 1,
          t.teamName,
          t.leader.name,
          t.leader.sap,
          t.campus?.split(" ").slice(0, 2).join(" "),
          t.tableNumber ? `T-${t.tableNumber}` : "—",
          `<span style="color:${t.attendance?.day1 ? "#22c55e" : "#f87171"};font-weight:600">${t.attendance?.day1 ? "Present" : "Absent"}</span>`,
          t.checkInTime?.day1 || "—",
          ...(showDay2 ? [
            `<span style="color:${t.attendance?.day2 ? "#22c55e" : "#f87171"};font-weight:600">${t.attendance?.day2 ? "Present" : "Absent"}</span>`,
            t.checkInTime?.day2 || "—"
          ] : []),
          `<span style="color:${t.feeVerified ? "#22c55e" : "#f59e0b"};font-weight:600">${t.feeVerified ? "Verified" : "Pending"}</span>`,
        ], i)).join("")}
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
    <h1>${settings.eventName} — Food Distribution</h1>
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
          t.tableNumber ? `T-${t.tableNumber}` : "—",
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
        rows.push(row([idx++, t.teamName, p.role, p.name, p.sap, p.email || "—", t.campus?.split(" ").slice(0, 2).join(" "), t.semester, t.tableNumber ? `T-${t.tableNumber}` : "—"], idx));
      });
    });
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;color:#0f172a;background:#0b1120}
      h1{font-size:22px;margin-bottom:4px;color:#38bdf8;}
      .meta{font-size:11px;color:#94a3b8;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #1e293b}
    </style></head><body>
    <h1>${settings.eventName} — Full Player List</h1>
    <p class="meta">Generated: ${now} | Total Players: ~${teams.length * 3}</p>
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
    <h1>${settings.eventName} — Complete Team Registry</h1>
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
          t.leader.name, t.leader.sap, t.leader.email, t.leader.phone || "—",
          t.p2?.name || "—", t.p2?.sap || "—",
          t.p3?.name || "—", t.p3?.sap || "—",
          t.tableNumber ? `T-${t.tableNumber}` : "—",
          t.feeVerified ? "✓" : "⏳",
          t.attendance?.day1 ? "✓" : "✗",
          t.attendance?.day2 ? "✓" : "✗",
          t.notes || "—",
        ], i)).join("")}
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
    <h1>${settings.eventName} — Absent Players Report</h1>
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
          t.tableNumber ? `T-${t.tableNumber}` : "—",
          absentList(t, "day1"),
          ...(showDay2 ? [absentList(t, "day2")] : []),
        ], i)).join("")}
      </tbody>
    </table>
    </body></html>`;
  }

  if (type === "table_card") {
    return `<html><head><meta charset="utf-8"><style>
      @page{margin:0.5in;size:A4}
      body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fff;margin:0;padding:0;color:#000}
      .card{width:100%;page-break-after:always;margin-bottom:24px;padding:28px;border:2px solid #0d9488;border-radius:12px;background:#f9fafb;box-shadow:0 4px 12px rgba(0,0,0,0.08)}
      .header{text-align:center;margin-bottom:20px;border-bottom:2px solid #0d9488;padding-bottom:12px}
      .event{font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#0d9488;font-weight:600}
      .team-name{font-size:32px;line-height:1.1;font-weight:900;color:#000;margin:8px 0 0 0}
      .table-badge{display:inline-block;font-size:16px;padding:8px 16px;border-radius:999px;background:#0d9488;color:#fff;letter-spacing:0.1em;font-weight:700;margin-top:8px}
      .content{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
      .section{padding:12px;border-left:3px solid #0d9488}
      .section-label{font-size:10px;text-transform:uppercase;color:#666;letter-spacing:0.15em;font-weight:600;margin-bottom:6px}
      .section-value{font-size:14px;color:#000;font-weight:500}
      .members{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb}
      .member{text-align:center;padding:10px;background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px}
      .member-role{font-size:9px;text-transform:uppercase;color:#0369a1;letter-spacing:0.1em;font-weight:600}
      .member-name{font-size:12px;font-weight:700;color:#000;margin:4px 0}
      .member-sap{font-size:10px;color:#666}
      .footer{text-align:center;margin-top:16px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:9px;color:#999}
    </style></head><body>
      ${teams.map(t => `<div class="card">
        <div class="header">
          <div class="event">${settings.eventName || "CTF"}</div>
          <h1 class="team-name">${t.teamName}</h1>
          <div class="table-badge">TABLE ${t.tableNumber || "—"}</div>
        </div>
        <div class="content">
          <div class="section">
            <div class="section-label">Leader</div>
            <div class="section-value">${t.leader.name || "—"}</div>
            <div style="font-size:10px;color:#666;margin-top:4px">SAP: ${t.leader.sap || "—"}</div>
          </div>
          <div class="section">
            <div class="section-label">Campus</div>
            <div class="section-value">${t.campus?.split(" ").slice(0,2).join(" ") || "—"}</div>
            <div style="font-size:10px;color:#666;margin-top:4px">Sem: ${t.semester || "—"}</div>
          </div>
        </div>
        <div class="members">
          ${t.leader?.name ? `<div class="member">
            <div class="member-role">Leader</div>
            <div class="member-name">${t.leader.name}</div>
            <div class="member-sap">${t.leader.sap}</div>
          </div>` : ""}
          ${t.p2?.name ? `<div class="member">
            <div class="member-role">Player 2</div>
            <div class="member-name">${t.p2.name}</div>
            <div class="member-sap">${t.p2.sap}</div>
          </div>` : ""}
          ${t.p3?.name ? `<div class="member">
            <div class="member-role">Player 3</div>
            <div class="member-name">${t.p3.name}</div>
            <div class="member-sap">${t.p3.sap}</div>
          </div>` : ""}
        </div>
        <div class="footer">Generated: ${now}</div>
      </div>`).join("")}
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
              <div class="value">${t.leader.name || "—"}</div>
            </div>
            <div>
              <div class="label">Leader SAP</div>
              <div class="value">${t.leader.sap || "—"}</div>
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
                <div class="member-note">SAP: ${player.sap || "—"}</div>
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
  const reports = [
    { key: "attendance", title: "Attendance Report", desc: "All teams with Day 1 & Day 2 check-in times and fee status", icon: "📋" },
    { key: "food", title: "Food Distribution", desc: "Which teams received food per day", icon: "🍽️" },
    { key: "absent_members", title: "Absent Members", desc: "Day-wise absent players per team", icon: "🚫" },
    { key: "table_card", title: "Table Cards", desc: "Simple print-ready cards for placing on registration tables", icon: "🗳️" },
    { key: "team_cards", title: "Attendance Cards", desc: "Modern cyber cards with attendance & member status", icon: "🃏" },
    { key: "players", title: "Full Player List", desc: "Individual player rows with SAP IDs and emails", icon: "👤" },
    { key: "teams_full", title: "Complete Registry", desc: "All fields including notes, table, fee, attendance", icon: "🗂️" },
  ];

  const handlePrint = (key) => {
    if (!teams.length) { toast.error("No teams to export"); return; }
    const html = generatePDFHTML(key, teams, settings);
    openPrint(html);
    toast.success("Print dialog opened — Save as PDF from print menu");
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
            { label: "Total Players", value: teams.length * 3, color: "text-amber-400" },
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
            <button
              onClick={() => handlePrint(r.key)}
              className="btn-cyber text-xs py-1.5 flex-shrink-0"
            >
              <Printer size={12} /> Print / PDF
            </button>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="cyber-card rounded-xl p-4 border-amber-500/20">
        <div className="text-xs font-display font-semibold text-amber-400 mb-2 tracking-wide uppercase">How to Save as PDF</div>
        <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
          <li>Click "Print / PDF" on any report above</li>
          <li>In the print dialog, change <strong className="text-slate-300">Destination</strong> to "Save as PDF"</li>
          <li>Click Save — you'll get a properly formatted PDF with table rows and columns</li>
        </ol>
      </div>
    </div>
  );
}
