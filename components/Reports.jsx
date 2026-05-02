// components/Reports.jsx - UPDATED: ONE CARD PER PAGE
// Only the table_card section is different from the original
// COPY JUST THE table_card SECTION BELOW (from if to the closing brace)

  if (type === "table_card") {
    const isLandscape = orientation === 'landscape';
    
    return `<html><head><meta charset="utf-8"><style>
      *{margin:0;padding:0;box-sizing:border-box}
      @page{${isLandscape ? 'size:A4 landscape;margin:0.5in;' : 'size:A4 portrait;margin:0.5in;'}page-break-after:always}
      @media print{body{margin:0;padding:0}}
      html,body{width:100%;height:100%;background:#fff}
      body{font-family:'Segoe UI','Inter',system-ui,-apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000;margin:0;padding:0}
      .page{display:flex;align-items:center;justify-content:center;width:100%;height:calc(100vh - 1in);page-break-after:always}
      .card{display:flex;flex-direction:column;width:100%;max-width:${isLandscape ? '8.5in' : '5.5in'};padding:28px;border:2.5px solid #059669;border-radius:12px;background:linear-gradient(135deg,#ffffff 0%,#f0fdf4 100%);box-shadow:0 4px 12px rgba(5,150,105,0.15);position:relative;page-break-inside:avoid;break-inside:avoid}
      .card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#059669 0%,#10b981 50%,#34d399 100%);border-radius:9px 9px 0 0}
      .header{text-align:center;margin-bottom:24px;padding-bottom:18px;border-bottom:2px solid rgba(5,150,105,0.2)}
      .event{font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#059669;font-weight:700;margin-bottom:8px}
      .team-name{font-size:32px;line-height:1.15;font-weight:900;color:#0f172a;margin:6px 0 12px;letter-spacing:-0.5px}
      .table-badge{display:inline-block;font-size:14px;padding:8px 18px;border-radius:20px;background:#059669;color:#fff;letter-spacing:0.04em;font-weight:700;box-shadow:0 2px 6px rgba(5,150,105,0.3)}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
      .info-box{padding:14px;background:rgba(5,150,105,0.05);border-left:4px solid #059669;border-radius:4px}
      .info-label{font-size:9px;text-transform:uppercase;color:#059669;letter-spacing:0.1em;font-weight:700;margin-bottom:4px}
      .info-value{font-size:14px;color:#0f172a;font-weight:700}
      .info-detail{font-size:10px;color:#64748b;margin-top:2px}
      .members{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px}
      .member-card{text-align:center;padding:16px 12px;background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%);border:1.5px solid #a7f3d0;border-radius:8px;display:flex;flex-direction:column;justify-content:center}
      .member-role{font-size:8px;text-transform:uppercase;color:#059669;letter-spacing:0.08em;font-weight:800;margin-bottom:6px}
      .member-name{font-size:13px;font-weight:800;color:#0f172a;line-height:1.2;margin-bottom:4px}
      .member-sap{font-size:10px;color:#64748b;font-weight:600}
      .footer{font-size:8px;color:#94a3b8;text-align:center;margin-top:auto;padding-top:14px;border-top:1px solid rgba(5,150,105,0.15)}
      @media print{
        body{margin:0;padding:0}
        .page{margin:0;padding:0}
        .card{margin:0}
      }
    </style></head><body>
      ${teams.map((t, index) => {
        const members = [
          t.leader?.name ? { role: 'LEADER', name: t.leader.name, sap: t.leader.sap || '–' } : null,
          t.p2?.name ? { role: 'PLAYER 2', name: t.p2.name, sap: t.p2.sap || '–' } : null,
          t.p3?.name ? { role: 'PLAYER 3', name: t.p3.name, sap: t.p3.sap || '–' } : null,
        ].filter(Boolean);

        return `<div class="page">
          <div class="card">
            <div class="header">
              <div class="event">${settings.eventName || "CTF 2026"}</div>
              <div class="team-name">${t.teamName}</div>
              <div class="table-badge">TABLE ${t.tableNumber || "–"}</div>
            </div>
            <div class="info-grid">
              <div class="info-box">
                <div class="info-label">Team Lead</div>
                <div class="info-value">${t.leader.name || "–"}</div>
                <div class="info-detail">SAP: ${t.leader.sap || "–"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Campus/Sem</div>
                <div class="info-value">${t.campus?.split(" ").slice(0,2).join(" ") || "–"}</div>
                <div class="info-detail">Sem: ${t.semester || "–"}</div>
              </div>
            </div>
            <div class="members">
              ${members.map(m => `<div class="member-card">
                <div class="member-role">${m.role}</div>
                <div class="member-name">${m.name}</div>
                <div class="member-sap">${m.sap}</div>
              </div>`).join("")}
            </div>
            <div class="footer">Generated: ${now} • Cyber Infinity CTF 2026</div>
          </div>
        </div>`;
      }).join("")}
    </body></html>`;
  }