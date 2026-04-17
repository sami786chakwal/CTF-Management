// pages/index.js - CLEAN FINAL VERSION
import { useState, useEffect } from "react";
import Head from "next/head";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Users, TableProperties, BarChart3,
  Settings, Upload, LogOut, Terminal, Menu, X, UtensilsCrossed, Shield
} from "lucide-react";

import LoginPage from "../components/LoginPage";
import Dashboard from "../components/Dashboard";
import TeamsView from "../components/TeamsView";
import TableMap from "../components/TableMap";
import Reports from "../components/Reports";
import SettingsView from "../components/SettingsView";
import ImportView from "../components/ImportView";
import EmailModal from "../components/EmailModal";
import FoodView from "../components/FoodView";

import { loadTeams, loadSettings, updateTeamAPI, deleteTeamAPI, importTeamsAPI, clearAllTeams } from "../lib/store";
import { database, ref, onValue } from '../lib/firebase';
import { DEFAULT_SETTINGS } from "../pages/api/settings";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "teams", label: "Teams", icon: Users },
  { key: "food", label: "Food", icon: UtensilsCrossed },
  { key: "import", label: "Import CSV", icon: Upload },
  { key: "tablemap", label: "Table Map", icon: TableProperties },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [teams, setTeams] = useState([]);
  const [settings, setSettings] = useState({});
  const [emailModal, setEmailModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Firebase real-time listeners will handle all data loading and updates
  useEffect(() => {
    const teamsRef = ref(database, 'teams');
    const settingsRef = ref(database, 'settings');

    const unsubscribeTeams = onValue(teamsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const teamsArray = data ? Object.values(data) : [];
        console.log('Teams updated from Firebase:', teamsArray.length, 'teams');
        setTeams(teamsArray);
      } catch (error) {
        console.error('Error updating teams from Firebase:', error);
        setTeams([]); // Fallback to empty array
      }
    }, (error) => {
      console.error('Firebase teams listener error:', error);
      setTeams([]); // Fallback to empty array
    });

    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const newSettings = { ...DEFAULT_SETTINGS, ...data };
        console.log('Settings updated from Firebase:', newSettings);
        setSettings(newSettings);
      } catch (error) {
        console.error('Error updating settings from Firebase:', error);
        setSettings(DEFAULT_SETTINGS); // Fallback to defaults
      }
    }, (error) => {
      console.error('Firebase settings listener error:', error);
      setSettings(DEFAULT_SETTINGS); // Fallback to defaults
    });

    return () => {
      console.log('Unsubscribing from Firebase listeners');
      unsubscribeTeams();
      unsubscribeSettings();
    };
  }, []);

  useEffect(() => {
    if (!loggedIn || !settings.googleFormEnabled || !settings.googleFormURL) {
      return;
    }

    const syncIntervalMs = Math.max(Number(settings.googleFormSyncInterval) || 10, 5) * 60 * 1000;

    const runAutoSync = async () => {
      try {
        console.log("Running Google Form auto-sync...");
        const response = await fetch("/api/google-sync");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Auto-sync failed");
        }

        if (data.synced) {
          toast.success(`Auto-synced ${data.newTeams} new team(s) from Google Form`, { duration: 3000 });
        }
      } catch (error) {
        console.error("Google Form auto-sync failed:", error);
      }
    };

    const interval = setInterval(runAutoSync, syncIntervalMs);
    return () => clearInterval(interval);
  }, [loggedIn, settings.googleFormEnabled, settings.googleFormURL, settings.googleFormSyncInterval]);

  const updateTeam = async (id, patch) => {
    try {
      await updateTeamAPI(id, patch);
      // Firebase real-time listener will automatically update the state
    } catch (error) {
      console.error("Failed to update team:", error);
      toast.error("Failed to update team");
    }
  };

  const deleteTeam = async (id) => {
    if (!confirm("Remove this team?")) return;
    try {
      await deleteTeamAPI(id);
      // Firebase real-time listener will automatically update the state
    } catch (error) {
      console.error("Failed to delete team:", error);
      toast.error("Failed to delete team");
    }
  };

  const importTeams = async (newTeams) => {
    try {
      await importTeamsAPI(newTeams);
      // Firebase real-time listener will automatically update the state
    } catch (error) {
      console.error("Failed to import teams:", error);
      toast.error("Failed to import teams");
    }
  };

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} settings={settings} />;
  }

  return (
    <>
      <Head>
        <title>{settings.eventName || "CTF Management System"}</title>
      </Head>

      <div className="scan-line" />

      <div className="min-h-screen grid-bg flex">

        {/* Sidebar */}
        <aside className={`fixed md:sticky top-0 left-0 h-screen w-56 bg-[#12161f] border-r border-cyan-900/40 flex flex-col z-50 transition-all ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Terminal size={20} className="text-cyan-400" />
              <div className="font-bold text-white">CTF Manager</div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {NAV.map(item => (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                className={`nav-item w-full flex items-center gap-3 ${tab === item.key ? 'active' : ''}`}
              >
                <item.icon size={16} />
                {item.label}
                {item.key === "teams" && <span className="ml-auto text-xs text-slate-500">({teams.length})</span>}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-white/5">
            <button onClick={() => setLoggedIn(false)} className="nav-item w-full text-red-400">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {tab === "dashboard" && <Dashboard teams={teams} settings={settings} />}
          {tab === "teams" && <TeamsView teams={teams} settings={settings} onUpdate={updateTeam} onDelete={deleteTeam} onEmailOpen={(team, initialTab = "confirmation") => setEmailModal({ team, initialTab })} />}
          {tab === "food" && <FoodView teams={teams} settings={settings} onUpdate={updateTeam} />}
          {tab === "import" && <ImportView teams={teams} onImport={importTeams} />}
          {tab === "tablemap" && <TableMap teams={teams} settings={settings} onUpdate={updateTeam} />}
          {tab === "reports" && <Reports teams={teams} settings={settings} />}
          {tab === "settings" && <SettingsView settings={settings} onSave={setSettings} onClearAll={async () => { await clearAllTeams(); setTeams([]); }} teamsCount={teams.length} teams={teams} />}
        </main>
      </div>

      {emailModal && <EmailModal team={emailModal.team} initialTab={emailModal.initialTab} settings={settings} onClose={() => setEmailModal(null)} onMarkSent={(id, type) => updateTeam(id, { emailSent: { ...teams.find(t => t.id === id)?.emailSent, [type]: true } })} />}
    </>
  );
}
