import { useState } from "react";
import { Lock, Terminal } from "lucide-react";

export default function LoginPage({ onLogin, settings }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const adminUsername = settings?.adminUsername || "admin";
    const adminPassword = settings?.adminPassword || "ctf2026";

    if (form.username === adminUsername && form.password === adminPassword) {
      setErr("");
      onLogin();
    } else {
      setErr("Invalid credentials");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center px-4">
      <div className={`w-full max-w-sm transition-transform ${shake ? "animate-bounce" : ""}`}>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-cyan-950 border border-cyan-500/30">
            <Terminal size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">CTF Management</h1>
        </div>

        <div className="bg-[#12161f] border border-cyan-500/20 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Username</label>
              <input
                className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg px-4 py-3 text-white"
                type="text"
                placeholder={settings?.adminUsername || "admin"}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Password</label>
              <input
                className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg px-4 py-3 text-white"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {err && <div className="text-red-400 text-sm">{err}</div>}

            <button 
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-medium text-white"
            >
              LOGIN
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; 2026 CTF Management System
        </p>
      </div>
    </div>
  );
}
