import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  MapPin,
  Users,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Play
} from 'lucide-react';

export const ProductionCommandCenter = () => {
  const [approved, setApproved] = useState(false);
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 relative group">
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-cyan-500/30 to-purple-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      {/* Main Terminal Frame */}
      <div className="relative cinema-glass rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden bg-[#0a0e17]/90 text-left">
        {/* Terminal Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-2 border-l border-slate-800">
              MOVIEOS // PRODUCTION INTELLIGENCE COMMAND
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>
        </div>

        {/* Command Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Active Scene Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  SCENE 18 • EXT. NIGHT
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  Chennai Coast Line
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-100 font-['Cinzel'] tracking-wide">
                STORM SEQUENCE — CLIMACTIC SHORE REHEARSAL
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                WEATHER ALERT DETECTED
              </span>
            </div>
          </div>

          {/* Specialized Agents Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Weather Agent */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-rose-500/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Weather Agent</p>
                <p className="text-xs font-bold text-rose-400 mt-0.5">High Rain Risk (92%)</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
            </div>

            {/* Research Agent */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Research Agent</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">Coastal Permits Verified</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Casting Agent */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Casting Agent</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">Lead Cast Available</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Location Agent */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Location Agent</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">Soundstage B Ready</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Schedule Agent */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Scheduling Agent</p>
                <p className="text-xs font-bold text-amber-300 mt-0.5">Optimizing Slot</p>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            </div>

            {/* Continuity Agent */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Continuity Judge</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">No Costume Conflicts</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Master Orchestrator Recommendation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-amber-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                  AI RECOMMENDATION #802
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Master Orchestrator Synthesis</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-100">
                  Reschedule Scene 18 to Indoor Soundstage B
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Proposed Shooting Window: Tomorrow • 08:00 AM IST (Saves $42,500 in rain delay budget)
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => alert("Simulation Review: Weather risk 92% mitigated by moving shoot to Soundstage B tomorrow 08:00 AM.")}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  Review Details
                </button>
                <button
                  onClick={() => setApproved(!approved)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                    approved
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  }`}
                >
                  {approved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved & Synced</span>
                    </>
                  ) : (
                    <span>Approve Decision</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
