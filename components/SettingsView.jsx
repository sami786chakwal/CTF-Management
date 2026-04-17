// components/SettingsView.jsx
import { useState, useEffect } from "react";
import { Save, Settings, Shield, Trash2, Eye, EyeOff, Calendar, Plus, X, Mail, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { saveSettings, parseCSV, rowToTeam, getUniqueKey } from "../lib/store";

export default function SettingsView({ settings, onSave, onClearAll, teamsCount, teams }) {
  const [form, setForm] = useState({ ...settings });
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // Auto-sync effect
  useEffect(() => {
    if (!form.googleFormEnabled || !form.googleFormURL || !form.googleFormSyncInterval) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        console.log("Auto-syncing from Google Form...");
        const response = await fetch("/api/google-sync");
        const data = await response.json();

        if (response.ok && data.synced) {
          // Update last sync time
          const updatedForm = { ...form, googleFormLastSync: new Date().toISOString() };
          setForm(updatedForm);
          await saveSettings(updatedForm);

          toast.success(`Auto-synced ${data.newTeams} new teams from Google Form`, { duration: 3000 });
          
          // Refresh the page to show new teams
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (error) {
        console.error("Auto-sync failed:", error);
        // Don't show error toast for auto-sync failures to avoid spam
      }
    }, (form.googleFormSyncInterval || 10) * 60 * 1000); // Convert minutes to milliseconds

    return () => clearInterval(interval);
  }, [form.googleFormEnabled, form.googleFormURL, form.googleFormSyncInterval]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    try {
      await saveSettings(form);
      onSave(form);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const handleClear = () => {
    if (!confirm(`DELETE ALL ${teamsCount} teams? This cannot be undone!`)) return;
    if (!confirm("Are you absolutely sure? Type OK to confirm.")) return;
    onClearAll();
    toast.success("All data cleared");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
        <Settings size={18} className="text-cyber-400" /> Settings
      </h2>

      {/* Event Details */}
      <div className="cyber-card rounded-xl p-5">
        <h3 className="text-sm font-display font-semibold text-cyber-400 mb-4 tracking-wide uppercase">Event Details</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Event Name</label>
            <input className="cyber-input" value={form.eventName || ""} onChange={e => set("eventName", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Venue</label>
            <input className="cyber-input" value={form.venue || ""} onChange={e => set("venue", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Day 1 Label</label>
              <input className="cyber-input" value={form.day1Label || "Day 1"} onChange={e => set("day1Label", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Day 1 Date</label>
              <input className="cyber-input" type="date" value={form.day1Date || ""} onChange={e => set("day1Date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Day 2 Label</label>
              <input className="cyber-input" value={form.day2Label || "Day 2"} onChange={e => set("day2Label", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Day 2 Date</label>
              <input className="cyber-input" type="date" value={form.day2Date || ""} onChange={e => set("day2Date", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Number of Event Days</label>
            <select 
              className="cyber-input" 
              value={form.numberOfDays || 2} 
              onChange={e => set("numberOfDays", Number(e.target.value))}
            >
              <option value={1}>1 Day Event</option>
              <option value={2}>2 Day Event</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Total Tables in Lab</label>
            <input 
              className="cyber-input" 
              type="number" 
              min={1} 
              max={200} 
              value={form.totalTables || 20} 
              onChange={e => set("totalTables", Number(e.target.value))} 
            />
          </div>
        </div>
      </div>

      {/* Event Management */}
      <div className="cyber-card rounded-xl p-5">
        <h3 className="text-sm font-display font-semibold text-cyber-400 mb-4 tracking-wide uppercase flex items-center gap-2">
          <Calendar size={14} /> Event Management
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              className="cyber-input flex-1"
              placeholder="Event name (e.g., Opening Ceremony)"
              value={form.newEventName || ""}
              onChange={e => set("newEventName", e.target.value)}
            />
            <select
              className="cyber-input w-32"
              value={form.newEventDays || 2}
              onChange={e => set("newEventDays", Number(e.target.value))}
            >
              <option value={1}>1 Day</option>
              <option value={2}>2 Days</option>
            </select>
            <button
              onClick={async () => {
                if (!form.newEventName?.trim()) return;
                const events = form.events || [];
                const newEvent = {
                  id: Date.now().toString(),
                  name: form.newEventName.trim(),
                  days: form.newEventDays || 2,
                  createdAt: new Date().toISOString()
                };
                const updatedForm = { ...form, events: [...events, newEvent], newEventName: "", newEventDays: 2 };
                setForm(updatedForm);
                try {
                  await saveSettings(updatedForm);
                  toast.success("Event created");
                } catch (error) {
                  console.error("Failed to save event:", error);
                  toast.error("Failed to create event");
                }
              }}
              className="btn-cyber btn-cyber-solid px-3 py-2"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {(form.events || []).map(event => (
              <div key={event.id} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                <div>
                  <span className="text-white text-sm">{event.name}</span>
                  <span className="text-slate-500 text-xs ml-2">({event.days} day{event.days > 1 ? 's' : ''})</span>
                </div>
                <button
                  onClick={async () => {
                    const events = form.events || [];
                    const updatedForm = { ...form, events: events.filter(e => e.id !== event.id) };
                    setForm(updatedForm);
                    try {
                      await saveSettings(updatedForm);
                      toast.success("Event deleted");
                    } catch (error) {
                      console.error("Failed to delete event:", error);
                      toast.error("Failed to delete event");
                    }
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gmail SMTP */}
      <div className="cyber-card rounded-xl p-5">
        <h3 className="text-sm font-display font-semibold text-cyber-400 mb-1 tracking-wide uppercase">Default Gmail SMTP</h3>
        <p className="text-xs text-slate-500 mb-4">Pre-fill these so you don’t re-enter per email.</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Gmail Address</label>
            <input className="cyber-input" type="email" value={form.smtpEmail || ""} onChange={e => set("smtpEmail", e.target.value)} placeholder="you@gmail.com" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Gmail App Password</label>
            <div className="relative">
              <input 
                className="cyber-input pr-10" 
                type={showSmtpPass ? "text" : "password"} 
                value={form.smtpPassword || ""} 
                onChange={e => set("smtpPassword", e.target.value)} 
                placeholder="16-char app password" 
              />
              <button type="button" onClick={() => setShowSmtpPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyber-400">
                {showSmtpPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="cyber-card rounded-xl p-5">
        <h3 className="text-sm font-display font-semibold text-cyber-400 mb-4 tracking-wide uppercase flex items-center gap-2">
          <Mail size={14} /> Email Templates
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Confirmation Email Subject</label>
            <input 
              className="cyber-input" 
              value={form.emailSubjectConfirm || `Team Registration Confirmed - ${settings.eventName}`}
              onChange={e => set("emailSubjectConfirm", e.target.value)}
              placeholder="Registration confirmation subject"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Confirmation Email Body</label>
            <textarea 
              className="cyber-input min-h-[100px] text-xs"
              value={form.emailBodyConfirm || settings.emailBodyConfirm || "Dear {{leaderName}},\n\nYour team has been registered successfully for {{eventName}}.\n\nBest regards,\nEvent Team"}
              onChange={e => set("emailBodyConfirm", e.target.value)}
              placeholder="Email body (use {{teamName}}, {{leaderName}}, {{eventName}} for placeholders)"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Day 2 Reminder Subject</label>
            <input
              className="cyber-input"
              value={form.emailSubjectReminder || settings.emailSubjectReminder || `⚡ Reminder — ${settings.eventName} Tomorrow!`}
              onChange={e => set("emailSubjectReminder", e.target.value)}
              placeholder="Reminder email subject"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Day 2 Reminder Body</label>
            <textarea
              className="cyber-input min-h-[100px] text-xs"
              value={form.emailBodyReminder || settings.emailBodyReminder || "Dear {{leaderName}},\n\nDon't forget! {{eventName}} is happening tomorrow.\n\nPlease arrive on time and bring your student ID.\n\nGood luck!"}
              onChange={e => set("emailBodyReminder", e.target.value)}
              placeholder="Reminder email body"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Credentials Email Subject</label>
            <input
              className="cyber-input"
              value={form.emailSubjectCredentials || settings.emailSubjectCredentials || `Your CTFd Login for ${settings.eventName}`}
              onChange={e => set("emailSubjectCredentials", e.target.value)}
              placeholder="Credentials email subject"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Credentials Email Body</label>
            <textarea
              className="cyber-input min-h-[140px] text-xs"
              value={form.emailBodyCredentials || settings.emailBodyCredentials || "Hello {{leaderName}},\n\nYour team has been successfully registered for {{eventName}}.\n\nUsername: {{ctfdUsername}}\nPassword: {{ctfdPassword}}\nPlatform: {{ctfdUrl}}\n\nGood luck!"}
              onChange={e => set("emailBodyCredentials", e.target.value)}
              placeholder="Email body for CTFd credentials (use {{leaderName}}, {{eventName}}, {{ctfdUsername}}, {{ctfdPassword}}, {{ctfdUrl}})"
            />
          </div>
          <div className="text-xs text-slate-500">
            Available placeholders: {"{{teamName}}, {{leaderName}}, {{memberName}}, {{eventName}}, {{tableNumber}}, {{ctfdUsername}}, {{ctfdPassword}}, {{ctfdUrl}}"}
          </div>
        </div>
      </div>

      {/* CTFd Registration */}
      <div className="cyber-card rounded-xl p-5">
        <h3 className="text-sm font-display font-semibold text-cyber-400 mb-4 tracking-wide uppercase flex items-center gap-2">
          <Shield size={14} /> CTFd Registration
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">CTFd Base URL</label>
            <input
              className="cyber-input"
              type="url"
              value={form.ctfdUrl || ""}
              onChange={e => set("ctfdUrl", e.target.value)}
              placeholder="https://ctfd.example.com"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">CTFd Admin Token</label>
            <input
              className="cyber-input"
              type="password"
              value={form.ctfdAdminToken || ""}
              onChange={e => set("ctfdAdminToken", e.target.value)}
              placeholder="CTFd admin API token"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">CTFd Username Prefix</label>
            <input
              className="cyber-input"
              value={form.ctfdTeamPrefix || "team"}
              onChange={e => set("ctfdTeamPrefix", e.target.value)}
              placeholder="team"
            />
          </div>
        </div>
      </div>

      {/* Event Details for Credentials */}
      <div className="cyber-card rounded-xl p-5">
        <h3 className="text-sm font-display font-semibold text-cyber-400 mb-4 tracking-wide uppercase flex items-center gap-2">
          <Calendar size={14} /> Event Information for Credentials Email
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Event Date & Time</label>
            <input
              className="cyber-input"
              value={form.eventDate || "Wed, 22 April 2026 | 10:00 AM – 2:00 PM"}
              onChange={e => set("eventDate", e.target.value)}
              placeholder="Wed, 22 April 2026 | 10:00 AM – 2:00 PM"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Event Venue</label>
            <input
              className="cyber-input"
              value={form.eventVenue || "Block A (A-114), Riphah I-14 Campus"}
              onChange={e => set("eventVenue", e.target.value)}
              placeholder="Block A (A-114), Riphah I-14 Campus"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Last Registration Date</label>
            <input
              className="cyber-input"
              value={form.lastRegisterDate || "20th April, 2026"}
              onChange={e => set("lastRegisterDate", e.target.value)}
              placeholder="20th April, 2026"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">CTFd Platform URL</label>
            <input
              className="cyber-input"
              type="url"
              value={form.platformUrl || "https://ctf.stealthwormctf.sbs"}
              onChange={e => set("platformUrl", e.target.value)}
              placeholder="https://ctf.stealthwormctf.sbs"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Discord Support Link</label>
            <input
              className="cyber-input"
              type="url"
              value={form.discordUrl || "https://discord.com/invite/89tDPnqnqN"}
              onChange={e => set("discordUrl", e.target.value)}
              placeholder="https://discord.com/invite/..."
            />
          </div>
        </div>
      </div>

      {/* Google Forms Integration */}
      <div className="cyber-card rounded-xl p-5">
        <h3 className="text-sm font-display font-semibold text-cyber-400 mb-4 tracking-wide uppercase flex items-center gap-2">
          <Link2 size={14} /> Google Forms Integration
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Google Form CSV Export URL</label>
            <input 
              className="cyber-input" 
              type="url"
              value={form.googleFormURL || ""}
              onChange={e => set("googleFormURL", e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/xxx/export?format=csv"
            />
            <p className="text-xs text-slate-500 mt-2">
              📌 Right-click your Google Form → Go to responses → Click the Sheets icon → Right-click sheet name → See more → Publish to web → CSV → Copy link
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Auto-sync Interval (minutes)</label>
            <input 
              className="cyber-input" 
              type="number"
              min={5}
              max={1440}
              value={form.googleFormSyncInterval || 10}
              onChange={e => set("googleFormSyncInterval", Number(e.target.value))}
            />
            <p className="text-xs text-slate-500 mt-2">Auto-fetch and import teams from Google Form every N minutes</p>
            {form.googleFormLastSync && (
              <p className="text-xs text-cyber-400 mt-1">
                Last sync: {new Date(form.googleFormLastSync).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                if (!form.googleFormURL) { toast.error("Please enter Google Form URL first"); return; }
                toast.loading("Fetching and importing from Google Form...");
                try {
                  const response = await fetch(form.googleFormURL);
                  const csv = await response.text();
                  
                  // Parse CSV using the same logic as ImportView
                  const rows = parseCSV(csv);
                  if (rows.length === 0) {
                    toast.dismiss();
                    toast.error("No valid data found in Google Form");
                    return;
                  }
                  
                  // Import teams using the same logic as ImportView
                  const existing = new Set(teams.map(t => getUniqueKey(t)));
                  const newRows = rows.filter(r => !existing.has(getUniqueKey({ teamName: r["Team Name"] || "", leader: { sap: r["Leader SAP ID"] || "" } })));
                  
                  if (newRows.length === 0) {
                    toast.dismiss();
                    toast.success("No new teams to import — all responses already exist");
                    return;
                  }
                  
                  const toAdd = newRows.map((r, i) => rowToTeam(r, teams.length + i));
                  
                  // Import via API
                  const importResponse = await fetch("/api/import-teams", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ teams: toAdd }),
                  });
                  
                  if (!importResponse.ok) {
                    throw new Error("Failed to import teams");
                  }
                  
                  // Update last sync time
                  const updatedForm = { ...form, googleFormLastSync: new Date().toISOString() };
                  setForm(updatedForm);
                  await saveSettings(updatedForm);
                  
                  toast.dismiss();
                  toast.success(`Successfully imported ${toAdd.length} new team(s) from Google Form!`);
                  
                  // Refresh the page to show new teams
                  window.location.reload();
                } catch (error) {
                  toast.dismiss();
                  console.error("Google Form import error:", error);
                  toast.error("Failed to import from Google Form: " + error.message);
                }
              }}
              className="btn-cyber text-xs"
            >
              Test Fetch Now
            </button>
            <button 
              onClick={async () => {
                if (!form.googleFormEnabled || !form.googleFormURL) {
                  toast.error("Auto-sync must be enabled and Google Form URL must be set");
                  return;
                }
                toast.loading("Syncing from Google Form...");
                try {
                  const response = await fetch("/api/google-sync");
                  const data = await response.json();
                  
                  if (!response.ok) {
                    throw new Error(data.error || "Sync failed");
                  }
                  
                  // Update last sync time
                  const updatedForm = { ...form, googleFormLastSync: new Date().toISOString() };
                  setForm(updatedForm);
                  await saveSettings(updatedForm);
                  
                  toast.dismiss();
                  if (data.synced) {
                    toast.success(data.message);
                    // Refresh the page to show new teams
                    window.location.reload();
                  } else {
                    toast.success(data.message);
                  }
                } catch (error) {
                  toast.dismiss();
                  console.error("Google sync error:", error);
                  toast.error("Failed to sync: " + error.message);
                }
              }}
              className="btn-cyber text-xs"
              disabled={!form.googleFormEnabled}
            >
              Sync Now
            </button>
            <button 
              onClick={async () => {
                const updatedForm = { ...form, googleFormEnabled: !form.googleFormEnabled };
                setForm(updatedForm);
                try {
                  await saveSettings(updatedForm);
                  toast.success(`Auto-sync ${updatedForm.googleFormEnabled ? "enabled" : "disabled"}`);
                } catch (error) {
                  toast.error("Failed to update settings");
                }
              }}
              className={`btn-cyber text-xs ${form.googleFormEnabled ? "bg-green-900/50 border-green-700" : ""}`}
            >
              {form.googleFormEnabled ? "✓ Auto-sync Enabled" : "Auto-sync Disabled"}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Login */}
      <div className="cyber-card rounded-xl p-5">
        <h3 className="text-sm font-display font-semibold text-cyber-400 mb-4 tracking-wide uppercase flex items-center gap-2">
          <Shield size={14} /> Admin Login
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Username</label>
            <input className="cyber-input" value={form.adminUsername || ""} onChange={e => set("adminUsername", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Password</label>
            <div className="relative">
              <input 
                className="cyber-input pr-10" 
                type={showAdminPass ? "text" : "password"} 
                value={form.adminPassword || ""} 
                onChange={e => set("adminPassword", e.target.value)} 
              />
              <button type="button" onClick={() => setShowAdminPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyber-400">
                {showAdminPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button onClick={save} className="btn-cyber btn-cyber-solid px-6 py-2">
          <Save size={14} /> Save Settings
        </button>
        <button onClick={handleClear} className="btn-cyber btn-cyber-danger px-4 py-2">
          <Trash2 size={13} /> Clear All Data ({teamsCount} teams)
        </button>
      </div>
    </div>
  );
}