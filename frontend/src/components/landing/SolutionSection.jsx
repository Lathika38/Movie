import React from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  CloudSun,
  Users,
  Calendar,
  ShieldCheck
} from 'lucide-react';

export const SolutionSection = () => {
  const agentsList = [
    { name: 'Script Intelligence', role: 'Screenplay Parsing & Beat Breakdown', icon: Cpu, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { name: 'Weather Risk', role: 'OpenWeather Coastal Radar', icon: CloudSun, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { name: 'Parallel Research', role: 'Real-world Location & Permit Search', icon: Search, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Casting Agent', role: 'Talent Match & Offer Dispatch', icon: Users, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { name: 'Character Design', role: 'Visual Persona & Costume Direction', icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Scheduling & Logistics', role: 'Turnaround Times & Call Sheets', icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { name: 'Continuity Judge', role: 'Eyeline & Props Audit', icon: ShieldCheck, color: 'text-amber-300', bg: 'bg-amber-500/10' },
    { name: 'Production Coordinator', role: 'Department Operational Synthesis', icon: Layers, color: 'text-cyan-300', bg: 'bg-cyan-500/10' }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>MULTI-AGENT ORCHESTRATION</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-slate-100 max-w-4xl mx-auto leading-tight">
        One production brain. <br />
        <span className="bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Multiple specialized agents.
        </span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
        MovieOS coordinates specialized AI agents that focus on different production challenges while an orchestration layer combines their findings into actionable recommendations.
      </p>

      {/* Central MovieOS Brain Diagram */}
      <div className="mt-16 relative cinema-glass p-8 sm:p-12 rounded-3xl border border-slate-800 bg-[#090d16]/90">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Column Agents */}
          <div className="space-y-4 text-left">
            {agentsList.slice(0, 4).map((ag, i) => {
              const Icon = ag.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <div className={`p-2.5 rounded-xl ${ag.bg} shrink-0`}>
                    <Icon className={`w-5 h-5 ${ag.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {ag.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ag.role}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Central MOVIEOS Master Core */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-cyan-500/20 border-2 border-amber-500/50 shadow-2xl text-center space-y-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-400 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-amber-500/30">
              <Zap className="w-8 h-8 fill-slate-950" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                MASTER ORCHESTRATOR
              </span>
              <h3 className="text-2xl font-black text-slate-100 font-['Cinzel'] mt-2">
                MOVIE<span className="text-amber-400">OS</span> CORE
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Synthesizes all 10 specialized agent outputs into single-click production decisions.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-[10px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Agent Consensus Active</span>
            </div>
          </div>

          {/* Right Column Agents */}
          <div className="space-y-4 text-left">
            {agentsList.slice(4, 8).map((ag, i) => {
              const Icon = ag.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/40 transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <div className={`p-2.5 rounded-xl ${ag.bg} shrink-0`}>
                    <Icon className={`w-5 h-5 ${ag.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {ag.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ag.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
