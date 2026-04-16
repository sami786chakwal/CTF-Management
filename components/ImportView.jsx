// components/ImportView.jsx
import { useState, useRef } from "react";
import { Upload, FileText, Check, AlertCircle, X } from "lucide-react";
import { parseCSV, rowToTeam, getUniqueKey } from "../lib/store";
import toast from "react-hot-toast";

export default function ImportView({ teams, onImport }) {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const processFile = (file) => {
    if (!file || !file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target.result);
        const existing = new Set(teams.map(t => getUniqueKey(t)));
        const newRows = rows.filter(r => !existing.has(getUniqueKey({ teamName: r["Team Name"] || "", leader: { sap: r["Leader SAP ID"] || "" } })));
        const dupeRows = rows.filter(r => existing.has(getUniqueKey({ teamName: r["Team Name"] || "", leader: { sap: r["Leader SAP ID"] || "" } })));
        setPreview({ rows, newRows, dupeRows, file: file.name });
      } catch (err) {
        toast.error("Failed to parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!preview) return;
    const existing = new Set(teams.map(t => getUniqueKey(t)));
    const toAdd = preview.rows
      .filter(r => !existing.has(getUniqueKey({ teamName: r["Team Name"] || "", leader: { sap: r["Leader SAP ID"] || "" } })))
      .map((r, i) => rowToTeam(r, teams.length + i));
    onImport(toAdd);
    toast.success(`Imported ${toAdd.length} new team(s)`);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
        <Upload size={18} className="text-cyber-400" /> Import Teams (CSV)
      </h2>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
          ${dragging ? "border-cyber-400 bg-cyber-950/40" : "border-slate-700 hover:border-cyber-600 hover:bg-cyber-950/20"}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); }}
      >
        <Upload size={32} className="mx-auto mb-3 text-slate-600" />
        <p className="text-white font-display font-medium mb-1">Drop CSV file here</p>
        <p className="text-sm text-slate-500">or click to browse — Google Form responses format supported</p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => processFile(e.target.files[0])} />
      </div>

      {/* Preview */}
      {preview && (
        <div className="cyber-card rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-cyber-400" />
              <span className="text-sm font-display font-semibold text-white">{preview.file}</span>
            </div>
            <button onClick={() => setPreview(null)} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900/60 rounded-lg p-3">
              <div className="text-xl font-display font-bold text-white">{preview.rows.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">Total in file</div>
            </div>
            <div className="bg-cyber-950/60 rounded-lg p-3 border border-cyber-800/40">
              <div className="text-xl font-display font-bold text-cyber-400">{preview.newRows.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">New teams</div>
            </div>
            <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-800/30">
              <div className="text-xl font-display font-bold text-amber-400">{preview.dupeRows.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">Already exist</div>
            </div>
          </div>

          {preview.newRows.length > 0 && (
            <div>
              <p className="text-xs font-display font-semibold text-cyber-400 mb-2 tracking-wide uppercase">New teams to be added:</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {preview.newRows.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/5">
                    <Check size={11} className="text-cyber-400 flex-shrink-0" />
                    <span className="text-white font-medium">{r["Team Name"]}</span>
                    <span className="text-slate-500">{r["Leader Name"]}</span>
                    <span className="text-slate-600 font-mono">SAP: {r["Leader SAP ID"]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.dupeRows.length > 0 && (
            <div>
              <p className="text-xs font-display font-semibold text-amber-400 mb-2 tracking-wide uppercase flex items-center gap-1.5">
                <AlertCircle size={11} /> Duplicates (will be skipped):
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {preview.dupeRows.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 opacity-50">
                    <X size={11} className="text-amber-400 flex-shrink-0" />
                    <span className="text-slate-400">{r["Team Name"]}</span>
                    <span className="text-slate-600 font-mono">SAP: {r["Leader SAP ID"]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.newRows.length === 0 ? (
            <div className="text-sm text-amber-400 bg-amber-950/30 border border-amber-800/30 rounded-lg px-4 py-3">
              All {preview.rows.length} teams in this file already exist. Nothing to import.
            </div>
          ) : (
            <button onClick={confirmImport} className="btn-cyber btn-cyber-solid w-full justify-center py-2.5 font-display font-semibold">
              <Upload size={14} /> Import {preview.newRows.length} New Team(s)
            </button>
          )}
        </div>
      )}

      {/* Format reference */}
      <div className="cyber-card rounded-xl p-4">
        <p className="text-xs font-display font-semibold text-slate-400 mb-3 tracking-widest uppercase">Expected CSV Columns</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {["Timestamp", "CAMPUS", "Team Name", "Leader Name", "Leader SAP ID", "Leader Gmail",
            "Leader Contact Number", "Player 2 Name", "Player 2 SAP ID", "Player 2 Gmail",
            "Player 3 Name", "Player 3 SAP ID", "Player 3 Gmail", "Semester"].map(col => (
            <div key={col} className="text-xs font-mono bg-slate-900/60 rounded px-2 py-1 text-cyber-400 truncate">
              {col}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">Compatible with Google Forms CSV export format. Extra columns are ignored.</p>
      </div>
    </div>
  );
}
