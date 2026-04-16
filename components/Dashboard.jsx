// components/Dashboard.jsx
import { Users, UserCheck, UtensilsCrossed, ShieldCheck, Table2, Clock } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color = "text-cyber-400" }) {
  return (
    <div className="cyber-card rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color === "text-cyber-400" ? "bg-cyber-950/80" : "bg-slate-800/50"}`}
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1 font-body">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ teams, settings }) {
  const total = teams.length;
  const feeVerified = teams.filter(t => t.feeVerified).length;
  const ctfdRegistered = teams.filter(t =>
    !!(
      t.ctfdAccount?.team?.id ||
      t.ctfdAccount?.leader?.status === 'registered' ||
      t.ctfdAccount?.p2?.status === 'registered' ||
      t.ctfdAccount?.p3?.status === 'registered'
    )
  ).length;
  const day1 = teams.filter(t => t.attendance?.day1).length;
  const day2 = teams.filter(t => t.attendance?.day2).length;
  const foodDay1 = teams.filter(t => t.food?.day1).length;
  const foodDay2 = teams.filter(t => t.food?.day2).length;
  const tablesUsed = new Set(teams.map(t => t.tableNumber).filter(Boolean)).size;
  const totalPlayers = total * 3;
  const day1Players = day1 * 3;
  const showDay2 = settings.numberOfDays >= 2;

  const recentTeams = [...teams]
    .filter(t => t.registeredAt)
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    .slice(0, 5);

  const campusMap = {};
  teams.forEach(t => {
    const c = t.campus || "Unknown";
    campusMap[c] = (campusMap[c] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-white">{settings.eventName}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{settings.venue}</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Users} label="Total Teams" value={total} sub={`${totalPlayers} players`} color="text-cyber-400" />
        <StatCard icon={ShieldCheck} label="Fee Verified" value={feeVerified} sub={`${total - feeVerified} pending`} color="text-emerald-400" />
        <StatCard icon={ShieldCheck} label="CTFd Teams" value={ctfdRegistered} sub="Registered on CTFd" color="text-sky-400" />
        <StatCard icon={UserCheck} label={`${settings.day1Label || "Day 1"} Present`} value={day1} sub={`${day1Players} players`} color="text-blue-400" />
        {showDay2 && <StatCard icon={UserCheck} label={`${settings.day2Label || "Day 2"} Present`} value={day2} sub={`${day2 * 3} players`} color="text-violet-400" />}
        <StatCard icon={UtensilsCrossed} label="Food Given" value={showDay2 ? `${foodDay1}/${foodDay2}` : foodDay1.toString()} sub={showDay2 ? "Day1/Day2 teams" : "Day1 teams"} color="text-amber-400" />
        <StatCard icon={Table2} label="Tables Used" value={tablesUsed} sub={`of ${settings.totalTables} total`} color="text-rose-400" />
      </div>

      {/* Two column lower */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Campus breakdown */}
        <div className="cyber-card rounded-xl p-4">
          <h3 className="text-sm font-display font-semibold text-cyber-400 mb-3 tracking-wide uppercase">Campus Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(campusMap).map(([campus, count]) => (
              <div key={campus} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 truncate">{campus}</span>
                    <span className="text-cyber-400 font-mono ml-2">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyber-500 rounded-full transition-all duration-500"
                      style={{ width: `${total > 0 ? (count / total * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(campusMap).length === 0 && (
              <p className="text-xs text-slate-600">No teams imported yet</p>
            )}
          </div>
        </div>

        {/* Recent registrations */}
        <div className="cyber-card rounded-xl p-4">
          <h3 className="text-sm font-display font-semibold text-cyber-400 mb-3 tracking-wide uppercase">
            Recent Registrations
          </h3>
          <div className="space-y-2">
            {recentTeams.length === 0 && (
              <p className="text-xs text-slate-600">No teams yet</p>
            )}
            {recentTeams.map(t => (
              <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm text-white font-medium">{t.teamName}</div>
                  <div className="text-xs text-slate-500">{t.leader.name} · {t.campus?.split(" ")[0]}</div>
                </div>
                <div className="text-right">
                  <span className={`badge ${t.feeVerified ? "badge-verified" : "badge-pending"}`}>
                    {t.feeVerified ? "✓ Verified" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Attendance summary bar */}
      {total > 0 && (
        <div className="cyber-card rounded-xl p-4">
          <h3 className="text-sm font-display font-semibold text-cyber-400 mb-4 tracking-wide uppercase">
            Attendance Overview
          </h3>
          <div className="space-y-3">
            {[
              { label: settings.day1Label || "Day 1", present: day1, absent: total - day1, food: foodDay1 },
              { label: settings.day2Label || "Day 2", present: day2, absent: total - day2, food: foodDay2 },
            ].map(row => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-display font-medium">{row.label}</span>
                  <div className="flex gap-3 text-slate-500">
                    <span className="text-cyber-400">{row.present} present</span>
                    <span className="text-red-400">{row.absent} absent</span>
                    <span className="text-amber-400">{row.food} fed</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-cyber-500 transition-all duration-500"
                    style={{ width: `${total > 0 ? (row.present / total * 100) : 0}%` }} />
                  <div className="h-full bg-amber-500/60 transition-all duration-500"
                    style={{ width: `${total > 0 ? ((row.food) / total * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
