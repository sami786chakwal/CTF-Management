// components/EmailModal.jsx
import { useState } from "react";
import { X, Send, Mail, ChevronDown, ChevronUp, Info } from "lucide-react";
import toast from "react-hot-toast";

const replacePlaceholders = (text, team, settings, member) => {
  return (text || "")
    .replace(/{{teamName}}/g, team.teamName || "")
    .replace(/{{leaderName}}/g, team.leader.name || "")
    .replace(/{{memberName}}/g, member?.name || team.leader.name || "")
    .replace(/{{eventName}}/g, settings.eventName || "")
    .replace(/{{tableNumber}}/g, team.tableNumber ? `Table ${team.tableNumber}` : "Unassigned")
    .replace(/{{ctfdUsername}}/g, member?.credentials?.username || team.ctfdAccount?.username || "")
    .replace(/{{ctfdPassword}}/g, member?.credentials?.password || team.ctfdAccount?.password || "")
    .replace(/{{ctfdUrl}}/g, settings.ctfdUrl || settings.platformUrl || "");
};

const formatHtml = (text) => {
  if (!text) return "";
  return text
    .split("\n")
    .map(line => `<p style=\"margin:0 0 10px;font-size:14px;color:#e2e8f0\">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
};

const buildMemberCredentialsTemplate = (member, team, settings) => {
  const subject = (settings.emailSubjectCredentials || `Your CTFd Login for ${settings.eventName}`)
    .replace(/{{leaderName}}/g, member.name)
    .replace(/{{memberName}}/g, member.name)
    .replace(/{{teamName}}/g, team.teamName || "")
    .replace(/{{eventName}}/g, settings.eventName || "");

  const bodyText = replacePlaceholders(settings.emailBodyCredentials || "", team, settings, member);
  const bodyHtml = formatHtml(bodyText);
  const platformUrl = settings.ctfdUrl || settings.platformUrl || "";

  return {
    subject,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{font-family:'Segoe UI',sans-serif;background:#0a0d14;color:#e2e8f0;margin:0;padding:0}
.container{max-width:680px;margin:0 auto;padding:32px 20px}
.card{background:#12161f;border:1px solid rgba(96,165,250,0.2);border-radius:12px;padding:32px}
h1{font-size:24px;margin:0 0 4px;color:#fff}
.meta{color:#718096;font-size:13px;margin-bottom:24px}
.section{margin:20px 0;padding:16px;background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.2);border-radius:10px}
.section-title{font-size:13px;font-weight:600;color:#14b8a6;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px}
.link{color:#60a5fa;text-decoration:none}
.footer{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#4a5568}
code{background:#0a0d14;padding:2px 6px;border-radius:3px;font-family:monospace;color:#60a5fa}
</style></head>
<body>
<div class="container">
<div class="card">
<p style="font-size:13px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;color:#60a5fa">🔑 CTFd Platform Access</p>
<h1>${team.teamName}</h1>
<p class="meta">${settings.eventName}</p>
${bodyHtml}
<div class="section">
  <div class="section-title">🔐 Your Login Credentials</div>
  <div style="margin-bottom:16px;padding:12px;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.2);border-radius:8px">
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#60a5fa"><strong>${member.credentials.name}</strong></p>
    <p style="margin:0 0 4px;font-size:12px;color:#e2e8f0"><strong>Username:</strong> <code style="background:#0a0d14;padding:2px 6px;border-radius:3px;font-family:monospace">${member.credentials.username}</code></p>
    <p style="margin:0;font-size:12px;color:#e2e8f0"><strong>Password:</strong> <code style="background:#0a0d14;padding:2px 6px;border-radius:3px;font-family:monospace">${member.credentials.password}</code></p>
  </div>
</div>
<div class="section">
  <div class="section-title">📅 Event Details</div>
  <p style="margin:0 0 8px"><strong>Date & Time:</strong> ${settings.eventDate || 'TBD'}</p>
  <p style="margin:0 0 8px"><strong>Venue:</strong> ${settings.eventVenue || settings.venue || 'TBD'}</p>
  <p style="margin:0 0 8px"><strong>Platform:</strong> <a href="${platformUrl}" class="link">${platformUrl}</a></p>
</div>
<div class="footer">
<p>Good luck, ${team.teamName}! See you at the event. ⚔</p>
<p>${settings.eventName} · Organizing Team</p>
</div>
</div>
</div>
</body></html>`
  };
};

const TEMPLATES = {
  confirmation: (team, settings) => {
    const subject = settings.emailSubjectConfirm || `🎉 Registration Confirmed — ${team.teamName} | ${settings.eventName}`;
    const bodyText = settings.emailBodyConfirm || `Dear ${team.leader.name},\n\nYour team has been registered successfully for ${settings.eventName}.\n\nBest regards,\nEvent Team`;
    const bodyHtml = formatHtml(replacePlaceholders(bodyText, team, settings));
    return {
      subject,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{font-family:'Segoe UI',sans-serif;background:#0a0d14;color:#e2e8f0;margin:0;padding:0}
.container{max-width:560px;margin:0 auto;padding:32px 20px}
.card{background:#12161f;border:1px solid rgba(20,184,166,0.2);border-radius:12px;padding:32px}
.accent{color:#14b8a6}
h1{font-size:24px;margin:0 0 4px;color:#fff}
.meta{color:#718096;font-size:13px;margin-bottom:24px}
.badge{display:inline-block;background:rgba(20,184,166,0.1);border:1px solid rgba(20,184,166,0.3);color:#14b8a6;padding:4px 12px;border-radius:999px;font-size:12px}
.message{margin:20px 0}
.footer{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#4a5568}
</style></head>
<body>
<div class="container">
<div class="card">
<p class="accent" style="font-size:13px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px">⚡ Registration Confirmed</p>
<h1>${team.teamName}</h1>
<p class="meta">${settings.eventName}</p>
<span class="badge">✓ Registered & Confirmed</span>
<div class="message">
${bodyHtml}
</div>
<div style="margin:20px 0;padding:16px;background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.2);border-radius:8px;font-size:12px;color:#cbd5e0">
<p style="margin:0 0 8px"><strong>📅 Event Date:</strong> ${settings.eventDate || settings.day1Date || 'TBD'}</p>
<p style="margin:0 0 8px"><strong>📍 Venue:</strong> ${settings.eventVenue || settings.venue || 'TBD'}</p>
<p style="margin:0"><strong>⏰ Last Registration:</strong> ${settings.lastRegisterDate || 'TBD'}</p>
</div>
<div class="footer">
<p>Good luck, ${team.teamName}! See you on the battlefield. ⚔</p>
<p>${settings.eventName} · Organizing Team</p>
</div>
</div>
</div>
</body></html>`
    };
  },

  reminder: (team, settings) => {
    const subject = settings.emailSubjectReminder || `⚡ Reminder — ${settings.eventName} Tomorrow!`;
    const bodyText = settings.emailBodyReminder || `Dear ${team.leader.name},\n\nDon't forget! ${settings.eventName} is happening tomorrow.\n\nPlease arrive on time and bring your student ID.\n\nGood luck!`;
    const bodyHtml = formatHtml(replacePlaceholders(bodyText, team, settings));
    return {
      subject,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{font-family:'Segoe UI',sans-serif;background:#0a0d14;color:#e2e8f0;margin:0;padding:0}
.container{max-width:560px;margin:0 auto;padding:32px 20px}
.card{background:#12161f;border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:32px}
h1{font-size:22px;margin:0 0 4px;color:#fff}
.meta{color:#718096;font-size:13px;margin-bottom:20px}
.highlight{background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);border-radius:8px;padding:16px;margin:16px 0}
.message{margin:16px 0}
.footer{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#4a5568}
</style></head>
<body>
<div class="container">
<div class="card">
<p style="font-size:13px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;color:#a78bfa">⚡ Event Reminder</p>
<h1>See you tomorrow, ${team.leader.name.split(" ")[0]}!</h1>
<p class="meta">${settings.eventName}</p>
<div class="highlight">
<p style="margin:0 0 8px;font-size:13px;color:#a78bfa;font-weight:600">EVENT DETAILS</p>
<p style="margin:4px 0;font-size:13px;color:#e2e8f0">📅 ${settings.day2Label || 'Day 2'}${settings.day2Date ? ' — ' + settings.day2Date : ''}</p>
<p style="margin:4px 0;font-size:13px;color:#e2e8f0">📍 ${settings.eventVenue || settings.venue || 'TBD'}</p>
${team.tableNumber ? `<p style="margin:4px 0;font-size:13px;color:#e2e8f0">🪑 Your table: <strong>Table ${team.tableNumber}</strong></p>` : ''}
</div>
<div class="message">
${bodyHtml}
</div>
<div class="footer">
<p>${settings.eventName} · Organizing Team</p>
</div>
</div>
</div>
</body></html>`
    };
  },
  credentials: (team, settings) => {
    const subject = settings.emailSubjectCredentials || `Your CTFd Login for ${settings.eventName}`;
    const leader = team.ctfdAccount?.leader;
    const p2 = team.ctfdAccount?.p2;
    const p3 = team.ctfdAccount?.p3;
    
    const credentialRows = [leader, p2, p3].filter(Boolean).map(cred => `
      <div style="margin-bottom:16px;padding:12px;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.2);border-radius:8px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#60a5fa"><strong>${cred.name}</strong> (${cred.sap || 'N/A'})</p>
        <p style="margin:0 0 4px;font-size:12px;color:#e2e8f0"><strong>Username:</strong> <code style="background:#0a0d14;padding:2px 6px;border-radius:3px;font-family:monospace">${cred.username}</code></p>
        <p style="margin:0 0 4px;font-size:12px;color:#e2e8f0"><strong>Password:</strong> <code style="background:#0a0d14;padding:2px 6px;border-radius:3px;font-family:monospace">${cred.password}</code></p>
        <p style="margin:4px 0 0;font-size:11px;color:#cbd5e0;"><strong>Email:</strong> ${cred.email}</p>
      </div>
    `).join("");

    return {
      subject,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{font-family:'Segoe UI',sans-serif;background:#0a0d14;color:#e2e8f0;margin:0;padding:0}
.container{max-width:680px;margin:0 auto;padding:32px 20px}
.card{background:#12161f;border:1px solid rgba(96,165,250,0.2);border-radius:12px;padding:32px}
h1{font-size:24px;margin:0 0 4px;color:#fff}
.meta{color:#718096;font-size:13px;margin-bottom:24px}
.section{margin:20px 0;padding:16px;background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.2);border-radius:10px}
.section-title{font-size:13px;font-weight:600;color:#14b8a6;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px}
.link-group{margin:12px 0;font-size:13px}
.link{color:#60a5fa;text-decoration:none}
.footer{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#4a5568}
code{background:#0a0d14;padding:2px 6px;border-radius:3px;font-family:monospace;color:#60a5fa}
</style></head>
<body>
<div class="container">
<div class="card">
<p style="font-size:13px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;color:#60a5fa">🔑 CTFd Platform Access</p>
<h1>${team.teamName}</h1>
<p class="meta">${settings.eventName}</p>

<div class="section">
  <div class="section-title">📅 Event Details</div>
  <p style="margin:0 0 8px"><strong>Date & Time:</strong> ${settings.eventDate || 'TBD'}</p>
  <p style="margin:0 0 8px"><strong>Venue:</strong> ${settings.eventVenue || settings.venue || 'TBD'}</p>
  <p style="margin:0 0 8px"><strong>Last Registration:</strong> ${settings.lastRegisterDate || 'TBD'}</p>
  <p style="margin:0"><strong>Platform:</strong> <a href="${settings.platformUrl}" class="link" style="color:#60a5fa">${settings.platformUrl}</a></p>
</div>

<div class="section">
  <div class="section-title">🔐 Your Login Credentials</div>
  ${credentialRows}
</div>

<div class="section">
  <div class="section-title">🤝 Support & Resources</div>
  <div class="link-group">
    <p style="margin:0 0 8px"><strong>Discord Community:</strong> <a href="${settings.discordUrl}" class="link" style="color:#60a5fa">${settings.discordUrl}</a></p>
    <p style="margin:0"><strong>Having trouble?</strong> Create a ticket on Discord or approach the admin team.</p>
  </div>
</div>

<div class="section">
  <div class="section-title">⚠️ Important Notes</div>
  <ul style="margin:0;padding-left:16px;font-size:12px;color:#cbd5e0">
    <li>Keep your credentials safe and secure</li>
    <li>Do not share your password with anyone</li>
    <li>Log in immediately to verify access</li>
    <li>If you forget your password, contact admin team on Discord</li>
  </ul>
</div>

<div class="footer">
<p>Good luck, ${team.teamName}! See you at the event. ⚔</p>
<p>${settings.eventName} · Organizing Team</p>
</div>
</div>
</div>
</body></html>`
    };
  },
};

export default function EmailModal({ team, settings, onClose, onMarkSent, initialTab = "confirmation" }) {
  const [tab, setTab] = useState(initialTab || "confirmation");
  const [senderEmail, setSenderEmail] = useState(settings.smtpEmail || "");
  const [senderPassword, setSenderPassword] = useState(settings.smtpPassword || "");
  const [recipients, setRecipients] = useState([
    team.leader.email,
    team.p2?.email,
    team.p3?.email,
  ].filter(Boolean).join(", "));
  const [subject, setSubject] = useState(TEMPLATES[initialTab || "confirmation"](team, settings).subject);
  const [htmlBody, setHtmlBody] = useState(TEMPLATES[initialTab || "confirmation"](team, settings).html);
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
    
    // For credentials template, send personalized emails to each team member
    if (tab === "credentials") {
      const members = [
        { name: team.leader.name, email: team.leader.email, credentials: team.ctfdAccount?.leader },
        team.p2?.name && { name: team.p2.name, email: team.p2.email, credentials: team.ctfdAccount?.p2 },
        team.p3?.name && { name: team.p3.name, email: team.p3.email, credentials: team.ctfdAccount?.p3 },
      ].filter(m => m && m.email && m.credentials);

      if (!members.length) {
        toast.error("No team members with email and credentials to send to");
        return;
      }

      setSending(true);
      let successCount = 0;
      let errors = 0;

      for (const member of members) {
        try {
          const template = buildMemberCredentialsTemplate(member, team, settings);
          const res = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              senderEmail, 
              senderPassword, 
              toEmail: member.email, 
              subject: template.subject,
              html: template.html,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            errors++;
            console.error(`Failed to send to ${member.email}:`, data.error);
          } else {
            successCount++;
          }
        } catch (e) {
          errors++;
          console.error(`Error sending to ${member.email}:`, e);
        }
      }

      setSending(false);
      if (successCount > 0) {
        toast.success(`Credentials email sent to ${successCount} team member(s)`);
        onMarkSent(team.id, tab);
        onClose();
      }
      if (errors > 0) {
        toast.error(`${errors} email(s) failed. Check SMTP credentials.`);
      }
      return;
    }

    // For other templates (confirmation, reminder), send to all recipients in the recipients field
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
            { key: "credentials", label: "CTFd Credentials" },
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
