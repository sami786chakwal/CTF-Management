// components/FoodView.jsx
import { useState } from "react";
import { Search, Utensils } from "lucide-react";
import toast from "react-hot-toast";

export default function FoodView({ teams, settings, onUpdate }) {
  const [search, setSearch] = useState("");
  const day1Label = settings.day1Label || "Day 1";
  const day2Label = settings.day2Label || "Day 2";
  const showDay2 = settings.numberOfDays >= 2;

  const filtered = teams.filter(t =>
    t.teamName.toLowerCase().includes(search.toLowerCase()) ||
    t.leader.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFood = (teamId, day) => {
    const team = teams.find(t => t.id === teamId);
    if (!team?.attendance?.[day] && !team?.food?.[day]) {
      toast.error("Team must be checked in first");
      return;
    }
    onUpdate(teamId, { 
      food: { ...team.food, [day]: !team.food?.[day] } 
    });
    toast.success(!team.food?.[day] ? `Food given to ${team.teamName}` : `Food reversed for ${team.teamName}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold text-white">Food Distribution</h2>
        <div className="text-xs text-slate-500">
          {teams.filter(t => t.food?.day1).length} / {teams.length} fed on Day 1
          {showDay2 && ` • ${teams.filter(t => t.food?.day2).length} on Day 2`}
        </div>
      </div>

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="cyber-input pl-9 text-sm py-2 w-full"
          placeholder="Search team or leader..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No teams found</div>
        ) : (
          filtered.map(team => (
            <div key={team.id} className="cyber-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-semibold text-white">{team.teamName}</div>
                <div className="text-xs text-slate-400">{team.leader.name} • {team.campus}</div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleFood(team.id, "day1")}
                  className={`btn-cyber px-5 py-2 ${team.food?.day1 ? "bg-amber-900/30 border-amber-400 text-amber-300" : ""}`}
                >
                  <Utensils size={14} className="inline mr-1" /> 
                  {day1Label} {team.food?.day1 && "✓"}
                </button>

                {showDay2 && (
                  <button
                    onClick={() => toggleFood(team.id, "day2")}
                    className={`btn-cyber px-5 py-2 ${team.food?.day2 ? "bg-amber-900/30 border-amber-400 text-amber-300" : ""}`}
                  >
                    <Utensils size={14} className="inline mr-1" /> 
                    {day2Label} {team.food?.day2 && "✓"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}