// components/FoodEditView.jsx
import { useState } from "react";
import { Search, Utensils, CheckCircle2, XCircle, Edit3, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function FoodEditView({ teams, settings, onUpdate }) {
  const [search, setSearch] = useState("");
  const [editingTeam, setEditingTeam] = useState(null);
  const [editData, setEditData] = useState({});

  const day1Label = settings.day1Label || "Day 1";
  const day2Label = settings.day2Label || "Day 2";
  const showDay2 = settings.numberOfDays >= 2;

  const filtered = teams.filter(t =>
    t.teamName.toLowerCase().includes(search.toLowerCase()) ||
    t.leader.name.toLowerCase().includes(search.toLowerCase()) ||
    t.tableNumber?.toString().includes(search)
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

  const startEdit = (team) => {
    setEditingTeam(team.id);
    setEditData({
      tableNumber: team.tableNumber || "",
      notes: team.notes || "",
      food: { ...team.food }
    });
  };

  const saveEdit = (teamId) => {
    onUpdate(teamId, {
      tableNumber: editData.tableNumber,
      notes: editData.notes,
      food: editData.food
    });
    setEditingTeam(null);
    setEditData({});
    toast.success("Changes saved");
  };

  const updateFoodEdit = (day, value) => {
    setEditData(prev => ({
      ...prev,
      food: { ...prev.food, [day]: value }
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold text-white">Food Edit & Management</h2>
        <div className="text-xs text-slate-500">
          {teams.filter(t => t.food?.day1).length} / {teams.length} fed on Day 1
          {showDay2 && ` • ${teams.filter(t => t.food?.day2).length} on Day 2`}
        </div>
      </div>

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="cyber-input pl-9 text-sm py-2 w-full"
          placeholder="Search team, leader, or table..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No teams found</div>
        ) : (
          filtered.map(team => (
            <div key={team.id} className="cyber-card rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-semibold text-white">{team.teamName}</div>
                  <div className="text-xs text-slate-400">{team.leader.name} • {team.campus}</div>
                  <div className="text-xs text-slate-500">Table: {team.tableNumber || "Not assigned"}</div>
                </div>
                <div className="flex gap-2">
                  {editingTeam === team.id ? (
                    <button
                      onClick={() => saveEdit(team.id)}
                      className="btn-cyber btn-cyber-solid text-xs py-1 px-2"
                    >
                      <Save size={12} /> Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(team)}
                      className="btn-cyber text-xs py-1 px-2"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  )}
                </div>
              </div>

              {editingTeam === team.id ? (
                <div className="space-y-3 border-t border-white/5 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Table Number</label>
                      <input
                        className="cyber-input text-xs py-1"
                        value={editData.tableNumber}
                        onChange={e => setEditData(prev => ({ ...prev, tableNumber: e.target.value }))}
                        placeholder="Table number"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Notes</label>
                      <input
                        className="cyber-input text-xs py-1"
                        value={editData.notes}
                        onChange={e => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={editData.food?.day1 || false}
                        onChange={e => updateFoodEdit("day1", e.target.checked)}
                        className="rounded"
                      />
                      {day1Label} Food
                    </label>
                    {showDay2 && (
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={editData.food?.day2 || false}
                          onChange={e => updateFoodEdit("day2", e.target.checked)}
                          className="rounded"
                        />
                        {day2Label} Food
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleFood(team.id, "day1")}
                    className={`btn-cyber px-4 py-2 text-xs ${team.food?.day1 ? "bg-amber-900/30 border-amber-400 text-amber-300" : ""}`}
                  >
                    <Utensils size={12} className="inline mr-1" />
                    {day1Label} {team.food?.day1 ? <CheckCircle2 size={12} className="inline ml-1" /> : <XCircle size={12} className="inline ml-1" />}
                  </button>

                  {showDay2 && (
                    <button
                      onClick={() => toggleFood(team.id, "day2")}
                      className={`btn-cyber px-4 py-2 text-xs ${team.food?.day2 ? "bg-amber-900/30 border-amber-400 text-amber-300" : ""}`}
                    >
                      <Utensils size={12} className="inline mr-1" />
                      {day2Label} {team.food?.day2 ? <CheckCircle2 size={12} className="inline ml-1" /> : <XCircle size={12} className="inline ml-1" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}