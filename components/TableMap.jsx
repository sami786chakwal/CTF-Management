// components/TableMap.jsx
import { useState } from "react";
import { Edit3, X, Save, Users, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function TableMap({ teams, settings, onUpdate }) {
  const total = settings.totalTables || 20;
  const [editing, setEditing] = useState(null); // tableNum
  const [assignTeam, setAssignTeam] = useState("");

  // Map table number to team
  const tableMap = {};
  teams.forEach(t => {
    if (t.tableNumber) {
      tableMap[t.tableNumber] = t;
    }
  });

  const unassigned = teams.filter(t => !t.tableNumber);

  const handleAssign = (tableNum) => {
    if (!assignTeam) { toast.error("Select a team first"); return; }
    // Clear old table for this team
    const oldTeam = teams.find(t => t.id === assignTeam);
    if (oldTeam?.tableNumber) {
      onUpdate(oldTeam.id, { tableNumber: "" });
    }
    // Remove any team already on this table
    const existing = tableMap[tableNum];
    if (existing) {
      onUpdate(existing.id, { tableNumber: "" });
    }
    onUpdate(assignTeam, { tableNumber: String(tableNum) });
    setEditing(null);
    setAssignTeam("");
    toast.success(`${oldTeam?.teamName} → Table ${tableNum}`);
  };

  const handleClear = (tableNum) => {
    const t = tableMap[tableNum];
    if (!t) return;
    onUpdate(t.id, { tableNumber: "" });
    toast.success(`Table ${tableNum} cleared`);
  };

  const tables = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold text-white">Table Map</h2>
        <div className="flex gap-3 text-xs text-slate-500">
          <span><span className="inline-block w-3 h-3 rounded bg-cyber-800 border border-cyber-500/40 mr-1" />Occupied</span>
          <span><span className="inline-block w-3 h-3 rounded bg-slate-800 border border-slate-700 mr-1" />Empty</span>
        </div>
      </div>

      {/* Unassigned teams quick bar */}
      {unassigned.length > 0 && (
        <div className="cyber-card rounded-xl p-3">
          <div className="text-xs font-display font-semibold text-amber-400 mb-2 tracking-wide uppercase">
            Unassigned Teams ({unassigned.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unassigned.map(t => (
              <span key={t.id} className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                {t.teamName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {tables.map(num => {
          const occupied = tableMap[String(num)];
          const isEditing = editing === num;

          return (
            <div
              key={num}
              className={`rounded-lg border p-2.5 cursor-pointer transition-all relative group
                ${occupied
                  ? "bg-cyber-950/60 border-cyber-500/35 hover:border-cyber-400/60"
                  : "bg-slate-900/60 border-slate-700/50 hover:border-slate-600"
                }
              `}
              style={{ minHeight: 80 }}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-mono text-slate-500">T-{num}</span>
                {occupied && (
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(num); setAssignTeam(""); }}
                      className="text-slate-500 hover:text-cyber-400 p-0.5"
                    >
                      <Edit3 size={9} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClear(num); }}
                      className="text-slate-500 hover:text-red-400 p-0.5"
                    >
                      <X size={9} />
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-1.5" onClick={e => e.stopPropagation()}>
                  <select
                    className="cyber-input text-xs py-1 w-full"
                    value={assignTeam}
                    onChange={e => setAssignTeam(e.target.value)}
                    autoFocus
                  >
                    <option value="">Pick team...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.teamName}</option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button onClick={() => handleAssign(num)} className="btn-cyber btn-cyber-solid text-xs py-0.5 px-2 flex-1 justify-center">
                      <Save size={9} />
                    </button>
                    <button onClick={() => setEditing(null)} className="btn-cyber text-xs py-0.5 px-2">
                      <X size={9} />
                    </button>
                  </div>
                </div>
              ) : occupied ? (
                <div>
                  <div className="text-xs text-cyber-300 font-display font-semibold leading-tight truncate">
                    {occupied.teamName}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{occupied.leader.name}</div>
                  <div className="flex gap-1 mt-1.5">
                    {occupied.attendance?.day1 && <span className="text-xs text-cyber-500">●D1</span>}
                    {occupied.attendance?.day2 && <span className="text-xs text-violet-500">●D2</span>}
                  </div>
                </div>
              ) : (
                <button
                  className="w-full text-xs text-slate-600 hover:text-cyber-400 transition-colors py-1"
                  onClick={() => { setEditing(num); setAssignTeam(""); }}
                >
                  <Users size={12} className="mx-auto mb-0.5" />
                  Assign
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="text-xs text-slate-500 font-mono text-right">
        {Object.keys(tableMap).length}/{total} tables occupied
      </div>
    </div>
  );
}
