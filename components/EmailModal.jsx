// components/EmailModal.jsx
import { useState } from "react";
import { X, Send, Mail, ChevronDown, ChevronUp, Info } from "lucide-react";
import toast from "react-hot-toast";

const TEMPLATES = {
  confirmation: (team, settings) => ({
    subject: `🎉 Registration Confirmed — ${team.teamName} | ${settings.eventName}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{font-family:'Segoe UI',sans-serif;background:#0a0d14;color:#e2e8f0;margin:0;padding:0}
.container{max-width:560px;margin:0 auto;padding:32px 20px}
.card{background:#12161f;border:1px solid rgba(20,184,166,0.2);border-radius:12px;padding:32px}
.accent{color:#14b8a6}
h1{font-size:24px;margin:0 0 4px;color:#fff}
.meta{color:#718096;font-size:13px;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.06);color:#cbd5e0}
td:first-child{color:#718096;width:120px}
.badge{display:inline-block;background:rgba(20,184,166,0.1);border:1px solid rgba(20,184,166,0.3);color:#14b8a6;padding:4px 12px;border-radius:999px;font-size:12px}
.footer{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#4a5568}
</style></head>
<body>
<div class="container">
<div class="card">
<p class="accent" style="font-size:13px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px">⚡ Registration Confirmed</p>
<h1>${team.teamName}</h1>
<p class="meta">${settings.eventName}</p>
<span class="badge">✓ Registered & Confirmed</span>
<table style="margin-top:20px">
<tr><td>Leader</td><td><strong>${team.leader.name}</strong></td></tr>
<tr><td>SAP ID</td><td>${team.leader.sap}</td></tr>
<tr><td>Player 2</td><td>${team.p2?.name || '—'} ${team.p2?.sap ? '· ' + team.p2.sap : ''}</td></tr>
<tr><td>Player 3</td><td>${team.p3?.name || '—'} ${team.p3?.sap ? '· ' + team.p3.sap : ''}</td></tr>
<tr><td>Campus</td><td>${team.campus}</td></tr>
${team.tableNumber ? `<tr><td>Table</td><td><strong>Table ${team.tableNumber}</strong></td></tr>` : ''}
</table>
<p style="font-size:13px;color:#718096;margin:20px 0 0">📅 <strong style="color:#e2e8f0">${settings.day1Label || 'Day 1'}</strong>${settings.day1Date ? ' — ' + settings.day1Date : ''}</p>
<p style="font-size:13px;color:#718096;margin:6px 0">📅 <strong style="color:#e2e8f0">${settings.day2Label || 'Day 2'}</strong>${settings.day2Date ? ' — ' + settings.day2Date : ''}</p>
<p style="font-size:13px;color:#718096;margin:6px 0">📍 ${settings.venue}</p>
<div class="footer">
<p>Good luck, ${team.teamName}! See you on the battlefield. ⚔</p>
<p>${settings.eventName} · Organizing Team</p>
</div>
</div>
</div>
</body></html>`
  }),

  reminder: (team, settings) => ({
    subject: `⚡ Reminder — ${settings.eventName} Tomorrow!`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{font-family:'Segoe UI',sans-serif;background:#0a0d14;color:#e2e8f0;margin:0;padding:0}
.container{max-width:560px;margin:0 auto;padding:32px 20px}
.card{background:#12161f;border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:32px}
h1{font-size:22px;margin:0 0 4px;color:#fff}
.meta{color:#718096;font-size:13px;margin-bottom:20px}
.highlight{background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);border-radius:8px;padding:16px;margin:16px 0}
.footer{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#4a5568}
</style></head>
<body>
<div class="container">
<div class="card">
<p style="font-size:13px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;color:#a78bfa">⚡ Event Reminder</p>
<h1>See you tomorrow, ${team.teamName}!</h1>
<p class="meta">${settings.eventName}</p>
<div class="highlight">
<p style="margin:0 0 8px;font-size:13px;color:#a78bfa;font-weight:600">EVENT DETAILS</p>
<p style="margin:4px 0;font-size:13px;color:#e2e8f0">📅 ${settings.day2Label || 'Day 2'}${settings.day2Date ? ' — ' + settings.day2Date : ''}</p>
<p style="margin:4px 0;font-size:13px;color:#e2e8f0">📍 ${settings.venue}</p>
${team.tableNumber ? `<p style="margin:4px 0;font-size:13px;color:#e2e8f0">🪑 Your table: <strong>Table ${team.tableNumber}</strong></p>` : ''}
</div>
<p style="font-size:13px;color:#718096">Please arrive on time. Bring your student ID. Good luck!</p>
<div class="footer">
<p>${settings.eventName} · Organizing Team</p>
</div>
</div>
</div>
</body></html>`
  }),
};

export default function EmailModal({ team, settings, onClose, onMarkSent }) {
  const [tab, setTab] = useState("confirmation");
  const [senderEmail, setSenderEmail] = useState(settings.smtpEmail || "");
  const [senderPassword, setSenderPassword] = useState(settings.smtpPassword || "");
  const [recipients, setRecipients] = useState([
    team.leader.email,
    team.p2?.email,
    team.p3?.email,
  ].filter(Boolean).join(", "));
  const [subject, setSubject] = useState(TEMPLATES.confirmation(team, settings).subject);
  const [htmlBody, setHtmlBody] = useState(TEMPLATES.confirmation(team, settings).html);
  const [showHtml, setShowHtml] = useState(false);
  const [sending, setSending] = useState(false);

  const switchTemplate = (t) => {
    setTab(t);
    const tpl = TEMPLATES[t](team, settings);
    setSubject(tpl.subject);
    setHtmlBody(tpl.html);
  };

  const sendEmail = async () => {
    if (!senderEmail || !senderPassword) { toast.error("Enter sender email & app password"); return; }
    const emailList = recipients.split(",").map(e => e.trim()).filter(Boolean);
    if (!emailList.length) { toast.error("No recipient emails"); return; }

    setSending(true);
    let errors = 0;
    for (const toEmail of emailList) {
      try {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderEmail, senderPassword, toEmail, subject, html: htmlBody }),
        });
        const data = await res.json();
        if (!res.ok) { errors++; console.error(data.error); }
      } catch (e) { errors++; }
    }
    setSending(false);

    if (errors === 0) {
      toast.success(`Email sent to ${emailList.length} recipient(s)`);
      onMarkSent(team.id, tab);
      onClose();
    } else {
      toast.error(`${errors} email(s) failed. Check credentials.`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Mail size={16} className="text-cyber-400" /> Send Email
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{team.teamName}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Template tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "confirmation", label: "Confirmation" },
            { key: "reminder", label: "Day 2 Reminder" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => switchTemplate(t.key)}
              className={`btn-cyber text-xs py-1.5 px-3 ${tab === t.key ? "btn-cyber-solid" : ""}`}
            >
              {t.label}
              {team.emailSent?.[t.key] && <span className="ml-1 text-emerald-400">✓</span>}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {/* SMTP credentials */}
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/40">
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={12} className="text-amber-400" />
              <span className="text-xs text-amber-400 font-display font-semibold tracking-wide">Gmail SMTP</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Your Gmail</label>
                <input className="cyber-input text-xs py-1.5" type="email" value={senderEmail}
                  onChange={e => setSenderEmail(e.target.value)} placeholder="you@gmail.com" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">App Password (16 chars)</label>
                <input className="cyber-input text-xs py-1.5" type="password" value={senderPassword}
                  onChange={e => setSenderPassword(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Get app password: Google Account → Security → 2-Step Verification → App Passwords
            </p>
          </div>

          {/* Recipients */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block font-display font-medium tracking-wide">
              Recipients (comma separated)
            </label>
            <input className="cyber-input text-xs py-2" value={recipients}
              onChange={e => setRecipients(e.target.value)} placeholder="email1@gmail.com, email2@gmail.com" />
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block font-display font-medium tracking-wide">Subject</label>
            <input className="cyber-input text-sm py-2" value={subject}
              onChange={e => setSubject(e.target.value)} />
          </div>

          {/* HTML editor toggle */}
          <div>
            <button
              onClick={() => setShowHtml(s => !s)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyber-400 transition-colors mb-1.5"
            >
              {showHtml ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showHtml ? "Hide" : "Edit"} HTML body
            </button>
            {showHtml && (
              <textarea
                className="cyber-input text-xs py-2 font-mono resize-y"
                rows={10}
                value={htmlBody}
                onChange={e => setHtmlBody(e.target.value)}
              />
            )}
          </div>

          {/* Preview */}
          <div>
            <div className="text-xs text-slate-500 mb-1.5">Preview</div>
            <div
              className="rounded-lg overflow-hidden border border-slate-700/40"
              style={{ maxHeight: 260, overflowY: "auto", background: "#fff" }}
              dangerouslySetInnerHTML={{ __html: htmlBody }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={sendEmail}
            disabled={sending}
            className="btn-cyber btn-cyber-solid w-full justify-center py-2.5 font-display font-semibold tracking-wide text-sm"
          >
            {sending ? (
              <><span className="animate-spin inline-block mr-2">◌</span> Sending...</>
            ) : (
              <><Send size={14} /> Send Email</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
