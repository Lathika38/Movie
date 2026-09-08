import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, UserCheck, Bot } from 'lucide-react';

export const HumanInLoop = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold tracking-wider mb-6">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>HUMAN-IN-THE-LOOP ARCHITECTURE</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black font-['Cinzel'] text-slate-100 max-w-3xl mx-auto leading-tight">
        AI recommends. <br />
        <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
          Filmmakers decide.
        </span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
        MovieOS is designed to augment filmmakers—not replace them. AI agents analyze complex production information and provide recommendations while producers and directors remain in complete control of critical decisions.
      </p>

      {/* Human-in-the-loop Trust Flow Diagram */}
      <div className="mt-14 cinema-glass p-8 sm:p-12 rounded-3xl border border-slate-800 bg-[#090d17]/95 text-center shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
          {/* Box 1: AI Agents */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center w-full md:w-48 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 font-mono">10 AI AGENTS</h4>
            <p className="text-[10px] text-slate-400">Domain Intelligence</p>
          </div>

          <ArrowRight className="w-5 h-5 text-amber-400 hidden md:block" />

          {/* Box 2: Analysis & Synthesis */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center w-full md:w-48 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 font-mono">ANALYSIS</h4>
            <p className="text-[10px] text-slate-400">Constraint Audits</p>
          </div>

          <ArrowRight className="w-5 h-5 text-amber-400 hidden md:block" />

          {/* Box 3: Recommendation */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center w-full md:w-48 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 font-mono">RECOMMENDATION</h4>
            <p className="text-[10px] text-slate-400">Actionable Proposal</p>
          </div>

          <ArrowRight className="w-5 h-5 text-amber-400 hidden md:block" />

          {/* Box 4: Filmmaker Decision */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-slate-900 to-amber-500/20 border-2 border-emerald-500/50 text-center w-full md:w-56 space-y-2 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-100 font-mono">PRODUCER / DIRECTOR</h4>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[9px]">APPROVE</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[9px]">MODIFY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SparklesIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
