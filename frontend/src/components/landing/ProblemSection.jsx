import React from 'react';
import {
  FileText,
  Users,
  MapPin,
  CloudSun,
  Briefcase,
  Calendar,
  Layers,
  Sparkles,
  ArrowDown
} from 'lucide-react';

export const ProblemSection = () => {
  const problemNodes = [
    { label: 'SCRIPT', icon: FileText, desc: 'Scene Changes & Dialogue Beats', color: 'text-amber-400', border: 'border-amber-500/30' },
    { label: 'ACTORS', icon: Users, desc: 'Call Times & Talent Availability', color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { label: 'LOCATION', icon: MapPin, desc: 'Permits, Power & Soundstage B', color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'WEATHER', icon: CloudSun, desc: 'Rain Threat & Light Windows', color: 'text-rose-400', border: 'border-rose-500/30' },
    { label: 'CREW', icon: Briefcase, desc: 'Gaffers, Camera Ops & Sound', color: 'text-purple-400', border: 'border-purple-500/30' },
    { label: 'SCHEDULE', icon: Calendar, desc: 'Call Sheets & Turnaround Times', color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { label: 'CONTINUITY', icon: Layers, desc: 'Costume Props & Eyelines', color: 'text-amber-300', border: 'border-amber-500/30' }
  ];

  return (
    <section id="product" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold tracking-wider mb-6">
        <span>THE PRODUCTION CHALLENGE</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-slate-100 max-w-3xl mx-auto leading-tight">
        Film production is a <span className="text-rose-400">coordination problem.</span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
        A single scene can depend on actors, locations, weather, permits, crew availability, equipment, schedules and continuity. When one variable changes, the entire production can be affected.
      </p>

      {/* Disconnected Variables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 text-left">
        {problemNodes.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`cinema-glass p-5 rounded-2xl border ${item.border} hover:border-amber-400/50 transition-all duration-300 group`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  VARIABLE {i + 1}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-100 font-mono tracking-wider">{item.label}</h3>
              <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
            </div>
          );
        })}

        <div className="cinema-glass p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-tr from-amber-500/10 to-transparent flex flex-col justify-center items-center text-center">
          <Sparkles className="w-6 h-6 text-amber-400 mb-1 animate-spin" />
          <h3 className="text-xs font-bold text-amber-300 font-mono">100+ VARIABLES</h3>
          <p className="text-[10px] text-slate-400">Interdependent Production Factors</p>
        </div>
      </div>

      {/* Connection Transition Banner */}
      <div className="mt-16 p-8 rounded-3xl cinema-glass border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-cyan-500/10 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-['Cinzel'] text-slate-100">
            MovieOS connects them into <span className="bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">one intelligent production system.</span>
          </h3>
          <p className="text-xs text-slate-300">
            Real-time intelligence flow between screenplay breakdown, cast availability, weather risk, and shooting schedules.
          </p>
        </div>
      </div>
    </section>
  );
};
